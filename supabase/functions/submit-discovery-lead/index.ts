// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
    badRequestResponse,
    serverErrorResponse,
    okResponse,
    checkIdempotency,
    structuredLog,
    signWebhookPayload,
    getRequestId,
} from "../_lib/security.ts";

const FN = "submit-discovery-lead";

const RATE_OPTS = { bucket: "discovery-lead", max: 10, windowMs: 60_000 };

// Calculate lead score based on MVP MVP rules
function calculateLeadScore(payload: Record<string, any>): number {
    let score = 0;

    // High intent signals
    if (payload.results?.investment_tier === 'Legacy') score += 40;
    if (payload.results?.investment_tier === 'Bespoke') score += 20;

    // Has phone number increases score
    if (payload.phone && payload.phone.trim().length > 0) score += 10;

    // Commercial projects generally higher value
    if (payload.results?.project_type === 'commercial') score += 15;

    // Specific archetypes might be better fits, but for now we just give a baseline
    if (payload.results?.archetype) score += 5;

    // Score capped at 100
    return Math.min(score, 100);
}

function normalizeDiscoveryLeadType(projectType?: string): "commercial" | "consultation" {
    return String(projectType || "").toLowerCase().includes("commercial") ? "commercial" : "consultation";
}

function buildBudgetText(results?: Record<string, any>): string | null {
    if (!results) return null;

    const estimatedMin = typeof results.estimated_min === "number" ? results.estimated_min : null;
    const estimatedMax = typeof results.estimated_max === "number" ? results.estimated_max : null;

    if (estimatedMin !== null && estimatedMax !== null) {
        return `Estimated range: INR ${estimatedMin.toLocaleString("en-IN")} - INR ${estimatedMax.toLocaleString("en-IN")}`;
    }

    return results.investment_tier ? String(results.investment_tier) : null;
}

