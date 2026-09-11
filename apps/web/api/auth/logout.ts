import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie || "";
  const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
  const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

  if (accessToken && supabaseUrl && supabaseKey) {
    try {
      // Direct GoTrue logout with scope=global to revoke the session server-side
      await fetch(`${supabaseUrl}/auth/v1/logout?scope=global`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Idempotent: ignore revocation errors if already revoked, expired, or offline
    }
  }

  // Always clear cookies across all applicable paths regardless of revocation outcome
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    serialize("access_token", "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: isProd }),
    serialize("refresh_token", "", { path: "/api", maxAge: 0, httpOnly: true, sameSite: "lax", secure: isProd }),
    serialize("refresh_token", "", { path: "/api/auth/refresh", maxAge: 0, httpOnly: true, sameSite: "lax", secure: isProd }),
  ]);

  return res.status(204).end();
}
