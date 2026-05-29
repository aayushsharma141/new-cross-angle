import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export { SUPABASE_URL };

export async function invokeEdge<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: { message: string } | null }> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
