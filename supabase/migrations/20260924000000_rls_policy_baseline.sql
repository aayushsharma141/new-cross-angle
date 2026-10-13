-- =============================================================================
-- Migration: RLS policy baseline (2026-09-24)
--
-- Why: between 2026-09-21 and 2026-09-23 almost every row-level-security policy in
-- the public schema disappeared in production (iuuivmwqodefdrrrewol). Of all
-- RLS-enabled tables only five policies survived. With RLS on and no policy,
-- everything except service_role is denied: the public site rendered empty
-- content and the admin CMS/CRM could neither read nor write. The free plan has
-- no backups and keeps 24h of logs, so the prior state could not be restored or
-- dated. Nothing in the repo snapshotted it either (see ADR 0003: the migration
-- directory is a partial changelog).
--
-- This file is therefore a deliberate, complete baseline rather than a replay:
--   * newest RBAC generation per table (rbac_v2 20260702000000, lock_down_site_settings
--     20260911000000); superseded generations are not recreated;
--   * only helpers that exist in production: is_cms_editor() (super_admin/admin/editor),
--     is_crm_viewer() (super_admin/admin/viewer), is_platform_admin() (super_admin/admin),
--     is_admin_or_editor(uid) (= admins, redefined by rbac_v2), has_role(uid, role).
--     is_admin_user() does not exist in production and is never referenced;
--   * editors write every CMS content table (matches CMS_ROLES in adminRoutes.tsx);
--   * historical "any authenticated user may write" policies are tightened to role checks;
--   * public reads are TO anon, authenticated, because the browser client runs as
--     authenticated whenever a staff cookie is present;
--   * visibility filters where the table has the column.
-- Idempotent: every policy is dropped (IF EXISTS) before it is created.
--
-- Intentionally left with no policy (service_role / SECURITY DEFINER access only):
--   auth_rate_limits, project_views_YYYY_MM partitions (parent governs), media_assets.
-- storage.objects media policies were verified intact on 2026-09-24 and are not touched.
-- =============================================================================

-- ─── A. Public content: public read + CMS-editor write ───────────────────────

-- A1. Tables with a visibility column
DROP POLICY IF EXISTS "public_read_services" ON public.services;
DROP POLICY IF EXISTS "pub_read_services" ON public.services;
CREATE POLICY "pub_read_services" ON public.services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cms_all_services" ON public.services;
CREATE POLICY "cms_all_services" ON public.services FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_projects" ON public.projects;
CREATE POLICY "pub_read_projects" ON public.projects FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "cms_all_projects" ON public.projects;
CREATE POLICY "cms_all_projects" ON public.projects FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_blog_posts" ON public.blog_posts;
CREATE POLICY "pub_read_blog_posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "cms_all_blog_posts" ON public.blog_posts;
CREATE POLICY "cms_all_blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_pages" ON public.pages;
CREATE POLICY "pub_read_pages" ON public.pages FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "cms_all_pages" ON public.pages;
CREATE POLICY "cms_all_pages" ON public.pages FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_testimonials" ON public.testimonials;
CREATE POLICY "pub_read_testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "cms_all_testimonials" ON public.testimonials;
CREATE POLICY "cms_all_testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_team_members" ON public.team_members;
CREATE POLICY "pub_read_team_members" ON public.team_members FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "cms_all_team_members" ON public.team_members;
CREATE POLICY "cms_all_team_members" ON public.team_members FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_transformation_stories" ON public.transformation_stories;
CREATE POLICY "pub_read_transformation_stories" ON public.transformation_stories FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "cms_all_transformation_stories" ON public.transformation_stories;
CREATE POLICY "cms_all_transformation_stories" ON public.transformation_stories FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

DROP POLICY IF EXISTS "pub_read_hero_media" ON public.hero_media;
CREATE POLICY "pub_read_hero_media" ON public.hero_media FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "cms_all_hero_media" ON public.hero_media;
CREATE POLICY "cms_all_hero_media" ON public.hero_media FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

