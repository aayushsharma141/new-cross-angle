-- ======================================================================
-- Migration: Enable RLS on all tables flagged by Supabase Security Advisor
-- Run: supabase db push  OR paste into Supabase SQL Editor
-- ======================================================================
-- ── 1. project_views partition tables ────────────────────────────────────────
-- Each partition must have RLS enabled individually.
-- Policy intent:
--   • anon/authenticated may INSERT view events (tracking page visits)
--   • Only admins may SELECT (raw analytics — admin dashboard uses service role)
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
DO $$
DECLARE tbl text;
partitions text [] := ARRAY [
    'project_views_2026_02', 'project_views_2026_03', 'project_views_2026_04',
    'project_views_2026_05', 'project_views_2026_06', 'project_views_2026_07',
    'project_views_2026_08', 'project_views_2026_09', 'project_views_2026_10',
    'project_views_2026_11', 'project_views_2026_12', 'project_views_2027_01'
  ];
BEGIN FOREACH tbl IN ARRAY partitions LOOP -- Public can insert view events (page tracking)
EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "public_insert_%1$s"
       ON public.%1$I FOR INSERT TO anon, authenticated WITH CHECK (true)',
    tbl
);
-- Only admins can read raw view data
EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "admin_select_%1$s"
       ON public.%1$I FOR SELECT
       USING (
         EXISTS (
           SELECT 1 FROM public.user_roles ur
           WHERE ur.user_id = auth.uid() AND ur.role = ''admin''
         )
       )',
    tbl
);
END LOOP;
END;
$$;
-- ── 2. analytics_events_default ──────────────────────────────────────────────
-- Default partition for the analytics_events partitioned table.
-- Policy: same as project_views partitions.
ALTER TABLE public.analytics_events_default ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "public_insert_analytics_events_default" ON public.analytics_events_default FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "admin_select_analytics_events_default" ON public.analytics_events_default FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
                AND ur.role = 'admin'
        )
    );
-- ── 3. comments ──────────────────────────────────────────────────────────────
-- Public blog comments.
-- Policy intent:
--   • Anyone can READ comments (blog is public)
--   • Authenticated users can INSERT their own comments
--   • Users can UPDATE/DELETE only their own comments
--   • Admins can DELETE any comment (moderation)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "public_read_comments" ON public.comments FOR
SELECT USING (true);
CREATE POLICY IF NOT EXISTS "authenticated_insert_comments" ON public.comments FOR
INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "owner_update_comments" ON public.comments FOR
UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "owner_or_admin_delete_comments" ON public.comments FOR DELETE TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
    )
);