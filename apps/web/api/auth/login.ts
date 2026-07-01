import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Read env vars lazily (inside the function) so module caching doesn't capture empty strings
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  if (!data.session) {
    return res.status(401).json({ error: "No session returned" });
  }

  // Set HTTP-only cookies
  const accessCookie = serialize("access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  const refreshCookie = serialize("refresh_token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);

  return res.status(200).json({
    user: data.user,
    message: "Logged in successfully",
  });
}
