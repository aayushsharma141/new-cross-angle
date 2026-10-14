import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_ANON_KEY;

// The proxy URL intercepts requests and injects the HTTP-only access_token cookie.
// createClient REQUIRES an absolute URL, so we construct it using window.location.
const PROXY_URL = typeof window !== "undefined" ? `${window.location.origin}/api/supabase` : SUPABASE_URL;

/**
 * 401 auto-refresh fetch wrapper:
 * If an authed request to /api/supabase returns 401, calls /api/auth/refresh
 * to obtain a fresh access_token cookie, and retries the request once only.
 */
async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401 && typeof window !== "undefined") {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    // Only attempt refresh for /api/supabase requests and never loop
    if (urlStr.includes("/api/supabase") && !(init as Record<string, unknown> | undefined)?._isRetry) {
      try {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const retryInit = { ...init, _isRetry: true };
          return await fetch(input, retryInit);
        }
      } catch {
        // Refresh failed, return original 401
      }
    }
  }
  return res;
}

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
    global: {
      fetch: authedFetch,
    },
  }
);

export { SUPABASE_URL };

// The proxy URL is for edge functions only (to avoid exposing the anon key
// in the request from the browser to the edge function layer).

/**
 * Call an edge function over the `/api/supabase` proxy, returning the raw
 * Response.
 *
 * `invokeEdge` covers the JSON-in/JSON-out case. Use this when the request or
 * the response is not JSON — a FormData upload, a zip download — where you need
 * the Response itself. Both travel the proxy path, so middleware.ts (prod) and
 * the Vite proxy (dev) inject the HTTP-only access_token as Authorization.
 *
 * Never fetch `${VITE_SUPABASE_URL}/functions/v1/...` directly from the browser:
 * that skips the proxy, so no cookie is injected and the call is unauthenticated.
 */
export function edgeFetch(functionName: string, init?: RequestInit): Promise<Response> {
  return authedFetch(`${PROXY_URL}/functions/v1/${functionName}`, init);
}

export async function invokeEdge<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: { message: string } | null }> {

  try {
    const res = await authedFetch(`${PROXY_URL}/functions/v1/${functionName}`, {
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

