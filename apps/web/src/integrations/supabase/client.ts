import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_ANON_KEY;

// The proxy URL intercepts requests and injects the HTTP-only access_token cookie.
// createClient REQUIRES an absolute URL, so we construct it using window.location.
const PROXY_URL = typeof window !== "undefined" ? `${window.location.origin}/api/supabase` : SUPABASE_URL;

export const supabase = createClient<Database>(
  PROXY_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Session is managed via HTTP-only cookies set by the server.
      // The Supabase JS client should NOT manage its own session storage.
      persistSession: false,
      autoRefreshToken: false, // Disabled since refresh is handled by /api/auth/refresh if needed
      detectSessionInUrl: false,
    },
  }
);

export { SUPABASE_URL };

// The proxy URL is for edge functions only (to avoid exposing the anon key
// in the request from the browser to the edge function layer).

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

