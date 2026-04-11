/**
 * _lib/security.ts
 * 
 * Shared security middleware for all CrossAngle Edge Functions.
 * 
 * Provides:
 * 1. Strict CORS — environment-configurable, never wildcard on credentialed routes.
 * 2. Persistent rate limiting — backed by Deno KV (survives function restarts).
 * 3. JWT authentication & RBAC — validates Supabase session tokens.
 * 4. Standard secure response helpers that auto-report to Sentry.
 * 5. Sentry Deno SDK integration — 5xx errors and rate-limit breaches reported automatically.
 * 
 * Usage:
 *   import { buildCorsHeaders, checkRateLimit, verifyAdmin } from "../_lib/security.ts";
 */

/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.4/dist/module/index.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ─── Sentry Deno SDK ──────────────────────────────────────────────────────────
// Uses the official Sentry Deno/Cloudflare Workers SDK.
// DSN is read from the SENTRY_DSN environment variable. If not set,
// sentryReport() is a silent no-op so functions work without Sentry configured.
import * as SentryDeno from "https://deno.land/x/sentry@8.33.0/index.mjs";

let _sentryInitialised = false;

function getSentryClient() {
    const dsn = Deno.env.get("SENTRY_DSN");
    if (!dsn) return null;

    if (!_sentryInitialised) {
        SentryDeno.init({
            dsn,
            environment: Deno.env.get("DENO_ENV") ?? "production",
            tracesSampleRate: 0.0, // Edge functions: capture errors only, no perf traces.
            integrations: [],
        });
        _sentryInitialised = true;
    }

    return SentryDeno;
}

/**
 * Reports an error or message to Sentry. Silent no-op if SENTRY_DSN is unset.
 *
 * @param fnName   - Name of the calling edge function (e.g. "submit-estimate")
 * @param error    - The Error object or message string
 * @param extra    - Optional key/value metadata (e.g. { status: 429, ip: "1.2.3.4" })
 * @param level    - Sentry severity level (default: "error")
 */
export async function sentryReport(
    fnName: string,
    error: unknown,
    extra: Record<string, unknown> = {},
    level: "fatal" | "error" | "warning" | "info" = "error",
): Promise<void> {
    const sentry = getSentryClient();
    if (!sentry) return;

    sentry.withScope((scope: SentryDeno.Scope) => {
        scope.setTag("edge_fn", fnName);
        scope.setTag("runtime", "deno");
        scope.setLevel(level);
        scope.setExtras(extra);

        if (error instanceof Error) {
            sentry.captureException(error);
        } else {
            sentry.captureMessage(String(error), level);
        }
    });

    // Flush ensures the event is sent before the function returns.
    // If flush takes >2 s we proceed anyway (cold start budget).
    await sentry.close(2_000).catch(() => {});
}


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
    fnName?: string,
): Response {
    const cors = buildCorsHeaders(req, corsOpts);

    // Report rate-limit breaches to Sentry as warnings — they may indicate
    // bot activity, scraping, or credential stuffing attempts.
    if (fnName) {
        sentryReport(
            fnName,
            "Rate limit exceeded",
            {
                remaining: result.remaining,
                resetAt: new Date(result.resetAt).toISOString(),
                path: new URL(req.url).pathname,
                ip: req.headers.get("x-forwarded-for") ?? "unknown",
            },
            "warning",
        ).catch(() => {});
    }

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
    fnName?: string,
    originalError?: unknown,
): Response {
    // Auto-report to Sentry — fire-and-forget (don't await to avoid blocking the response).
    if (fnName ?? originalError) {
        sentryReport(
            fnName ?? "unknown-edge-fn",
            originalError ?? new Error(message),
            { message, path: new URL(req.url).pathname },
            "error",
        ).catch(() => {});
    }

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
        headers: { ...cors, ...rlHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
    });
}

// ─── Security & Cache Headers ─────────────────────────────────────────────────

/**
 * Minimal CSP header for API-only Edge Functions.
 * Not intended for HTML responses — use a dedicated CSP for those.
 */
export function buildSecurityHeaders(): Record<string, string> {
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    };
}

/**
 * Cache-Control header presets.
 * Use 'no-store' for anything containing user data.
 * Use 'public' only for fully public, non-personalised responses.
 */
export function buildCacheHeaders(preset: "no-store" | "private" | "public" = "no-store"): Record<string, string> {
    const values = {
        "no-store": "no-store, no-cache, must-revalidate",
        "private": "private, max-age=0, must-revalidate",
        "public": "public, max-age=300, stale-while-revalidate=60",
    };
    return { "Cache-Control": values[preset] };
}

// ─── Idempotency ──────────────────────────────────────────────────────────────

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000; // 24 hours

/**
 * Checks whether a request with the given idempotency key was already processed.
 *
 * Attack/bug prevented: duplicate lead inserts from double-clicks, network
 * retries, or form re-submissions.
 *
 * Usage:
 *   const idem = await checkIdempotency(key, "process-lead");
 *   if (idem.duplicate) return idem.cachedResponse(req);
 *   // ... process ...
 *   await idem.markComplete();
 */
export async function checkIdempotency(
    key: string,
    namespace: string,
): Promise<{ duplicate: boolean; markComplete: () => Promise<void> }> {
    const kv = await getKv();
    const kvKey = ["idem", namespace, key];
    const existing = await kv.get<{ ts: number }>(kvKey);

    if (existing.value) {
        return {
            duplicate: true,
            markComplete: async () => { /* no-op — already marked */ },
        };
    }

    return {
        duplicate: false,
        markComplete: async () => {
            await kv.set(kvKey, { ts: Date.now() }, { expireIn: IDEMPOTENCY_TTL_MS });
        },
    };
}

// ─── Structured Logging ───────────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error";

/**
 * Emits structured JSON logs compatible with Supabase Edge Function log ingestion.
 * Prefer this over raw console.log() for searchable, filterable telemetry.
 */
export function structuredLog(
    level: LogLevel,
    fn: string,
    message: string,
    meta: Record<string, unknown> = {},
): void {
    const entry = {
        ts: new Date().toISOString(),
        level,
        fn,
        message,
        ...meta,
    };
    if (level === "error") {
        console.error(JSON.stringify(entry));
    } else if (level === "warn") {
        console.warn(JSON.stringify(entry));
    } else {
        console.log(JSON.stringify(entry));
    }
}

// ─── Webhook Signature Helper ────────────────────────────────────────────────

/**
 * Signs a JSON payload for outbound webhooks using HMAC-SHA256.
 * Generates a string in standard `t=<timestamp>,v1=<signature>` format 
 * to be sent in the `X-CrossAngle-Signature` header.
 * 
 * @param payload - The exact JSON string being sent in the webhook body.
 * @returns The signature string or null if WEBHOOK_SIGNATURE_SECRET is not configured.
 */
export async function signWebhookPayload(payload: string): Promise<string | null> {
    const secret = Deno.env.get("WEBHOOK_SIGNATURE_SECRET");
    if (!secret) return null;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${timestamp}.${payload}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageData
    );

    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return `t=${timestamp},v1=${signatureHex}`;
}
