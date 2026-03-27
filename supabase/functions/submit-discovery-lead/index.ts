import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
} from "../_lib/security.ts";

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

serve(async (req: Request) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    // Rate limit by IP
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl);

    try {
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return badRequestResponse(req, "Invalid JSON");
        }

        const { name, email, phone, consent, results } = body as {
            name: string; email: string; phone?: string; consent?: boolean;
            results?: Record<string, any>;
        };

        if (!email || !String(email).includes("@")) {
            return badRequestResponse(req, "Valid email is required");
        }

        if (!name || String(name).trim().length === 0) {
            return badRequestResponse(req, "Name is required");
        }

        // Initialize Supabase client with Service Role to bypass RLS
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate lead score
        const leadScore = calculateLeadScore(body);

        // 1. Insert into leads_master
        const { data: masterData, error: masterError } = await supabase
            .from('leads_master')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : null,
                source: 'discovery_engine',
                consent: consent === true,
                archetype: results?.archetype || null,
                investment_tier: results?.investment_tier || null,
                project_type: results?.project_type || null,
                estimated_min: results?.estimated_min || null,
                estimated_max: results?.estimated_max || null,
                lead_score: leadScore,
                status: 'new'
            })
            .select('id')
            .single();

        if (masterError) {
            console.error("Error inserting into leads_master:", masterError);
            if (masterError.code === "23505") {
                return new Response(JSON.stringify({ error: "Email already registered" }), {
                    status: 409,
                    headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
                });
            }
            throw new Error(`Failed to create lead master record: ${masterError.message}`);
        }

        const leadId = masterData.id;

        // 2. Run raw_payload insert and Make.com webhook concurrently
        // Both are non-critical: master record is already created.
        const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");

        const [payloadResult, webhookResult] = await Promise.allSettled([
            // 2a. Insert into raw_payload
            supabase
                .from('raw_payload')
                .insert({ lead_id: leadId, payload: body }),

            // 2b. Webhook to Make.com (Phase 3 of MVP)
            makeWebhookUrl
                ? fetch(makeWebhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
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
                    }),
                })
                : Promise.resolve(null),
        ]);

        // Log any errors from the concurrent operations
        if (payloadResult.status === "fulfilled" && payloadResult.value?.error) {
            console.error("Error inserting into raw_payload:", payloadResult.value.error);
        } else if (payloadResult.status === "rejected") {
            console.error("raw_payload insert rejected:", payloadResult.reason);
        }

        let webhookStatus = "skip";
        if (makeWebhookUrl) {
            if (webhookResult.status === "fulfilled" && webhookResult.value) {
                const res = webhookResult.value as Response;
                webhookStatus = res.ok ? "success" : "failed";
                if (!res.ok) {
                    console.error("Make.com webhook failed:", res.status);
                }
            } else if (webhookResult.status === "rejected") {
                console.error("Make.com webhook rejected:", webhookResult.reason);
                webhookStatus = "failed";
            }
        }

        return okResponse(req, {
            success: true,
            id: leadId,
            score: leadScore,
            webhook_status: webhookStatus
        }, {}, rl, RATE_OPTS.max);

    } catch (error: unknown) {
        console.error("Unhandled error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return serverErrorResponse(req, message);
    }
});
