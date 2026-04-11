import { okResponse, getRequestId } from "../_lib/security.ts";

/**
 * Health Check Probe
 * -----------------
 * Used by uptime monitors (BetterUptime, Checkly) to verify system availability.
 * This is a "shallow" probe (runtime only) to ensure low latency and minimal risk.
 */
Deno.serve(async (req) => {
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
    
    return okResponse(
        req, 
        {
            status: "ok",
            timestamp: new Date().toISOString(),
            runtime: "deno",
            version: "1.0.0",
        },
        { origin: "*" }, // Publicly accessible
        undefined,
        undefined,
        requestId
    );
});
