DO $$ 
BEGIN
  -- ── 1. PROJECT VIEWS ────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views') THEN
    EXECUTE 'ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "anon_insert_project_views" ON public.project_views';
    EXECUTE 'CREATE POLICY "anon_insert_project_views" ON public.project_views FOR INSERT TO anon, authenticated WITH CHECK (true)';
    
    EXECUTE 'DROP POLICY IF EXISTS "admin_read_project_views" ON public.project_views';
    EXECUTE 'CREATE POLICY "admin_read_project_views" ON public.project_views FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';

    EXECUTE 'DROP POLICY IF EXISTS "admin_delete_project_views" ON public.project_views';
    EXECUTE 'CREATE POLICY "admin_delete_project_views" ON public.project_views FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';

    -- partitions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_02') THEN EXECUTE 'ALTER TABLE public.project_views_2026_02 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_03') THEN EXECUTE 'ALTER TABLE public.project_views_2026_03 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_04') THEN EXECUTE 'ALTER TABLE public.project_views_2026_04 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_05') THEN EXECUTE 'ALTER TABLE public.project_views_2026_05 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_06') THEN EXECUTE 'ALTER TABLE public.project_views_2026_06 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_07') THEN EXECUTE 'ALTER TABLE public.project_views_2026_07 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_08') THEN EXECUTE 'ALTER TABLE public.project_views_2026_08 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_09') THEN EXECUTE 'ALTER TABLE public.project_views_2026_09 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_10') THEN EXECUTE 'ALTER TABLE public.project_views_2026_10 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_11') THEN EXECUTE 'ALTER TABLE public.project_views_2026_11 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2026_12') THEN EXECUTE 'ALTER TABLE public.project_views_2026_12 ENABLE ROW LEVEL SECURITY'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views_2027_01') THEN EXECUTE 'ALTER TABLE public.project_views_2027_01 ENABLE ROW LEVEL SECURITY'; END IF;
  END IF;

  -- ── 2. COMMENTS ─────────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "authenticated_insert_comments" ON public.comments';
    EXECUTE 'CREATE POLICY "authenticated_insert_comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)';
    
    EXECUTE 'DROP POLICY IF EXISTS "public_read_approved_comments" ON public.comments';
    EXECUTE 'CREATE POLICY "public_read_approved_comments" ON public.comments FOR SELECT TO anon, authenticated USING (true)';
    
    EXECUTE 'DROP POLICY IF EXISTS "owner_delete_comments" ON public.comments';
    EXECUTE 'CREATE POLICY "owner_delete_comments" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid())';
    
    EXECUTE 'DROP POLICY IF EXISTS "admin_manage_all_comments" ON public.comments';
    EXECUTE 'CREATE POLICY "admin_manage_all_comments" ON public.comments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';
  END IF;

  -- ── 3. ANALYTICS EVENTS ─────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
    EXECUTE 'ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "anon_insert_analytics_events" ON public.analytics_events';
    EXECUTE 'CREATE POLICY "anon_insert_analytics_events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true)';
    
    EXECUTE 'DROP POLICY IF EXISTS "admin_read_analytics_events" ON public.analytics_events';
    EXECUTE 'CREATE POLICY "admin_read_analytics_events" ON public.analytics_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events_default') THEN
    EXECUTE 'ALTER TABLE public.analytics_events_default ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "anon_insert_analytics_events_default" ON public.analytics_events_default';
    EXECUTE 'CREATE POLICY "anon_insert_analytics_events_default" ON public.analytics_events_default FOR INSERT TO anon, authenticated WITH CHECK (true)';
    
    EXECUTE 'DROP POLICY IF EXISTS "admin_read_analytics_events_default" ON public.analytics_events_default';
    EXECUTE 'CREATE POLICY "admin_read_analytics_events_default" ON public.analytics_events_default FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';
  END IF;

  -- ── 4. WEBHOOK FAILURES ─────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_failures') THEN
    EXECUTE 'ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "admin_manage_webhook_failures" ON public.webhook_failures';
    EXECUTE 'CREATE POLICY "admin_manage_webhook_failures" ON public.webhook_failures FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin'')))';
  END IF;
END $$;
