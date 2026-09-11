import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, token_hash, access_token, refresh_token, type, password } = req.body || {};

  // Password complexity and length validation
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }

  if (!code && !token_hash && !access_token) {
    return res.status(400).json({ error: "Invalid or expired recovery code" });
  }

  // Implicit flow requires BOTH access_token and refresh_token to establish a valid session
  if (access_token && (!refresh_token || typeof refresh_token !== "string" || !refresh_token.trim())) {
    return res.status(400).json({ error: "Both access_token and refresh_token are required for session recovery" });
  }

  // Ephemeral isolated client — never persists session, never consumes incoming cookie headers
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    let sessionEstablished = false;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session) {
        sessionEstablished = true;
      }
    } else if (token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: (type as "recovery") || "recovery",
      });
      if (!error && data?.session) {
        sessionEstablished = true;
      }
    } else if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (!error && data?.session) {
        sessionEstablished = true;
      }
    }

    if (!sessionEstablished) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    // Update the password on the recovery session
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Globally revoke the recovery session so single-use tokens cannot be reused
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Best-effort revocation
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch {
    return res.status(500).json({ error: "Password recovery failed" });
  }
}
