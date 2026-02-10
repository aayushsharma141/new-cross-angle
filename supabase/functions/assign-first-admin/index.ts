// Cloud Function: assign-first-admin
// Purpose: During initial setup, allow creating exactly one admin role when there are no admins yet.
// Security: 
// - If an admin already exists, only authenticated admins can assign roles.
// - If no admin exists, allow the first authenticated user to self-assign admin.
// - CORS is restricted to localhost (dev) and explicit origins

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Json = Record<string, unknown>;

type Body = {
  user_id?: string;
  check_signup_enabled?: boolean; // Optional: check if signup is available
};

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  if (envOrigins) {
    return envOrigins.split(",").map(o => o.trim());
  }
  return [];
};

const getCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed:
  // - localhost for development
  // - Explicitly allowed origins from env
  const isAllowed = !origin ||

    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    allowedOrigins.some(allowed => origin === allowed);

  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin || "*") : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for privileged DB access
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if any admin already exists
    const { count: adminCount, error: countError } = await adminClient
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) throw countError;

    const body = (await req.json().catch(() => ({}))) as Body;

    // If client is just checking if signup is available, return status
    if (body.check_signup_enabled) {
      return new Response(JSON.stringify({
        signup_enabled: (adminCount ?? 0) === 0
      } satisfies Json), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedUserId = body.user_id;

    if (!requestedUserId || typeof requestedUserId !== "string") {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no admins exist, only allow caller to assign themselves
    if ((adminCount ?? 0) === 0) {
      if (requestedUserId !== callerUserId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // If admins exist, require caller is admin
      const { data: callerRole, error: callerRoleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", callerUserId)
        .eq("role", "admin")
        .maybeSingle();

      if (callerRoleError || !callerRole) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Upsert admin role for requested user
    const { error: upsertError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: requestedUserId, role: "admin" }, { onConflict: "user_id,role" });

    if (upsertError) throw upsertError;

    console.log(`Admin role assigned to user ${requestedUserId}`);

    return new Response(JSON.stringify({ ok: true } satisfies Json), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in assign-first-admin:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