-- A2. Tables without a visibility column: public read of all rows
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'gallery_items','gallery_categories','milestones','studio_milestones','design_process_steps',
    'process_faqs','process_metrics','service_steps','service_faqs','project_gallery',
    'project_materials','project_categories','awards','site_content','portfolio','page_sections',
    'footer_links','site_media_assets','media_files','media_folders',
    'asset_collections','asset_metadata','asset_tags','asset_tag_links'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'pub_read_' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)', 'pub_read_' || t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'cms_all_' || t, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor())', 'cms_all_' || t, t);
    END IF;
  END LOOP;
END $$;

-- A3. DAM core tables: public read is defined by 20260923000000_restore_dam_public_read.sql;
--     only the CMS write policy was missing.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assets','asset_usages','asset_versions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'cms_all_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor())', 'cms_all_' || t, t);
  END LOOP;
END $$;

-- A4. Legacy blogs table (still present in production under this name, see ADR 0003)
DROP POLICY IF EXISTS "pub_read_blogs" ON public.blogs;
CREATE POLICY "pub_read_blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (status = 'published');

-- A5. Estimator configuration (public estimator reads; Estimator Config route is SUPER_ONLY)
DROP POLICY IF EXISTS "pub_read_estimator_flow_config" ON public.estimator_flow_config;
CREATE POLICY "pub_read_estimator_flow_config" ON public.estimator_flow_config FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_estimator_flow_config" ON public.estimator_flow_config;
CREATE POLICY "admin_write_estimator_flow_config" ON public.estimator_flow_config FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- A6. Shared Discovery results: SharedResultPage reads by slug; the table holds no direct personal data
--     (slug, archetype, scores, signals, ai_result, lead_id), so public read is kept.
DROP POLICY IF EXISTS "pub_read_quiz_results" ON public.quiz_results;
CREATE POLICY "pub_read_quiz_results" ON public.quiz_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pub_insert_quiz_results" ON public.quiz_results;
CREATE POLICY "pub_insert_quiz_results" ON public.quiz_results FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ─── B. CRM (private) — rbac_v2 generation ────────────────────────────────────

DROP POLICY IF EXISTS "pub_insert_leads" ON public.leads;
CREATE POLICY "pub_insert_leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND length(email) > 3);
DROP POLICY IF EXISTS "crm_select_leads" ON public.leads;
CREATE POLICY "crm_select_leads" ON public.leads FOR SELECT TO authenticated USING (public.is_crm_viewer());
DROP POLICY IF EXISTS "crm_insert_leads" ON public.leads;
CREATE POLICY "crm_insert_leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
DROP POLICY IF EXISTS "crm_update_leads" ON public.leads;
CREATE POLICY "crm_update_leads" ON public.leads FOR UPDATE TO authenticated USING (public.is_crm_viewer()) WITH CHECK (public.is_crm_viewer());
DROP POLICY IF EXISTS "crm_delete_leads" ON public.leads;
CREATE POLICY "crm_delete_leads" ON public.leads FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS "crm_select_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_select_lead_activities" ON public.lead_activities FOR SELECT TO authenticated USING (public.is_crm_viewer());
DROP POLICY IF EXISTS "crm_insert_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_insert_lead_activities" ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (public.is_crm_viewer());
DROP POLICY IF EXISTS "crm_update_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_update_lead_activities" ON public.lead_activities FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
DROP POLICY IF EXISTS "crm_delete_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_delete_lead_activities" ON public.lead_activities FOR DELETE TO authenticated USING (public.is_platform_admin());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['lead_objections','lead_tasks','crm_tasks'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'crm_read_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_crm_viewer())', 'crm_read_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'crm_write_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())', 'crm_write_' || t, t);
  END LOOP;
END $$;

