import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
} from "../_lib/security.ts";
import {
    AppRole,
    canAssignRole,
    canManageRole,
    isAppRole,
    normalizeRole,
} from "../_lib/rbac.ts";

const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "manage-user", max: 30, windowMs: 60_000 };
const INACTIVE_BAN_DURATION = "876000h";

type ManageUserAction = "activate" | "deactivate" | "delete" | "update" | "reset-password";

type ManageUserRequest = {
    action: ManageUserAction;
    userId: string;
    role?: string;
    fullName?: string | null;
    status?: "active" | "inactive";
};

type ProfileState = {
    full_name: string | null;
    status: string | null;
    deleted_at: string | null;
};

async function getActorRole(adminClient: ReturnType<typeof createClient>, userId: string): Promise<AppRole | null> {
    const { data, error } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

    if (error || !data?.role || !isAppRole(data.role)) {
        return null;
    }

    return data.role;
}

async function getTargetRole(adminClient: ReturnType<typeof createClient>, userId: string): Promise<AppRole> {
    const { data } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

    return normalizeRole(data?.role);
}

async function getTargetProfile(
    adminClient: ReturnType<typeof createClient>,
    userId: string,
): Promise<ProfileState> {
    const { data } = await adminClient
        .from("profiles")
        .select("full_name, status, deleted_at")
        .eq("id", userId)
        .maybeSingle();

    return {
        full_name: data?.full_name ?? null,
        status: data?.status ?? null,
        deleted_at: data?.deleted_at ?? null,
    };
}

