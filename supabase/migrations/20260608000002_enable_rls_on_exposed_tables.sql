-- ============================================================
-- Migration: Enable RLS on all previously exposed tables
-- Date: 2026-06-08
-- Author: Automated Remediation — Security Audit Finding §2
-- 
-- BEFORE APPLYING: Verify your app does not rely on unrestricted
-- public reads/writes on any of these tables. The policies below
-- enforce least-privilege access for each table group.
-- ============================================================

-- ── 1. PROJECT VIEWS (parent table + 12 monthly partitions) ─────────────────
-- Policy: anon users may INSERT view events, only admins may SELECT/DELETE.

ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_07 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_08 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_11 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_12 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2027_01 ENABLE ROW LEVEL SECURITY;

-- Allow any visitor to register a page view
CREATE POLICY "anon_insert_project_views"
  ON public.project_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins may read view analytics
CREATE POLICY "admin_read_project_views"
  ON public.project_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins may delete stale records
CREATE POLICY "admin_delete_project_views"
  ON public.project_views
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );


-- ── 2. COMMENTS ─────────────────────────────────────────────────────────────
-- Policy: authenticated users may INSERT and SELECT their own comments.
--         Admins may manage all comments.

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user may post a comment
CREATE POLICY "authenticated_insert_comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users may read all approved comments (for public display)
CREATE POLICY "public_read_approved_comments"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (true);  -- Adjust to: status = 'approved' if moderation is needed

-- Users may delete only their own comments
CREATE POLICY "owner_delete_comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Admins may manage all comments
CREATE POLICY "admin_manage_all_comments"
  ON public.comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );


-- ── 3. ANALYTICS EVENTS ─────────────────────────────────────────────────────
-- Policy: anyone may INSERT analytics events (write-only).
--         Only admins may READ the event stream.

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events_default ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_analytics_events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_read_analytics_events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Mirror the same policies on the default partition
CREATE POLICY "anon_insert_analytics_events_default"
  ON public.analytics_events_default
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_read_analytics_events_default"
  ON public.analytics_events_default
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );


-- ── 4. WEBHOOK FAILURES ─────────────────────────────────────────────────────
-- Policy: webhook_failures contains full payloads with API tokens.
--         ONLY admins and service_role may access this table.

ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;

-- Service role (Edge Functions) may insert failure records
-- (service_role bypasses RLS by default — this policy is for authenticated admins only)
CREATE POLICY "admin_manage_webhook_failures"
  ON public.webhook_failures
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ── Verification query ───────────────────────────────────────────────────────
-- Run this after applying to confirm all tables have RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
