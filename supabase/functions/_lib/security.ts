/**
 * _lib/security.ts
 * 
 * Shared security middleware for all CrossAngle Edge Functions.
 * 
 * Provides:
 * 1. Strict CORS — environment-configurable, never wildcard on credentialed routes.
 * 2. Persistent rate limiting — backed by Deno KV (survives function restarts).
 * 3. JWT authentication & RBAC — validates Supabase session tokens.
 * 4. Standard secure response helpers.
 * 
 * Usage:
 *   import { buildCorsHeaders, checkRateLimit, verifyAdmin } from "../_lib/security.ts";
 */

/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.4/dist/module/index.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ─── Environment Helpers ─────────────────────────────────────────────────────

/**
 * Canonical list of trusted origins. Pulled from the ALLOWED_ORIGINS env var.
 * In production set: ALLOWED_ORIGINS=https://crossangleinterior.com,https://www.crossangleinterior.com
 * In staging set: ALLOWED_ORIGINS=https://staging.crossangleinterior.com
 */
function getTrustedOrigins(): string[] {
    const env = Deno.env.get("ALLOWED_ORIGINS") ?? "";
    const base = env
        .split(",")
        .map((o: string) => o.trim())
        .filter(Boolean);

    // Always allow localhost in development (detected by empty ALLOWED_ORIGINS or explicit flag).
    const isDev = Deno.env.get("DENO_ENV") !== "production" && base.length === 0;
    if (isDev) {
        base.push(
            "http://localhost:8080",
            "http://localhost:3000",
            "http://127.0.0.1:8080",
        );
    }
    return base;
}

// ─── CORS ────────────────────────────────────────────────────────────────────

export interface CorsOptions {
    /**
     * Whether the route requires credentials (Authorization header / cookies).
     * When true: the `Origin` MUST be in the allowlist — wildcard is NEVER used.
     * When false: public endpoints may fall back to a restricted non-credentialed header.
     */
    credentialed?: boolean;
}

/**
 * Builds correct CORS headers for a request.
 *
 * Attack prevented: Cross-Origin request forgery from malicious sites.
 *
 * Before: every function returned `"Access-Control-Allow-Origin": "*"`
 *         which allowed any website on the internet to call the API.
 *
 * After:  only origins listed in ALLOWED_ORIGINS are reflected back.
 *         If the request origin is not trusted, the header is omitted,
 *         causing the browser to block the response.
 */
export function buildCorsHeaders(
    req: Request,
    opts: CorsOptions = {},
): Record<string, string> {
    const { credentialed = false } = opts;
    const requestOrigin = req.headers.get("origin") ?? "";
    const trusted = getTrustedOrigins();

    const isOriginTrusted = trusted.some((o) => o === requestOrigin);

    const headers: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, x-requested-with",
        "Vary": "Origin",
    };

    if (isOriginTrusted) {
        headers["Access-Control-Allow-Origin"] = requestOrigin;
        if (credentialed) {
            headers["Access-Control-Allow-Credentials"] = "true";
        }
    } else if (!credentialed && requestOrigin === "") {
        // Non-browser requests (curl, server-to-server) with no Origin header.
        // Allowed only for public, non-credentialed endpoints.
        headers["Access-Control-Allow-Origin"] = "null";
    }
    // If origin is present but untrusted on a credentialed route → no ACAO header
    // → browser blocks the response. This is intentional.

    return headers;
}

/**
 * Handles CORS preflight. Call this at the top of every handler.
 */
export function handlePreflight(
    req: Request,
    opts: CorsOptions = {},
): Response | null {
    if (req.method !== "OPTIONS") return null;
    return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(req, opts),
    });
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

let _kv: Deno.Kv | null = null;

async function getKv(): Promise<Deno.Kv> {
    if (!_kv) _kv = await Deno.openKv();
    return _kv;
}

export interface RateLimitOptions {
    /** Bucket name – allows different limits for different endpoint groups. */
    bucket?: string;
    /** Requests allowed per window. Env var RATE_LIMIT_MAX overrides this. */
    max?: number;
    /** Window length in ms. Env var RATE_LIMIT_WINDOW_MS overrides this. */
    windowMs?: number;
}

