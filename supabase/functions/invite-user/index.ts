// Cloud Function: invite-user
// Purpose: Allows existing admins to invite new users to the admin panel.
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

// Admin-only: credentialed=true ensures wildcard CORS is never used.
const CORS_OPTS = { credentialed: true };
const RATE_OPTS = { bucket: "invite-user", max: 10, windowMs: 60_000 };

serve(async (req: Request) => {
    const preflight = handlePreflight(req, CORS_OPTS);
    if (preflight) return preflight;

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
            return new Response(JSON.stringify({ error: "Forbidden: Only admins can invite users" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Process invite request
        const { email, role = "editor" } = (await req.json()) as {
            email: string;
            role?: string
        };

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const validRoles = ["admin", "editor", "viewer"];
        if (!validRoles.includes(role)) {
            return new Response(JSON.stringify({ error: "Invalid role selected" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Invite user via Supabase Admin API
        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email);

        if (inviteError) {
            console.error("Error inviting user:", inviteError);
            return new Response(JSON.stringify({ error: inviteError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 5. Assign 'admin' role to the new user immediately
        if (inviteData.user) {
            const { error: roleAssignError } = await adminClient
                .from("user_roles")
                .insert({ user_id: inviteData.user.id, role: role });

            if (roleAssignError) {
                console.error("Error assigning role:", roleAssignError);
                // User created but role failed - return partial success or error? 
                // Better to return error but the user exists.
                return new Response(JSON.stringify({
                    error: "User invited but role assignment failed. Please manually assign role."
                }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            // Log the action explicitly
            await adminClient.from("audit_logs").insert({
                action: "USER_INVITED",
                entity_type: "user",
                entity_id: inviteData.user.id,
                details: { email, role, invited_by: user.id },
                user_id: user.id // Log who invited them
            });
        }

        return new Response(JSON.stringify({ success: true, message: "Invitation sent successfully" }), {
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