Deno.serve(async (req: Request) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    // Rate limit by IP
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return badRequestResponse(req, "Invalid JSON", {}, requestId);
        }

        const { name, email, phone, consent, results } = body as {
            name: string; email: string; phone?: string; consent?: boolean;
            results?: Record<string, any>;
        };

        if (!email || !String(email).includes("@")) {
            return badRequestResponse(req, "Valid email is required", {}, requestId);
        }

        if (!name || String(name).trim().length === 0) {
            return badRequestResponse(req, "Name is required", {}, requestId);
        }

        // Idempotency: prevent duplicate discovery lead inserts
        const idemKey = `${String(email).trim().toLowerCase()}:${results?.investment_tier ?? "none"}`;
        const idem = await checkIdempotency(idemKey, FN);
        if (idem.duplicate) {
            structuredLog("info", FN, "Duplicate discovery submission blocked", { email }, requestId);
            return okResponse(req, { success: true, deduplicated: true }, {}, rl, RATE_OPTS.max, requestId);
        }

        // Initialize Supabase client with Service Role to bypass RLS
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate lead score
        const leadScore = calculateLeadScore(body);

        // Map payload for leads insert
        const budgetValueInr = typeof results?.estimated_max === "number" ? results.estimated_max : null;
        const leadMessage = [
            `Discovery Engine blueprint captured for ${results?.archetype || "unknown archetype"}.`,
            results?.project_type ? `Project type: ${results.project_type}.` : null,
            results?.investment_tier ? `Investment tier: ${results.investment_tier}.` : null,
        ].filter(Boolean).join(" ");

        // Insert directly into leads
        const { data: leadData, error: crmLeadError } = await supabase
            .from("leads")
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : null,
                message: leadMessage,
                lead_source: "style_quiz", // or could use "discovery_engine" as source discriminator 
                lead_type: normalizeDiscoveryLeadType(results?.project_type),
                service: "design consultation",
                budget: buildBudgetText(results),
                budget_value_inr: budgetValueInr,
                score: leadScore,
                // Add the newly ported columns from leads_master
                consent: consent === true,
                archetype: results?.archetype || null,
                investment_tier: results?.investment_tier || null,
                project_type: results?.project_type || null,
                estimated_min: results?.estimated_min || null,
                estimated_max: results?.estimated_max || null,
                lead_score: leadScore, // Redundant with score but keeping for backwards compatibility until cleanup
                status: 'new',
                internal_notes: {
                    raw_data: body.raw_data ?? null,
                },
            }).select('id').single();

        if (crmLeadError) {
            structuredLog("error", FN, "leads CRM insert failed", { code: crmLeadError.code }, requestId);
            throw new Error(`Failed to create CRM lead record: ${crmLeadError.message}`);
        }

        const leadId = leadData.id;

        // 2. Run raw_payload insert and Make.com webhook concurrently
        // Both are non-critical: master record is already created.
        const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");

        const makeWebhookPayload = {
            lead_id: leadId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            archetype: results?.archetype || 'Unknown',
            score: leadScore,
            investment_tier: results?.investment_tier || 'Unknown',
            project_type: results?.project_type || 'Unknown',
            estimated_min: results?.estimated_min || 0,
            estimated_max: results?.estimated_max || 0,
            source: 'discovery_engine',
            created_at: new Date().toISOString()
        };

        const payloadStr = JSON.stringify(makeWebhookPayload);
        const signature = makeWebhookUrl ? await signWebhookPayload(payloadStr) : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (signature) {
            headers["X-CrossAngle-Signature"] = signature;
        }

        const [payloadResult, webhookResult] = await Promise.allSettled([
            // 2a. Insert into raw_payload
            supabase
                .from('raw_payload')
                .insert({ lead_id: leadId, payload: body }),

            // 2b. Webhook to Make.com (Phase 3 of MVP)
            makeWebhookUrl
                ? fetch(makeWebhookUrl, {
                    method: "POST",
                    headers,
                    body: payloadStr,
                })
                : Promise.resolve(null),
        ]);

        // Log any errors from the concurrent operations
        if (payloadResult.status === "fulfilled" && payloadResult.value?.error) {
            structuredLog("warn", FN, "raw_payload insert error", { error: String(payloadResult.value.error) }, requestId);
        } else if (payloadResult.status === "rejected") {
            structuredLog("error", FN, "raw_payload insert rejected", { reason: String(payloadResult.reason) }, requestId);
        }

        let webhookStatus = "skip";
        if (makeWebhookUrl) {
            if (webhookResult.status === "fulfilled" && webhookResult.value) {
                const res = webhookResult.value as Response;
                webhookStatus = res.ok ? "success" : "failed";
                if (!res.ok) {
                    const statusText = await res.text().catch(() => "Unknown error");
                    structuredLog("warn", FN, "Make.com webhook non-ok", { status: res.status }, requestId);
                    await supabase.from('webhook_failures').insert({
                        webhook_url: makeWebhookUrl,
                        payload: makeWebhookPayload,
                        status: 'pending',
                        error_message: `HTTP ${res.status}: ${statusText}`,
                        next_retry_at: new Date(Date.now() + 5 * 60000).toISOString()
                    });
                }
            } else if (webhookResult.status === "rejected") {
                structuredLog("error", FN, "Make.com webhook rejected", { reason: String(webhookResult.reason) }, requestId);
                webhookStatus = "failed";
                await supabase.from('webhook_failures').insert({
                    webhook_url: makeWebhookUrl,
                    payload: makeWebhookPayload,
                    status: 'pending',
                    error_message: String(webhookResult.reason),
                    next_retry_at: new Date(Date.now() + 5 * 60000).toISOString()
                });
            }
        }

        await idem.markComplete();
        structuredLog("info", FN, "Discovery lead processed", { email, leadScore }, requestId);

        return okResponse(req, {
            success: true,
            id: leadId,
            score: leadScore,
            webhook_status: webhookStatus
        }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error: unknown) {
        structuredLog("error", FN, "Unhandled exception", { error: String(error) }, requestId);
        const message = error instanceof Error ? error.message : "Unknown error";
        return serverErrorResponse(req, message, {}, FN, error, requestId);
    }
});
