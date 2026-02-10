
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        // Query information_schema to check column type
        const { data, error } = await adminClient.rpc('get_column_type', {
            table_name: 'user_roles',
            column_name: 'role'
        });

        // If RPC doesn't exist (likely), try to infer from an insert error or just checking typical setup
        // But we can't easily run arbitrary SQL via JS client without an RPC wrapper.

        // Instead, let's try to just return what we can find about the table structure if we have a way.
        // Actually, we can use the `rpc` if we create a function in migration, but we are stuck on migration.

        // Let's try to insert a dummy role and see the error message.
        const { error: insertError } = await adminClient
            .from('user_roles')
            .insert({ user_id: '00000000-0000-0000-0000-000000000000', role: 'INVALID_ROLE_TEST' });

        return new Response(JSON.stringify({
            insertError: insertError ? insertError.message : "No error (means text type?)"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