export interface RateLimitResult {
    limited: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Persistent, KV-backed rate limiter.
 *
 * Attack prevented: Brute-force submissions, credential stuffing, scraping.
 *
 * Before: process-lead had an in-memory Map (reset on every cold start).
 *         All other functions had NO rate limiting whatsoever.
 *
 * After:  Deno KV persists counters across warm instances.
 *         Returns remaining quota and reset timestamp in headers.
 *
 * Key is "bucket:identifier" where identifier is the client IP.
 */
export async function checkRateLimit(
    req: Request,
    identifier: string,
    opts: RateLimitOptions = {},
): Promise<RateLimitResult> {
    const bucket = opts.bucket ?? "default";
    const max = opts.max ?? parseInt(Deno.env.get("RATE_LIMIT_MAX") ?? "60");
    const windowMs =
        opts.windowMs ??
        parseInt(Deno.env.get("RATE_LIMIT_WINDOW_MS") ?? "60000");

    const now = Date.now();
    const kv = await getKv();
    const key = ["rl", bucket, identifier];

    const entry = await kv.get<{ count: number; resetAt: number }>(key);

    if (!entry.value || now >= entry.value.resetAt) {
        const resetAt = now + windowMs;
        await kv.set(key, { count: 1, resetAt }, { expireIn: windowMs });
        return { limited: false, remaining: max - 1, resetAt };
    }

    const { count, resetAt } = entry.value;

    if (count >= max) {
        return { limited: true, remaining: 0, resetAt };
    }

    await kv.set(key, { count: count + 1, resetAt }, { expireIn: windowMs });
    return { limited: false, remaining: max - count - 1, resetAt };
}

/**
 * Extracts the best available client identifier:
 * 1. Authenticated user ID (most precise, can't be spoofed)
 * 2. x-forwarded-for IP (from Supabase proxy)
 * 3. "unknown" fallback
 */
export function getClientId(req: Request, userId?: string): string {
    if (userId) return `uid:${userId}`;
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return `ip:${xff.split(",")[0].trim()}`;
    return "ip:unknown";
}

/**
 * Convenience: builds a 429 response with correct rate-limit headers.
 */
export function rateLimitResponse(
    req: Request,
    result: RateLimitResult,
    corsOpts: CorsOptions = {},
): Response {
    const cors = buildCorsHeaders(req, corsOpts);
    return new Response(
        JSON.stringify({
            error: "Too Many Requests",
            retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
            status: 429,
            headers: {
                ...cors,
                "Content-Type": "application/json",
                "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                "X-RateLimit-Limit": Deno.env.get("RATE_LIMIT_MAX") ?? "60",
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
            },
        },
    );
}

// ─── Authentication & RBAC ───────────────────────────────────────────────────

export interface AuthResult {
    user: { id: string; email?: string } | null;
    error: string | null;
}

export interface AdminAuthResult {
    user: { id: string; email?: string };
    error: null;
}

/**
 * Validates the Supabase JWT from the Authorization header.
 *
 * Attack prevented: Unauthenticated access to protected admin endpoints.
 *
 * Before: admin-level endpoints like manage-user verified auth, but many others
 *         did not. CORS was the only "barrier" (easily bypassed with curl/Postman).
 *
 * After:  all protected routes call verifyAuth() which validates the JWT with
 *         Supabase's auth server, ensuring only logged-in users can proceed.
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return { user: null, error: "Missing or malformed Authorization header" };
    }

    const token = authHeader.slice(7);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
        return { user: null, error: "Invalid or expired token" };
    }

    return { user: { id: data.user.id, email: data.user.email }, error: null };
}

/**
 * Verifies auth AND checks that the caller has the 'admin' role.
 * Returns a typed result so callers can narrow the type safely.
 */
export async function verifyAdmin(
    req: Request,
): Promise<AdminAuthResult | { user: null; error: string }> {
    const auth = await verifyAuth(req);
    if (!auth.user) {
        return { user: null, error: auth.error ?? "Unauthorized" };
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleData, error: roleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (roleError || !roleData) {
        return { user: null, error: "Forbidden: admin role required" };
    }

    return { user: auth.user, error: null };
}

// ─── Standard Response Helpers ───────────────────────────────────────────────

export function unauthorizedResponse(
    req: Request,
    message = "Unauthorized",
    corsOpts: CorsOptions = {},
): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { ...buildCorsHeaders(req, corsOpts), "Content-Type": "application/json" },
    });
}

export function forbiddenResponse(
    req: Request,
    message = "Forbidden",
    corsOpts: CorsOptions = {},
): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 403,
        headers: { ...buildCorsHeaders(req, corsOpts), "Content-Type": "application/json" },
    });
}

export function badRequestResponse(
    req: Request,
    message: string,
    corsOpts: CorsOptions = {},
): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...buildCorsHeaders(req, corsOpts), "Content-Type": "application/json" },
    });
}

export function serverErrorResponse(
    req: Request,
    message: string,
    corsOpts: CorsOptions = {},
): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...buildCorsHeaders(req, corsOpts), "Content-Type": "application/json" },
    });
}

export function okResponse(
    req: Request,
    data: unknown,
    corsOpts: CorsOptions = {},
    rateLimitResult?: RateLimitResult,
    maxLimit?: number,
): Response {
    const cors = buildCorsHeaders(req, corsOpts);
    const rlHeaders: Record<string, string> = rateLimitResult
        ? {
            "X-RateLimit-Limit": String(maxLimit ?? 60),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
        }
        : {};

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...cors, ...rlHeaders, "Content-Type": "application/json" },
    });
}
