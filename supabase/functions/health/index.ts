import { okResponse, getRequestId, sentryReport } from "../_lib/security.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/**
 * Health Check Probe
 * -----------------
 * Used by uptime monitors (BetterUptime, Checkly) to verify system availability.
 * Pass `?deep=true` to perform a full database connectivity test.
 */
Deno.serve(async (req) => {
    const startMs = performance.now();

    // Standard CORS for health monitoring tools
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "content-type, x-client-info, x-request-id",
            }
        });
    }

    const requestId = getRequestId(req);
    const url = new URL(req.url);
    const isDeep = url.searchParams.get("deep") === "true";
    
    let dbStatus = "skipped";
    let dbMs: number | undefined = undefined;

    if (isDeep) {
        const dbStart = performance.now();
        try {
            const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
            const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Missing Supabase configuration variables.");
            }

            const supabase = createClient(supabaseUrl, supabaseKey);
            
            // Perform a lightweight query to verify the PostgREST layer
            // We use 'projects' since it's a known table from sitemap architecture
            const { error } = await supabase.from('projects').select('id').limit(1);
            
            if (error) {
                // If it's a 401 or 404, the connection itself is fine, just auth/schema error.
                // We'll throw if it's a hard connection timeout.
                if (error.code === 'PGRST301' || error.code?.startsWith('PGRST')) {
                    dbStatus = "connected_with_postgrest_error";
                } else {
                    throw error;
                }
            } else {
                dbStatus = "connected";
            }
        } catch (error) {
            dbStatus = "failed";
            await sentryReport("health", error, { isDeep, requestId }, "error", requestId);
            
            // Return 503 so Checkly triggers an alert
            return new Response(JSON.stringify({
                status: "error",
                message: "Database connectivity failed",
                timestamp: new Date().toISOString()
            }), {
                status: 503,
                headers: { "Content-Type": "application/json" }
            });
        }
        dbMs = Math.round(performance.now() - dbStart);
    }
    
    const totalMs = Math.round(performance.now() - startMs);

    return okResponse(
        req, 
        {
            status: "ok",
            timestamp: new Date().toISOString(),
            runtime: "deno",
            version: "1.0.0",
            probe: isDeep ? "deep" : "shallow",
            db_status: dbStatus,
            db_ms: dbMs,
            total_ms: totalMs
        },
        { origin: "*" }, // Publicly accessible
        undefined,
        undefined,
        requestId
    );
});