-- ─── C. Telemetry: public insert, admin read ─────────────────────────────────

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['analytics_events','analytics_events_default','project_views','website_events'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'pub_insert_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', 'pub_insert_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_read_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_platform_admin())', 'admin_read_' || t, t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['blog_user_events','analytics_reporting_daily'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_read_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_platform_admin())', 'admin_read_' || t, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "admin_delete_project_views" ON public.project_views;
CREATE POLICY "admin_delete_project_views" ON public.project_views FOR DELETE TO authenticated USING (public.is_platform_admin());
DROP POLICY IF EXISTS "super_admin_manage_website_events" ON public.website_events;
CREATE POLICY "super_admin_manage_website_events" ON public.website_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "auth_insert_decision_events" ON public.decision_events;
CREATE POLICY "auth_insert_decision_events" ON public.decision_events FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_select_decision_events" ON public.decision_events;
CREATE POLICY "auth_select_decision_events" ON public.decision_events FOR SELECT TO authenticated USING (true);

-- ─── D. Admin / system (private) ─────────────────────────────────────────────

-- D1. site_settings — exact set from 20260911000000_lock_down_site_settings.sql
--     (anon row access; its column-level GRANT limits anon to the public columns).
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Staff read site_settings" ON public.site_settings;
CREATE POLICY "Staff read site_settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings;
CREATE POLICY "Admin insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
DROP POLICY IF EXISTS "Admin delete site_settings" ON public.site_settings;
CREATE POLICY "Admin delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin_or_editor(auth.uid()));

-- D2. user_roles — own read + rbac_v2 role-management policies (verbatim)
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "super_admin_manage_roles" ON public.user_roles;
CREATE POLICY "super_admin_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "platform_admin_insert_roles" ON public.user_roles;
CREATE POLICY "platform_admin_insert_roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (CASE WHEN public.has_role(auth.uid(), 'super_admin') THEN true WHEN public.has_role(auth.uid(), 'admin') THEN role::text IN ('editor', 'viewer') ELSE false END);
DROP POLICY IF EXISTS "platform_admin_update_roles" ON public.user_roles;
CREATE POLICY "platform_admin_update_roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (CASE WHEN public.has_role(auth.uid(), 'super_admin') THEN true WHEN public.has_role(auth.uid(), 'admin') THEN role::text IN ('editor', 'viewer') ELSE false END)
  WITH CHECK (CASE WHEN public.has_role(auth.uid(), 'super_admin') THEN true WHEN public.has_role(auth.uid(), 'admin') THEN role::text IN ('editor', 'viewer') ELSE false END);
DROP POLICY IF EXISTS "super_admin_delete_roles" ON public.user_roles;
CREATE POLICY "super_admin_delete_roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- D3. profiles — own + platform admin (rbac_v2); no public read
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;
CREATE POLICY "admin_select_all_profiles" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id) OR public.is_platform_admin());
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id) OR public.is_platform_admin()) WITH CHECK ((auth.uid() = id) OR public.is_platform_admin());

-- D4. audit_logs — admin read; inserts require a signed-in user (trigger writes are SECURITY DEFINER)
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_platform_admin());
DROP POLICY IF EXISTS "auth_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "auth_insert_audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- D5. Super-admin-only tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['admin_sessions','cms_sections','system_logs'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'super_admin_all_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), %L)) WITH CHECK (public.has_role(auth.uid(), %L))', 'super_admin_all_' || t, t, 'super_admin', 'super_admin');
  END LOOP;
END $$;

-- D6. Platform-admin tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['raw_payload','webhook_failures','content_versions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_all_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())', 'admin_all_' || t, t);
  END LOOP;
END $$;

-- D7. comments — 20260608 generation, tightened: authors can only insert/update/delete as themselves
DROP POLICY IF EXISTS "pub_read_comments" ON public.comments;
CREATE POLICY "pub_read_comments" ON public.comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "author_insert_comments" ON public.comments;
CREATE POLICY "author_insert_comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "author_update_comments" ON public.comments;
CREATE POLICY "author_update_comments" ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "author_delete_comments" ON public.comments;
CREATE POLICY "author_delete_comments" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid());
DROP POLICY IF EXISTS "admin_manage_comments" ON public.comments;
CREATE POLICY "admin_manage_comments" ON public.comments FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
