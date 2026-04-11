// Deno.serve is the native Supabase Edge Function entrypoint — no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  signWebhookPayload, 
  structuredLog, 
  getRequestId, 
  okResponse, 
  serverErrorResponse, 
  unauthorizedResponse 
} from "../_lib/security.ts";

const FN = "retry-webhooks";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function handleFailure(id: string, attemptCount: number, errorMsg: string, requestId?: string) {
    if (attemptCount >= 5) {
        // Mark permanently failed
        await supabase.from('webhook_failures').update({
            status: 'failed',
            attempt_count: attemptCount,
            last_attempt_at: new Date().toISOString(),
            error_message: errorMsg
        }).eq('id', id);
        structuredLog("error", FN, "Webhook permanently failed after 5 attempts", { failure_id: id, error: errorMsg }, requestId);
    } else {
        // Exponential backoff: e.g. 5m, 20m, 45m, 80m...
        const delayMs = Math.pow(attemptCount, 2) * 5 * 60000;
        const nextRetry = new Date(Date.now() + delayMs).toISOString();

        await supabase.from('webhook_failures').update({
            attempt_count: attemptCount,
            last_attempt_at: new Date().toISOString(),
            next_retry_at: nextRetry,
            error_message: errorMsg
        }).eq('id', id);
        structuredLog("warn", FN, "Webhook retry scheduled", { failure_id: id, attempt: attemptCount, next_retry: nextRetry }, requestId);
    }
}

Deno.serve(async (req) => {
    const requestId = getRequestId(req);
    try {
        // Only allow requests that bear the service role key 
        // OR a custom secret if pg_net triggers it.
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${supabaseKey}`) {
            return unauthorizedResponse(req, "Invalid token", {}, requestId);
        }

        // Fetch up to 50 pending failures whose next_retry_at is <= now()
        const { data: failures, error } = await supabase
            .from('webhook_failures')
            .select('*')
            .eq('status', 'pending')
            .lte('next_retry_at', new Date().toISOString())
            .order('next_retry_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        let processed = 0;
        let succeeded = 0;

        for (const failure of (failures || [])) {
            processed++;
            const attemptCount = failure.attempt_count + 1;
            
            try {
                const payloadStr = JSON.stringify(failure.payload);
                const signature = await signWebhookPayload(payloadStr);
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (signature) {
                    headers['X-CrossAngle-Signature'] = signature;
                }

                const response = await fetch(failure.webhook_url, {
                    method: 'POST',
                    headers,
                    body: payloadStr,
                });

                if (response.ok) {
                    await supabase.from('webhook_failures').update({
                        status: 'succeeded',
                        attempt_count: attemptCount,
                        last_attempt_at: new Date().toISOString(),
                    }).eq('id', failure.id);
                    succeeded++;
                    structuredLog("info", FN, "Webhook retry succeeded", { failure_id: failure.id }, requestId);
                } else {
                    const statusText = await response.text().catch(() => 'Unknown error text');
                    const errMessage = `HTTP ${response.status}: ${statusText}`;
                    await handleFailure(failure.id, attemptCount, errMessage, requestId);
                }
            } catch (err) {
                const errMessage = err instanceof Error ? err.message : String(err);
                await handleFailure(failure.id, attemptCount, errMessage, requestId);
            }
        }

        structuredLog("info", FN, "Batch retry completed", { processed, succeeded }, requestId);
        return okResponse(req, { success: true, processed, succeeded }, {}, undefined, undefined, requestId);
    } catch (error: any) {
        structuredLog("error", FN, "Retry process failed", { error: error.message }, requestId);
        return serverErrorResponse(req, error.message, {}, FN, error, requestId);
    }
});
