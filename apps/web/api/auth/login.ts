import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import { isSameOriginRequest, checkAuthRateLimit, getClientIp } from "../_lib/security";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Read env vars lazily (inside the function) so module caching doesn't capture empty strings
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // F-08: reject cross-origin POSTs before touching auth state.
  if (!isSameOriginRequest(req)) {
    return res.status(403).json({ error: "Invalid request origin" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Auth client (anon key) — used to sign in the user
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // F-07: throttle by email (tight) and by IP (looser, catches spray-across-many-emails).
  const allowed = await checkAuthRateLimit(supabase, [
    { key: `email:${String(email).toLowerCase()}`, max: 5, windowSeconds: 900 },
    { key: `ip:${getClientIp(req)}`, max: 20, windowSeconds: 900 },
  ]);
  if (!allowed) {
    res.setHeader("Retry-After", "900");
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  if (!data.session || !data.user) {
    return res.status(401).json({ error: "No session returned" });
  }

  // ── Resolve user role ──────────────────────────────────────────────────────
  // Use service key if available (bypasses RLS) to reliably read user_roles.
  // Falls back to the authed session otherwise.
  let role: string | null = null;

  try {
    const adminClient = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
      : supabase;

    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    role = roleRow?.role ?? null;
  } catch {
    // Non-fatal: role will be resolved client-side by AuthProvider
    role = null;
  }

  // ── Set HTTP-only cookies ──────────────────────────────────────────────────
  const accessMaxAge = data.session.expires_in || 3600;
  const accessCookie = serialize("access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  const refreshCookie = serialize("refresh_token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);

  return res.status(200).json({
    user: data.user,
    role,           // ← role returned so the client can redirect immediately
    message: "Logged in successfully",
  });
}
