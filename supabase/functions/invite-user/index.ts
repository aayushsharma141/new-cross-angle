import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
} from "../_lib/security.ts";
import { canAssignRole, isAppRole, normalizeRole } from "../_lib/rbac.ts";

const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "invite-user", max: 10, windowMs: 60_000 };

type InviteUserRequest = {
    email: string;
    role?: string;
    fullName?: string | null;
};

serve(async (req: Request) => {
    const preflight = handlePreflight(req, CORS_OPTS);
    if (preflight) return preflight;

    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, CORS_OPTS);

    try {
        const corsHeaders = buildCorsHeaders(req, CORS_OPTS);
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData, error: roleError } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        if (roleError || !roleData?.role || !isAppRole(roleData.role) || roleData.role === "viewer") {
            return new Response(JSON.stringify({ error: "Forbidden: You do not have permission to invite users" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const actorRole = roleData.role;
        const { email, role = "viewer", fullName } = (await req.json()) as InviteUserRequest;

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!isAppRole(role)) {
            return new Response(JSON.stringify({ error: "Invalid role selected" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!canAssignRole(actorRole, role)) {
            return new Response(JSON.stringify({ error: "Forbidden: You cannot assign that role" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
            data: fullName ? { full_name: fullName.trim() } : undefined,
        });

        if (inviteError) {
            console.error("Error inviting user:", inviteError);
            return new Response(JSON.stringify({ error: inviteError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!inviteData.user) {
            return new Response(JSON.stringify({ error: "Invitation failed" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const invitedUserId = inviteData.user.id;

        const { error: roleAssignError } = await adminClient
            .from("user_roles")
            .upsert({ user_id: invitedUserId, role }, { onConflict: "user_id" });

        if (roleAssignError) {
            console.error("Error assigning role:", roleAssignError);
            return new Response(JSON.stringify({
                error: "User invited but role assignment failed. Please review the account in Supabase Auth.",
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { error: profileError } = await adminClient
            .from("profiles")
            .upsert({
                id: invitedUserId,
                full_name: fullName?.trim() || null,
                role: normalizeRole(role),
                status: "active",
                deleted_at: null,
                deleted_by: null,
            }, { onConflict: "id" });

        if (profileError) {
            console.error("Error creating profile:", profileError);
            return new Response(JSON.stringify({
                error: "User invited but profile creation failed. Please review the account in admin settings.",
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { error: auditError } = await adminClient.from("audit_logs").insert({
            action: "USER_INVITED",
            entity_type: "user",
            entity_id: invitedUserId,
            details: { email, role, full_name: fullName?.trim() || null, invited_by: user.id },
            user_id: user.id,
        });

        if (auditError) {
            console.error("Audit log insert failed:", auditError);
        }

        return new Response(JSON.stringify({ success: true, message: "Invitation sent successfully" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Error in invite-user:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...buildCorsHeaders(req, CORS_OPTS), "Content-Type": "application/json" },
        });
    }
});
