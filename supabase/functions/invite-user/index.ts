// Deno.serve is the native Supabase Edge Function entrypoint — no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  checkRateLimit, 
  getClientId, 
  rateLimitResponse, 
  okResponse, 
  badRequestResponse, 
  unauthorizedResponse, 
  forbiddenResponse,
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";
import { canAssignRole, isAppRole, normalizeRole } from "../_lib/rbac.ts";

const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "invite-user", max: 10, windowMs: 60_000 };

type InviteUserRequest = {
    email: string;
    role?: string;
    fullName?: string | null;
};

const FN = "invite-user";

Deno.serve(async (req: Request) => {
    const preflight = handlePreflight(req, CORS_OPTS);
    if (preflight) return preflight;

    const requestId = getRequestId(req);
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, CORS_OPTS, FN, requestId);

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return unauthorizedResponse(req, "Authentication required", CORS_OPTS, requestId);
        }

        const token = authHeader.replace("Bearer ", "");
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
            return unauthorizedResponse(req, "Invalid session", CORS_OPTS, requestId);
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData, error: roleError } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        if (roleError || !roleData?.role || !isAppRole(roleData.role) || roleData.role === "viewer") {
            return forbiddenResponse(req, "permission to invite users required", CORS_OPTS, requestId);
        }

        const actorRole = roleData.role;
        const { email, role = "viewer", fullName } = (await req.json()) as InviteUserRequest;

        if (!email) {
            return badRequestResponse(req, "Email is required", CORS_OPTS, requestId);
        }

        if (!isAppRole(role)) {
            return badRequestResponse(req, "Invalid role selected", CORS_OPTS, requestId);
        }

        if (!canAssignRole(actorRole, role)) {
            return forbiddenResponse(req, "You cannot assign that role", CORS_OPTS, requestId);
        }

        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
            data: fullName ? { full_name: fullName.trim() } : undefined,
        });

        if (inviteError) {
            structuredLog("warn", FN, "Invitation failed", { error: inviteError.message, email }, requestId);
            return badRequestResponse(req, inviteError.message, CORS_OPTS, requestId);
        }

        if (!inviteData.user) {
            return serverErrorResponse(req, "Invitation failed", CORS_OPTS, FN, new Error("No user returned from invite"), requestId);
        }

        const invitedUserId = inviteData.user.id;

        const { error: roleAssignError } = await adminClient
            .from("user_roles")
            .upsert({ user_id: invitedUserId, role }, { onConflict: "user_id" });

        if (roleAssignError) {
            structuredLog("error", FN, "Role assignment failed", { error: roleAssignError.message, invitedUserId }, requestId);
            return serverErrorResponse(req, "Role assignment failed", CORS_OPTS, FN, roleAssignError, requestId);
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
            structuredLog("error", FN, "Profile creation failed", { error: profileError.message, invitedUserId }, requestId);
            return serverErrorResponse(req, "Profile creation failed", CORS_OPTS, FN, profileError, requestId);
        }

        const { error: auditError } = await adminClient.from("audit_logs").insert({
            action: "USER_INVITED",
            entity_type: "user",
            entity_id: invitedUserId,
            details: { email, role, full_name: fullName?.trim() || null, invited_by: user.id, trace_id: requestId },
            user_id: user.id,
        });

        if (auditError) {
            structuredLog("warn", FN, "Audit log failed", { error: auditError.message }, requestId);
        }

        structuredLog("info", FN, "User invited", { email, role, targetUserId: invitedUserId }, requestId);
        return okResponse(req, { success: true, message: "Invitation sent successfully" }, CORS_OPTS, rl, RATE_OPTS.max, requestId);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        structuredLog("error", FN, "Unhandled error", { error: msg }, requestId);
        return serverErrorResponse(req, msg, CORS_OPTS, FN, error, requestId);
    }
});
