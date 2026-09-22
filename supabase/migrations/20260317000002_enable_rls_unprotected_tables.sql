-- ======================================================================
-- Migration: Enable RLS on all tables flagged by Supabase Security Advisor
-- Run: supabase db push  OR paste into Supabase SQL Editor
-- ======================================================================
-- ── 1. project_views partition tables ────────────────────────────────────────
-- Each partition must have RLS enabled individually.
-- Policy intent:
--   • anon/authenticated may INSERT view events (tracking page visits)
--   • Only admins may SELECT (raw analytics — admin dashboard uses service role)
DO $$
DECLARE 
  tbl text;
  partitions text[] := ARRAY [
    'project_views_2026_02', 'project_views_2026_03', 'project_views_2026_04',
    'project_views_2026_05', 'project_views_2026_06', 'project_views_2026_07',
    'project_views_2026_08', 'project_views_2026_09', 'project_views_2026_10',
    'project_views_2026_11', 'project_views_2026_12', 'project_views_2027_01'
  ];
BEGIN 
  FOREACH tbl IN ARRAY partitions LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
      
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=format('public_insert_%s', tbl)) THEN
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)',
            format('public_insert_%s', tbl), tbl
        );
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=format('admin_select_%s', tbl)) THEN
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT USING (
                 EXISTS (
                   SELECT 1 FROM public.user_roles ur
                   WHERE ur.user_id = auth.uid() AND ur.role = ''admin''
                 )
               )',
            format('admin_select_%s', tbl), tbl
        );
      END IF;
    END IF;
  END LOOP;
END $$;
-- ── 2. analytics_events_default ──────────────────────────────────────────────
-- Default partition for the analytics_events partitioned table.
-- Policy: same as project_views partitions.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='analytics_events_default') THEN
    ALTER TABLE public.analytics_events_default ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='analytics_events_default' AND policyname='public_insert_analytics_events_default') THEN
      CREATE POLICY "public_insert_analytics_events_default" ON public.analytics_events_default 
        FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='analytics_events_default' AND policyname='admin_select_analytics_events_default') THEN
      CREATE POLICY "admin_select_analytics_events_default" ON public.analytics_events_default 
        FOR SELECT USING (
          EXISTS (
              SELECT 1
              FROM public.user_roles ur
              WHERE ur.user_id = auth.uid()
                  AND ur.role = 'admin'
          )
        );
    END IF;
  END IF;
END $$;
-- ── 3. comments ──────────────────────────────────────────────────────────────
-- Public blog comments.
-- Policy intent:
--   • Anyone can READ comments (blog is public)
--   • Authenticated users can INSERT their own comments
--   • Users can UPDATE/DELETE only their own comments
--   • Admins can DELETE any comment (moderation)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='comments') THEN
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='public_read_comments') THEN
      CREATE POLICY "public_read_comments" ON public.comments FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='authenticated_insert_comments') THEN
      CREATE POLICY "authenticated_insert_comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='owner_update_comments') THEN
      CREATE POLICY "owner_update_comments" ON public.comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='owner_or_admin_delete_comments') THEN
      CREATE POLICY "owner_or_admin_delete_comments" ON public.comments FOR DELETE TO authenticated USING (
          user_id = auth.uid()
          OR EXISTS (
              SELECT 1
              FROM public.user_roles ur
              WHERE ur.user_id = auth.uid()
                  AND ur.role = 'admin'
          )
      );
    END IF;
  END IF;
END $$;