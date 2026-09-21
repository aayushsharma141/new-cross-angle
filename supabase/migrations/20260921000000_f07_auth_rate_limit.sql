-- Migration: F-07 — rate limiting for /api/auth/login
-- Context:
--   POST /api/auth/login had no throttling: 12 rapid bad-password attempts all returned 401, never 429.
--   supabase/functions/rate_limiter/index.ts exists but is a Deno edge function, unreachable from the
--   Node/Vercel serverless handlers under apps/web/api/auth/, and an in-memory counter would not survive
--   across serverless invocations anyway.
-- Fix:
--   A small DB-backed sliding-window counter, following the same shape already used for lead-form spam
--   protection (check_estimate_lead_rate_limit / check_lead_rate_limit in
--   20260311000002_estimate_rates_and_limits.sql): count rows for an identifier within a window, block if
--   over. Called once per email and once per IP from login.ts via the anon-keyed client — no service-role
--   dependency, so it works in every environment. The function prunes its own identifier's expired rows
--   before counting, so the table stays bounded without a cron job.

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_identifier_created_at_idx
    ON public.auth_rate_limits (identifier, created_at);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER function below touches this table. No direct grants to any role.

CREATE OR REPLACE FUNCTION public.check_and_record_auth_attempt(
    p_identifier TEXT,
    p_max_attempts INT,
    p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count INT;
BEGIN
    -- Prune this identifier's expired rows so the table doesn't grow unbounded.
    DELETE FROM public.auth_rate_limits
    WHERE identifier = p_identifier
      AND created_at <= now() - make_interval(secs => p_window_seconds);

    SELECT count(*) INTO v_count
    FROM public.auth_rate_limits
    WHERE identifier = p_identifier
      AND created_at > now() - make_interval(secs => p_window_seconds);

    IF v_count >= p_max_attempts THEN
        RETURN FALSE; -- blocked; do not record another attempt
    END IF;

    INSERT INTO public.auth_rate_limits (identifier) VALUES (p_identifier);
    RETURN TRUE; -- allowed
END;
$$;

-- Safe to expose to anon: it only increments/reads counters keyed by caller-supplied identifiers and
-- cannot read or write anything else. login.ts calls this with the anon key (no service-role dependency).
REVOKE EXECUTE ON FUNCTION public.check_and_record_auth_attempt(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_record_auth_attempt(text, int, int) TO anon, authenticated, service_role;
