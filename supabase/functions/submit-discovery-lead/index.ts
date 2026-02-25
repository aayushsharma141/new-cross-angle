// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calculate lead score based on MVP MVP rules
function calculateLeadScore(payload: any): number {
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
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { name, email, phone, consent, results, raw_data } = body;

        // Basic validation
        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: "Valid email is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!name || name.trim().length === 0) {
            return new Response(JSON.stringify({ error: "Name is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
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
            // Handle unique email constraint specifically if needed
            if (masterError.code === '23505') {
                return new Response(JSON.stringify({ error: "Email already registered" }), {
                    status: 409,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            throw new Error(`Failed to create lead master record: ${masterError.message}`);
        }

        const leadId = masterData.id;

        // 2. Insert into raw_payload
        const { error: payloadError } = await supabase
            .from('raw_payload')
            .insert({
                lead_id: leadId,
                payload: body
            });

        if (payloadError) {
            console.error("Error inserting into raw_payload:", payloadError);
            // We don't necessarily want to fail the whole request if raw_payload fails, 
            // but it's good to log it. Master record is already created.
        }

        // 3. Webhook to Make.com (Phase 3 of MVP)
        const makeWebhookUrl = Deno.env.get("MAKE_WEBHOOK_URL");
        let webhookStatus = "skip";

        if (makeWebhookUrl) {
            try {
                const makeRes = await fetch(makeWebhookUrl, {
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
                });

                if (!makeRes.ok) {
                    console.error("Make.com webhook failed:", await makeRes.text());
                    webhookStatus = "failed";
                } else {
                    webhookStatus = "success";
                }
            } catch (err) {
                console.error("Error calling Make.com webhook:", err);
                webhookStatus = "failed";
            }
        }

        // Return success
        return new Response(JSON.stringify({
            success: true,
            id: leadId,
            score: leadScore,
            webhook_status: webhookStatus
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: unknown) {
        console.error("Unhandled error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
