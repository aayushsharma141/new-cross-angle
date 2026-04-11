import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  okResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";

const FN = "inspect-schema";

Deno.serve(async (req) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        structuredLog("info", FN, "Inspecting schema", {}, requestId);

        // Query information_schema to check column type
        const { data, error } = await adminClient.rpc('get_column_type', {
            table_name: 'user_roles',
            column_name: 'role'
        });

        // Let's try to insert a dummy role and see the error message.
        const { error: insertError } = await adminClient
            .from('user_roles')
            .insert({ user_id: '00000000-0000-0000-0000-000000000000', role: 'INVALID_ROLE_TEST' });

        return okResponse(req, {
            insertError: insertError ? insertError.message : "No error (means text type?)"
        }, {}, undefined, undefined, requestId);

    } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        structuredLog("error", FN, "Inspection failed", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, error, requestId);
    }
});
