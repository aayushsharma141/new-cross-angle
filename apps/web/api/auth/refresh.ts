import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie || "";
  const refreshTokenMatch = cookies.match(/refresh_token=([^;]+)/);
  const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token found" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    // Clear cookies if refresh fails
    res.setHeader("Set-Cookie", [
      serialize("access_token", "", { path: "/", maxAge: 0 }),
      serialize("refresh_token", "", { path: "/api/auth/refresh", maxAge: 0 }),
    ]);
    return res.status(401).json({ error: "Session expired or invalid" });
  }

  const accessCookie = serialize("access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  const refreshCookie = serialize("refresh_token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60,
  });

  res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);

  return res.status(200).json({
    user: data.user,
  });
}
