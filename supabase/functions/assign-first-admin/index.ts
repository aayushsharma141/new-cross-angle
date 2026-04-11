import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  okResponse, 
  badRequestResponse, 
  unauthorizedResponse, 
  forbiddenResponse,
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";

const FN = "assign-first-admin";


Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return serverErrorResponse(req, "Server not configured", {}, FN, new Error("Missing env vars"), requestId);
    }

    // Parse body early so we can inspect check_signup_enabled before auth
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty for check_signup_enabled requests
    }

    // Service role client for privileged DB access
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if any super admin already exists
    const { count: superAdminCount, error: countError } = await adminClient
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (countError) throw countError;

    // If client is just checking if signup is available, return status
    if (body.check_signup_enabled) {
      return okResponse(req, {
        signup_enabled: (superAdminCount ?? 0) === 0
      }, {}, undefined, undefined, requestId);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(req, "Authentication required", {}, requestId);
    }

    // Authenticated client (verify JWT in-code; gateway verification is disabled via config.toml)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    // IMPORTANT: when gateway JWT verification is disabled, pass token explicitly.
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    const callerUserId = authData?.user?.id;
    if (authError || !callerUserId) {
      return unauthorizedResponse(req, "Invalid session", {}, requestId);
    }

    const requestedUserId = body.user_id;

    if (!requestedUserId || typeof requestedUserId !== "string") {
      return badRequestResponse(req, "Missing user_id", {}, requestId);
    }

    // If no super admins exist, only allow caller to assign themselves.
    if ((superAdminCount ?? 0) === 0) {
      if (requestedUserId !== callerUserId) {
        return forbiddenResponse(req, "Bootstrap mode: you can only assign yourself as first admin", {}, requestId);
      }
    } else {
      // If a super admin already exists, require caller is super_admin.
      const { data: callerRole, error: callerRoleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", callerUserId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (callerRoleError || !callerRole) {
        return forbiddenResponse(req, "Only super admins can assign roles", {}, requestId);
      }
    }

    // Upsert super_admin role for requested user.
    const { error: upsertError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: requestedUserId, role: "super_admin" }, { onConflict: "user_id" });

    if (upsertError) throw upsertError;

    structuredLog("info", FN, "Super admin assigned", { userId: requestedUserId }, requestId);

    return okResponse(req, { ok: true }, {}, undefined, undefined, requestId);
  } catch (err) {
    structuredLog("error", FN, "Role assignment failed", { error: String(err) }, requestId);
    return serverErrorResponse(req, "Internal error", {}, FN, err, requestId);
  }
});