async function ensureNotLastSuperAdmin(
    adminClient: ReturnType<typeof createClient>,
    targetRole: AppRole,
    isRemovingSuperAdminAccess: boolean,
): Promise<string | null> {
    if (targetRole !== "super_admin" || !isRemovingSuperAdminAccess) {
        return null;
    }

    const { count, error } = await adminClient
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");

    if (error) {
        throw error;
    }

    if ((count ?? 0) <= 1) {
        return "You cannot remove or deactivate the last remaining super admin";
    }

    return null;
}

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
        const actorRole = await getActorRole(adminClient, user.id);

        if (!actorRole || actorRole === "viewer") {
            return new Response(JSON.stringify({ error: "Forbidden: You do not have permission to manage users" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = (await req.json()) as ManageUserRequest;
        const { action, userId, fullName } = body;
        const requestedRole = body.role ? (isAppRole(body.role) ? body.role : null) : undefined;
        const requestedStatus = body.status;

        if (!action || !userId) {
            return new Response(JSON.stringify({ error: "Action and user ID are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!["activate", "deactivate", "delete", "update", "reset-password"].includes(action)) {
            return new Response(JSON.stringify({ error: "Invalid action" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (userId === user.id) {
            if (action === "reset-password") {
                return new Response(JSON.stringify({
                    error: "You cannot reset your own password from the admin panel. Use the login page's 'Forgot Password' instead.",
                }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            if (action === "update") {
                const isOnlyFullName = typeof fullName === "string" &&
                    !requestedRole &&
                    !requestedStatus;

                if (!isOnlyFullName) {
                    return new Response(JSON.stringify({
                        error: "You cannot change your own role or status. Ask another admin to do this.",
                    }), {
                        status: 400,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    });
                }
            } else {
                return new Response(JSON.stringify({
                    error: "You cannot perform this action on yourself.",
                }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        }

        if (body.role && !requestedRole) {
            return new Response(JSON.stringify({ error: "Invalid role selected" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (requestedStatus && requestedStatus !== "active" && requestedStatus !== "inactive") {
            return new Response(JSON.stringify({ error: "Invalid status selected" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const targetRole = await getTargetRole(adminClient, userId);
        const targetProfile = await getTargetProfile(adminClient, userId);

        if (!canManageRole(actorRole, targetRole)) {
            return new Response(JSON.stringify({ error: "Forbidden: You cannot manage this user" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (targetProfile.deleted_at && action !== "delete") {
            return new Response(JSON.stringify({
                error: "Deleted users cannot be modified from this screen",
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const removingSuperAdminAccess =
            action === "delete" ||
            action === "deactivate" ||
            (action === "update" &&
                ((requestedRole && requestedRole !== "super_admin") || requestedStatus === "inactive"));

        const lastSuperAdminGuard = await ensureNotLastSuperAdmin(
            adminClient,
            targetRole,
            removingSuperAdminAccess,
        );

        if (lastSuperAdminGuard) {
            return new Response(JSON.stringify({ error: lastSuperAdminGuard }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let auditAction = "USER_UPDATED";
        const auditDetails: Record<string, unknown> = { performed_by: user.id };
        const profilePatch: Record<string, unknown> = { id: userId };

        if (typeof fullName === "string") {
            profilePatch.full_name = fullName.trim();
            auditDetails.full_name = fullName.trim();
        }

        switch (action) {
            case "activate": {
                const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
                    ban_duration: "0s",
                });
                if (authError) throw authError;

                profilePatch.status = "active";
                profilePatch.deleted_at = null;
                profilePatch.deleted_by = null;
                auditAction = "USER_ACTIVATED";
                break;
            }

            case "deactivate": {
                const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
                    ban_duration: INACTIVE_BAN_DURATION,
                });
                if (authError) throw authError;

                profilePatch.status = "inactive";
                auditAction = "USER_DEACTIVATED";
                break;
            }

            case "delete": {
                const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
                    ban_duration: INACTIVE_BAN_DURATION,
                });
                if (authError) throw authError;

                profilePatch.status = "inactive";
                profilePatch.deleted_at = new Date().toISOString();
                profilePatch.deleted_by = user.id;
                auditAction = "USER_DELETED";
                break;
            }

            case "reset-password": {
                const { error: resetError } = await adminClient.auth.admin.inviteUserByEmail(user.email ?? "", {
                    data: { name: targetProfile.full_name },
                    redirectTo: `${supabaseUrl}/admin`,
                });
                if (resetError) throw resetError;

                auditAction = "PASSWORD_RESET_REQUESTED";
                auditDetails.triggered_by = user.id;
                auditDetails.target_email = user.email;

                return new Response(JSON.stringify({
                    success: true,
                    message: `Password reset email sent to ${user.email}`,
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            case "update": {
                const isSelfUpdate = userId === user.id;

                if (isSelfUpdate) {
                    if (typeof fullName === "string" && fullName.trim()) {
                        const { error: profileError } = await adminClient
                            .from("profiles")
                            .update({ full_name: fullName.trim() })
                            .eq("id", userId);
                        if (profileError) throw profileError;
                    }

                    return new Response(JSON.stringify({ success: true }), {
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    });
                }
                if (requestedRole) {
                    if (!canAssignRole(actorRole, requestedRole)) {
                        return new Response(JSON.stringify({
                            error: "Forbidden: You cannot assign that role",
                        }), {
                            status: 403,
                            headers: { ...corsHeaders, "Content-Type": "application/json" },
                        });
                    }

                    const { error: roleError } = await adminClient
                        .from("user_roles")
                        .upsert({ user_id: userId, role: requestedRole }, { onConflict: "user_id" });

                    if (roleError) throw roleError;

                    profilePatch.role = requestedRole;
                    auditDetails.role = requestedRole;
                }

                if (requestedStatus) {
                    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
                        ban_duration: requestedStatus === "inactive" ? INACTIVE_BAN_DURATION : "0s",
                    });
                    if (authError) throw authError;

                    profilePatch.status = requestedStatus;
                    auditDetails.status = requestedStatus;
                }

                if (Object.keys(profilePatch).length === 1 && !requestedRole && !requestedStatus) {
                    return new Response(JSON.stringify({ error: "No changes supplied" }), {
                        status: 400,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    });
                }

                auditAction = requestedRole && requestedRole !== targetRole
                    ? "USER_ROLE_CHANGED"
                    : "USER_UPDATED";
                break;
            }
        }

        if (Object.keys(profilePatch).length > 1) {
            const { error: profileError } = await adminClient
                .from("profiles")
                .upsert(profilePatch, { onConflict: "id" });

            if (profileError) throw profileError;
        }

        const { error: auditError } = await adminClient.from("audit_logs").insert({
            action: auditAction,
            entity_type: "user",
            entity_id: userId,
            details: auditDetails,
            user_id: user.id,
        });

        if (auditError) {
            console.error("Audit log insert failed:", auditError);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Error in manage-user:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...buildCorsHeaders(req, CORS_OPTS), "Content-Type": "application/json" },
        });
    }
});
