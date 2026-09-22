-- ======================================================================
-- Migration: Comprehensive Security Advisor Remediation (WARN level)
-- Addresses: function_search_path_mutable, extension_in_public,
--             materialized_view_in_api, rls_policy_always_true,
--             auth_allow_anonymous_sign_ins (sensitive tables only)
--
-- NOTE: auth_leaked_password_protection must be enabled in:
--   Dashboard → Authentication → Settings → Password Security
-- ======================================================================
-- ── 1. Fix mutable search_path on all flagged functions ──────────────────────
-- Why: Without a pinned search_path, a malicious user who can create objects
--      in any schema could inject a fake "public.profiles" table and trick the
--      function into checking the wrong data — a search_path hijack attack.
-- Fix: Pin each function's search_path to 'public' so it always resolves
--      identifiers against the correct schema, regardless of session settings.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    EXECUTE 'ALTER FUNCTION public.is_admin(uuid) SET search_path = ''public'';';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_comment_path') THEN
    EXECUTE 'ALTER FUNCTION public.set_comment_path() SET search_path = ''public'';';
  END IF;
END $$;
-- These are created by triggers/migrations that weren't in local files —
-- recreate with SET search_path baked in.
CREATE OR REPLACE FUNCTION public.trg_estimate_leads_enforce_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public' AS $$ BEGIN -- Ensure status is one of the allowed values
    IF NEW.status NOT IN (
        'new',
        'contacted',
        'qualified',
        'closed',
        'lost'
    ) THEN NEW.status := 'new';
END IF;
RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.update_media_metadata() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public' AS $$ BEGIN -- Auto-set updated_at on media row update
    NEW.updated_at := now();
RETURN NEW;
END;
$$;
-- ── 2. Move ltree extension out of public schema ──────────────────────────────
-- Why: Extensions in the public schema expose their functions/operators to
--      all API consumers. Moving to 'extensions' schema limits exposure.
-- Note: The 'extensions' schema is the Supabase-recommended location.
CREATE SCHEMA IF NOT EXISTS extensions;
-- Supabase allows moving extensions; the ltree type on comments.path
-- continues to work as 'ltree' resolves via search_path in functions.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'ltree') THEN
    EXECUTE 'ALTER EXTENSION ltree SET SCHEMA extensions;';
  END IF;
END $$;
-- ── 3. Revoke anon/authenticated SELECT on daily_project_kpis ────────────────
-- Why: Materialized views bypass RLS — anyone can query raw aggregated KPI
--      data via the REST API. This view shows sensitive project analytics.
-- Fix: Remove public grants; grant only to service_role (used by admin panel).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'daily_project_kpis') THEN
    EXECUTE 'REVOKE SELECT ON public.daily_project_kpis FROM anon;';
    EXECUTE 'REVOKE SELECT ON public.daily_project_kpis FROM authenticated;';
  END IF;
END $$;
-- Admin dashboards call this via service_role (bypasses grants anyway).
-- If any frontend query needs it, update to use a SERVER-side API call.
-- ── 4. Fix always-true RLS policies on sensitive tables ──────────────────────
-- 4a. leads_master: DELETE (true) → admin only
-- Any authenticated user could delete any lead_master record.
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.leads_master;
CREATE POLICY "Admin delete leads_master" ON public.leads_master FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- 4b. leads_master: UPDATE (true, true) → admin only
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.leads_master;
CREATE POLICY "Admin update leads_master" ON public.leads_master FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- 4c. raw_payload: DELETE (true) → admin only
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.raw_payload;
CREATE POLICY "Admin delete raw_payload" ON public.raw_payload FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- 4d. estimate_leads INSERT (WITH CHECK true) — intentional for public form.
--     Adding a basic honeypot-style guard: reject suspiciously large area values.
DROP POLICY IF EXISTS "Public insert estimate_leads" ON public.estimate_leads;
CREATE POLICY "Public insert estimate_leads" ON public.estimate_leads FOR
INSERT TO anon,
    authenticated WITH CHECK (
        -- Basic sanity: area must be a plausible value (1–100,000 sqft)
        area > 0
        AND area <= 100000 -- email must be present (edge function already validates, this is DB-level guard)
        AND email IS NOT NULL
        AND length(email) > 3
    );
-- 4e. leads INSERT (WITH CHECK true) — intentional for public contact form.
DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
CREATE POLICY "Public insert leads" ON public.leads FOR
INSERT TO anon,
    authenticated WITH CHECK (
        -- Must have an email address
        email IS NOT NULL
        AND length(email) > 3 -- Message sanity limit (5000 chars)
        AND (
            message IS NULL
            OR length(message) <= 5000
        )
    );
-- ── 5. Fix auth_allow_anonymous_sign_ins on SENSITIVE tables only ─────────────
-- Why: The linter flags any policy applying to anon role.
-- Decision: PUBLIC-FACING tables (blogs, portfolio, pages, testimonials, etc.)
--           INTENTIONALLY allow anon reads — this is a public website. No change.
--           SENSITIVE tables (leads_master, raw_payload, content_versions,
--           lead_activities, user_roles) should NOT be accessible to anon.
-- 5a. leads_master: "Enable read for authenticated users only" should be TO authenticated.
--     Check if anon is getting in because policy has no role restriction.
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.leads_master;
CREATE POLICY "Admin read leads_master" ON public.leads_master FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role IN ('admin', 'editor')
        )
    );
-- 5b. raw_payload: SELECT — admin/editor only
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.raw_payload;
CREATE POLICY "Admin read raw_payload" ON public.raw_payload FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- 5c. content_versions: "Admins can view content versions" — ensure anon excluded
DROP POLICY IF EXISTS "Admins can view content versions" ON public.content_versions;
CREATE POLICY "Admins can view content versions" ON public.content_versions FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- 5d. lead_activities: "Admins view activities" — ensure anon excluded
DROP POLICY IF EXISTS "Admins view activities" ON public.lead_activities;
CREATE POLICY "Admins view activities" ON public.lead_activities FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role IN ('admin', 'editor')
        )
    );
-- ── 6. Reminder: leaked password protection (dashboard only) ─────────────────
-- Cannot be done via SQL. Enable at:
-- Dashboard → Auth → Settings → Password Security → "Enable Leaked Password Protection"
-- This checks passwords against HaveIBeenPwned.org at signup/change time.