// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
    badRequestResponse,
    serverErrorResponse,
    okResponse,
    structuredLog,
    getRequestId,
} from "../_lib/security.ts";
import { DEFAULT_PRICING_CONFIG, mergeConfig, sanitizeFormData, calculateEstimate, scoreLead, UUID_RE } from "./pricing.ts";

// Public endpoint: rate limit generously but still protect.
const FN = "submit-estimate";
const RATE_OPTS = { bucket: "submit-estimate", max: 20, windowMs: 60_000 };

Deno.serve(async (req: Request) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    // Rate limit by IP before any processing
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return badRequestResponse(req, "Invalid request body", {}, requestId);
        }
        const { discoveryContext, alcsRecommendation } = body;
        const submissionId = typeof body.submissionId === "string" && UUID_RE.test(body.submissionId) ? body.submissionId : null;

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Pricing is admin-managed in estimator_flow_config (key "pricing"), the same row the
        // public estimator and the admin Pricing & Settings page read. The former estimate_rates
        // table never existed in production, so this used to fall back to defaults silently.
        let pricingConfig = DEFAULT_PRICING_CONFIG;
        const { data: pricingRow, error: pricingError } = await supabase
            .from('estimator_flow_config')
            .select('data')
            .eq('key', 'pricing')
            .maybeSingle();

        if (pricingError) {
            console.error(`[${FN}] pricing config lookup failed, using defaults:`, pricingError.message);
        } else if (pricingRow?.data) {
            pricingConfig = mergeConfig(DEFAULT_PRICING_CONFIG, pricingRow.data);
        }

        const sanitized = sanitizeFormData(body.formData, pricingConfig);
        if (!sanitized.data) {
            return badRequestResponse(req, sanitized.error ?? "Invalid form data", {}, requestId);
        }
        const formData = sanitized.data;

        // Calculate true values on server, defeating client-side overrides
        const estimate = calculateEstimate(formData, pricingConfig);
        const score = scoreLead(formData, pricingConfig);

        const leadRow = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: `Cost estimate generated. Min: ₹${estimate.total.min.toLocaleString('en-IN')}, Max: ₹${estimate.total.max.toLocaleString('en-IN')}. Area: ${formData.area} sqft, Type: ${formData.propertyType}`,
            lead_source: 'estimator',
            source: 'estimator',
            city: formData.city,
            budget: formData.budgetAmount?.toString(),
            project_type: formData.selectedService,
            score: score.total,
            score_details: score.breakdown,
            // Estimator-specific columns (merged from former estimate_leads table)
            area: formData.area,
            city_tier: formData.cityTier,
            property_type: formData.propertyType,
            state: formData.state,
            start_timing: formData.startTiming,
            estimated_min: estimate.total.min,
            estimated_max: estimate.total.max,
            lead_score: score.total,
            estimate_breakdown: {
                designCost: estimate.designCost,
                gstOnDesign: estimate.gstOnDesign,
                supervisionCost: estimate.supervisionCost,
                extraVisitsCost: estimate.extraVisitsCost,
                executionCost: estimate.executionCost,
                contingency: estimate.contingency,
                pmFee: estimate.pmFee,
                addonCost: estimate.addonCost,
            },
            internal_notes: {
                execution_tier: formData.executionTier ?? null,
                bhk: formData.bhk ?? null,
                score_category: score.category,
                score_breakdown: score.breakdown,
            },
            // ——— PHASE 13: Discovery Intelligence ———
            // Populated when user completes Discovery quiz before Estimator.
            // Null when user reaches Estimator directly (no discovery session).
            discovery_archetype: discoveryContext?.archetype ?? null,
            discovery_confidence: discoveryContext?.archetypeConfidence ?? null,
            discovery_emotional_goal: discoveryContext?.emotionalGoal ?? null,
            discovery_lifestyle: discoveryContext?.lifestyle ?? null,
            discovery_priorities: discoveryContext?.priorities ?? null,
            discovery_sensory: discoveryContext?.sensory ?? null,
            discovery_contradictions: discoveryContext?.contradictions ?? null,

            // ——— PHASE 15: ALCS Recommendation & Explainability ———
            alcs_execution_path: alcsRecommendation?.executionPath ?? null,
            alcs_confidence: alcsRecommendation?.confidence ?? null,
            alcs_reasoning: alcsRecommendation?.reasoning ?? null,
            alcs_evidence: alcsRecommendation?.evidence ?? null,
            alcs_primary_drivers: alcsRecommendation?.primaryDrivers ?? null,
        };

        // Same calculator session (Back -> Results, reload, retry): update the lead it
        // already created. Only when the id, email and source all match and the lead
        // is fresh, so a leaked id can't be used to overwrite someone else's lead.
        let leadId: string | undefined;
        let isNewLead = true;
        if (submissionId) {
            const { data: existing } = await supabase
                .from("leads")
                .select("id, email, lead_source, created_at")
                .eq("id", submissionId)
                .maybeSingle();
            const fresh = existing?.created_at && Date.now() - new Date(existing.created_at).getTime() < 24 * 60 * 60 * 1000;
            if (existing && existing.lead_source === "estimator" && existing.email?.toLowerCase() === formData.email && fresh) {
                const { error: errUpdate } = await supabase.from("leads").update(leadRow).eq("id", submissionId);
                if (errUpdate) {
                    structuredLog("error", FN, "Lead Update Error", { error: errUpdate.message }, requestId);
                    throw errUpdate;
                }
                leadId = submissionId;
                isNewLead = false;
            }
        }

        if (isNewLead) {
            const reuseId = submissionId && !(await supabase.from("leads").select("id").eq("id", submissionId).maybeSingle()).data;
            const { data: insertedLead, error: errInsert } = await supabase
                .from("leads")
                .insert(reuseId ? { ...leadRow, id: submissionId } : leadRow)
                .select("id")
                .single();
            if (errInsert) {
                structuredLog("error", FN, "Lead Insert Error", { error: errInsert.message, details: errInsert.details }, requestId);
                throw errInsert;
            }
            leadId = (insertedLead as { id?: string } | null)?.id;
        }

        if (leadId && isNewLead) {
            // Insert into decision_events to maintain decision/replay chain
            const { error: decisionErr } = await supabase.from("decision_events").insert({
                lead_id: leadId,
                session_id: discoveryContext?.userId || null,
                event_type: "Proposal",
                payload: {
                    clientDecision: "Estimate Generated",
                    outcome: "Estimator direct submission",
                    recommendations: [],
                    metadata: {
                        totalMin: estimate.total.min,
                        totalMax: estimate.total.max,
                    }
                }
            });

            if (decisionErr) {
                console.warn("[Estimator] Failed to generate decision chain event:", decisionErr);
            }

            const { error: workspaceErr } = await supabase.from("workspace_commitment_revisions").insert({
                lead_id: leadId,
                session_id: discoveryContext?.userId || leadId,
                decision_genome: {
                    budget: formData.budgetAmount,
                    area: formData.area,
                    city: formData.city
                },
                project_snapshot: {
                    totalMin: estimate.total.min,
                    totalMax: estimate.total.max,
                },
                narrative_brief: `Cost estimate generated for ${formData.propertyType}.`,
                workspace_state: { step: 'estimate_submitted' },
                is_locked: false
            });

            if (workspaceErr) {
                console.warn("[Estimator] Failed to generate workspace commitment revision:", workspaceErr);
            }
        }

        structuredLog("info", FN, "Lead Estimate Processed", { score: score.total, leadId, updated: !isNewLead }, requestId);
        return okResponse(req, { success: true, estimate, leadId }, {}, rl, RATE_OPTS.max, requestId);

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Internal error";
        structuredLog("error", FN, "Critical submission failure", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, err, requestId);
    }
});
