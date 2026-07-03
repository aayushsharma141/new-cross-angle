import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_ANON_KEY;

// createClient REQUIRES an absolute URL — relative paths like "/api/supabase"
// will throw "Failed to construct 'URL': Invalid URL" at module init time,
// which kills React before it can mount. Use the real Supabase URL here.
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Session is managed via HTTP-only cookies set by the server.
      // The Supabase JS client should NOT manage its own session storage.
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // Use the real Supabase URL for auth endpoints
    },
  }
);

export { SUPABASE_URL };

// The proxy URL is for edge functions only (to avoid exposing the anon key
// in the request from the browser to the edge function layer).
const PROXY_URL = "/api/supabase";

export async function invokeEdge<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: { message: string } | null }> {

  try {
    const res = await fetch(`${PROXY_URL}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Note: Edge middleware will automatically inject the Authorization header 
      // from the access_token HTTP-only cookie.
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: {
          message: (data?.error as string) || `Request failed with status ${res.status}`,
        },
      };
    }

    if (data?.error) {
      return { data: null, error: { message: String(data.error) } };
    }

    return { data: data as T, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reach the server";
    return { data: null, error: { message: msg } };
  }
}

