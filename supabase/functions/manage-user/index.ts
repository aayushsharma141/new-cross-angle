
// Cloud Function: manage-user
// Purpose: Allows admins to suspend, unsuspend, or delete users.
// Security:
// - Only callable by authenticated 'admin' users.
// - Uses Service Role key to access Supabase Admin API.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
} from "../_lib/security.ts";

// Admin routes: credentialed=true → wildcard CORS is NEVER used.
const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "manage-user", max: 30, windowMs: 60_000 };

serve(async (req: Request) => {
    const preflight = handlePreflight(req, CORS_OPTS);
    if (preflight) return preflight;

    // Admin rate limiting
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, CORS_OPTS);

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

        // 1. Verify caller is authenticated
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const token = authHeader.replace("Bearer ", "");
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Verify caller is an admin
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData, error: roleError } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .single();

        if (roleError || !roleData) {
            return new Response(JSON.stringify({ error: "Forbidden: Only admins can manage users" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Process Request
        const { action, userId } = (await req.json()) as {
            action: string;
            userId: string
        };

        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (userId === user.id) {
            return new Response(JSON.stringify({ error: "You cannot perform this action on yourself" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let result;
        let auditAction = "";

        switch (action) {
            case "delete":
                // Delete user from auth.users (cascade should handle related data if configured, 
                // but we might want soft delete? For now hard delete as requested)
                const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
                if (deleteError) throw deleteError;
                auditAction = "USER_DELETED";
                result = { message: "User deleted successfully" };
                break;

            case "suspend":
                // Ban user: set ban_duration to roughly 100 years
                const { error: suspendError } = await adminClient.auth.admin.updateUserById(userId, {
                    ban_duration: "876000h" // ~100 years
                });
                if (suspendError) throw suspendError;
                auditAction = "USER_SUSPENDED";
                result = { message: "User suspended successfully" };
                break;

            case "unsuspend":
                // Unban user: set ban_duration to 0
                const { error: unsuspendError } = await adminClient.auth.admin.updateUserById(userId, {
                    ban_duration: "0s"
                });
                if (unsuspendError) throw unsuspendError;
                auditAction = "USER_UNSUSPENDED";
                result = { message: "User unsuspended successfully" };
                break;

            default:
                return new Response(JSON.stringify({ error: "Invalid action" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
        }

        // Log to audit table
        await adminClient.from("audit_logs").insert({
            action: auditAction,
            entity_type: "user",
            entity_id: userId,
            details: { performed_by: user.id },
            user_id: user.id
        });

        return new Response(JSON.stringify({ success: true, ...result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: unknown) {
        console.error("Error:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...buildCorsHeaders(req, CORS_OPTS), "Content-Type": "application/json" },
        });
    }
});
