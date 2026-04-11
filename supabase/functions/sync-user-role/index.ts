// Deno.serve is the native Supabase Edge Function entrypoint — no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  checkRateLimit, 
  getClientId, 
  rateLimitResponse, 
  okResponse, 
  unauthorizedResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";
import { isAppRole } from "../_lib/rbac.ts";

const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "sync-user-role", max: 10, windowMs: 60_000 };

type SyncedRole = "super_admin" | "admin" | "viewer";

function mapStoredRole(role: string | null | undefined): SyncedRole | null {
    if (!role) return null;
    if (isAppRole(role)) return role;
    if (role === "editor") return "admin";
    return null;
}

function mapProfileRole(role: string | null | undefined): SyncedRole | null {
    if (!role) return null;
    if (isAppRole(role)) return role;
    if (role === "editor") return "admin";
    if (role === "user" || role === "viewer") return "viewer";
    return mapStoredRole(role);
}

async function writeRole(
    adminClient: ReturnType<typeof createClient>,
    userId: string,
    role: SyncedRole,
    requestId?: string
): Promise<void> {
    const primaryRole = role === "super_admin" ? "super_admin" : role;
    const fallbackRole = role === "super_admin" ? "admin" : role;

    const attempts = role === "viewer"
        ? [
            { value: primaryRole, onConflict: "user_id" },
            { value: primaryRole, onConflict: "user_id,role" },
        ]
        : [
            { value: primaryRole, onConflict: "user_id" },
            { value: primaryRole, onConflict: "user_id,role" },
            ...(fallbackRole !== primaryRole
                ? [
                    { value: fallbackRole, onConflict: "user_id" },
                    { value: fallbackRole, onConflict: "user_id,role" },
                ]
                : []),
        ];

    let lastError: unknown = null;

    for (const attempt of attempts) {
        const { error } = await adminClient
            .from("user_roles")
            .upsert({ user_id: userId, role: attempt.value }, { onConflict: attempt.onConflict });

        if (!error) {
            structuredLog("info", "sync-user-role", "Role written successfully", { userId, role, attempt: attempt.value }, requestId);
            return;
        }

        lastError = error;
    }

    if (lastError) {
        throw lastError;
    }
}

const FN = "sync-user-role";

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
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await authClient.auth.getUser(token);
        if (userError || !user) {
            return unauthorizedResponse(req, "Invalid session", CORS_OPTS, requestId);
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        const { data: existingRoleData } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        const existingRole = mapStoredRole(existingRoleData?.role);
        if (existingRole) {
            return okResponse(req, { role: existingRole, source: "user_roles" }, CORS_OPTS, rl, RATE_OPTS.max, requestId);
        }

        const { data: profileData, error: profileError } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        const derivedRole = mapProfileRole(profileData?.role);
        if (!derivedRole) {
            return okResponse(req, { role: null, source: "none" }, CORS_OPTS, rl, RATE_OPTS.max, requestId);
        }

        if (derivedRole !== "viewer") {
            await writeRole(adminClient, user.id, derivedRole, requestId);
        }

        return okResponse(req, { role: derivedRole, source: "profiles" }, CORS_OPTS, rl, RATE_OPTS.max, requestId);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        structuredLog("error", FN, "Sync failed", { error: msg }, requestId);
        return serverErrorResponse(req, msg, CORS_OPTS, FN, error, requestId);
    }
});
