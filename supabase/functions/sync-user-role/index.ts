import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
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
            return;
        }

        lastError = error;
    }

    if (lastError) {
        throw lastError;
    }
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
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await authClient.auth.getUser(token);
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        const { data: existingRoleData } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        const existingRole = mapStoredRole(existingRoleData?.role);
        if (existingRole) {
            return new Response(JSON.stringify({ role: existingRole, source: "user_roles" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { data: profileData, error: profileError } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        const derivedRole = mapProfileRole(profileData?.role);
        if (!derivedRole) {
            return new Response(JSON.stringify({ role: null, source: "none" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (derivedRole !== "viewer") {
            await writeRole(adminClient, user.id, derivedRole);
        }

        return new Response(JSON.stringify({ role: derivedRole, source: "profiles" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Error in sync-user-role:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...buildCorsHeaders(req, CORS_OPTS), "Content-Type": "application/json" },
        });
    }
});
