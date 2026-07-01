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
  const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
  const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

  if (accessToken) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    // Attempt to sign out globally
    await supabase.auth.signOut();
  }

  // Always clear cookies
  res.setHeader("Set-Cookie", [
    serialize("access_token", "", { path: "/", maxAge: 0 }),
    serialize("refresh_token", "", { path: "/api/auth/refresh", maxAge: 0 }),
  ]);

  return res.status(204).end();
}
