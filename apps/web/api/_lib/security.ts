import type { VercelRequest } from "@vercel/node";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * F-08 — verified-origin CSRF defense for cookie-authenticated, state-changing auth endpoints.
 *
 * Rather than a hardcoded domain allow-list (this app deploys to a canonical domain plus a
 * per-branch Vercel preview URL that changes every deploy — see STATE.md), this compares the
 * request's Origin (or Referer, as a fallback) against the request's OWN Host/X-Forwarded-Host +
 * X-Forwarded-Proto: "is this request coming from the page this deployment itself served."
 * Correct on localhost, every preview, and production without any configuration.
 *
 * All legitimate callers are same-origin relative fetches (AuthProvider.tsx, AdminAuth.tsx,
 * client.ts) which always send Origin on POST — so a POST with no Origin and no Referer is
 * treated as untrusted too.
 */
export function isSameOriginRequest(req: VercelRequest): boolean {
    const headers = req.headers as Record<string, string | string[] | undefined>;
    const get = (name: string): string | undefined => {
        const v = headers[name];
        return Array.isArray(v) ? v[0] : v;
    };

    const host = get("x-forwarded-host") || get("host");
    if (!host) return false;

    const proto = get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    const expectedOrigin = `${proto}://${host}`;

    const origin = get("origin");
    if (origin) return origin === expectedOrigin;

    const referer = get("referer");
    if (referer) {
        try {
            return new URL(referer).origin === expectedOrigin;
        } catch {
            return false;
        }
    }

    // No Origin and no Referer on a state-changing request: reject.
    return false;
}

interface RateLimitIdentifier {
    key: string;
    max: number;
    windowSeconds: number;
}

/**
 * F-07 — sliding-window rate limit backed by public.check_and_record_auth_attempt
 * (migration 20260921000000_f07_auth_rate_limit.sql). Checks every identifier (e.g. per-email
 * AND per-IP) and blocks if any of them trips.
 *
 * Fails OPEN if the RPC itself errors (e.g. the migration has not been applied yet) so a database
 * hiccup can never turn into a login outage — errors are logged, never thrown.
 */
export async function checkAuthRateLimit(
    supabase: SupabaseClient,
    identifiers: RateLimitIdentifier[]
): Promise<boolean> {
    for (const { key, max, windowSeconds } of identifiers) {
        try {
            const { data, error } = await supabase.rpc("check_and_record_auth_attempt", {
                p_identifier: key,
                p_max_attempts: max,
                p_window_seconds: windowSeconds,
            });

            if (error) {
                console.error("[checkAuthRateLimit] RPC error, failing open:", error.message);
                continue;
            }

            if (data === false) return false;
        } catch (err) {
            console.error("[checkAuthRateLimit] threw, failing open:", err instanceof Error ? err.message : err);
        }
    }

    return true;
}

/** Extracts the caller's IP the same way supabase/functions/rate_limiter/index.ts does. */
export function getClientIp(req: VercelRequest): string {
    const headers = req.headers as Record<string, string | string[] | undefined>;
    const xff = headers["x-forwarded-for"];
    const value = Array.isArray(xff) ? xff[0] : xff;
    return value?.split(",")[0]?.trim() || "unknown";
}
