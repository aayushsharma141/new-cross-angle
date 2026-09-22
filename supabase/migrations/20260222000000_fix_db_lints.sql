-- 20260222000000_fix_db_lints.sql
-- 1. Fix Function Search Paths
-- Explicitly set search_path to 'public' to preventing search_path hijacking
ALTER FUNCTION public.update_updated_at_column()
SET search_path = 'public';
-- Check if increment_project_view exists and alter it
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'increment_project_view'
) THEN ALTER FUNCTION public.increment_project_view(uuid)
SET search_path = 'public';
END IF;
END $$;
-- 2. Fix "Always True" RLS Policies for Public Inserts
-- We make them explicitly target 'anon' and 'authenticated' roles to satisfy linters
-- and ensure they don't apply to 'service_role' (though service_role bypasses anyway).
-- NOTE: We keep 'true' because these are public forms.
-- estimate_leads
DROP POLICY IF EXISTS "Public insert estimate_leads" ON public.estimate_leads;
CREATE POLICY "Public insert estimate_leads" ON public.estimate_leads FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- leads
DROP POLICY IF EXISTS "Public insert inquiries" ON public.leads;
-- Old name potentially
DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
CREATE POLICY "Public insert leads" ON public.leads FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- lead_activities (Was "Admins insert activities" with "true")
-- Restricting to actual admins/editors
DROP POLICY IF EXISTS "Admins insert activities" ON public.lead_activities;
CREATE POLICY "Admins insert activities" ON public.lead_activities FOR
INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));
DROP POLICY IF EXISTS "Admins view activities" ON public.lead_activities;
CREATE POLICY "Admins view activities" ON public.lead_activities FOR
SELECT TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- 3. Fix "Anonymous Access" warnings for Admin Policies
-- We explicitly limit these policies TO authenticated users.
-- Although logic often checked role, applying to 'public' caused the warning.
DO $$ 
DECLARE
  tables text[] := ARRAY['awards', 'blog_posts', 'blogs', 'estimate_leads', 'leads', 'media_assets', 'milestones', 'page_sections', 'portfolio', 'profiles', 'project_categories', 'projects', 'service_faqs', 'service_steps', 'services', 'site_content', 'site_settings', 'team_members', 'testimonials', 'user_roles'];
  t text;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      IF t = 'awards' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all awards" ON public.awards;';
        EXECUTE 'CREATE POLICY "Admin all awards" ON public.awards FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'blog_posts' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all blog_posts" ON public.blog_posts;';
        EXECUTE 'CREATE POLICY "Admin all blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'blogs' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins and editors can manage blogs" ON public.blogs;';
        EXECUTE 'CREATE POLICY "Admins and editors can manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'estimate_leads' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all estimate_leads" ON public.estimate_leads;';
        EXECUTE 'CREATE POLICY "Admin all estimate_leads" ON public.estimate_leads FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'leads' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all inquiries" ON public.leads;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin all leads" ON public.leads;';
        EXECUTE 'CREATE POLICY "Admin all leads" ON public.leads FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'media_assets' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all media_assets" ON public.media_assets;';
        EXECUTE 'CREATE POLICY "Admin all media_assets" ON public.media_assets FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'milestones' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all milestones" ON public.milestones;';
        EXECUTE 'CREATE POLICY "Admin all milestones" ON public.milestones FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'page_sections' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all page_sections" ON public.page_sections;';
        EXECUTE 'CREATE POLICY "Admin all page_sections" ON public.page_sections FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'portfolio' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins and editors can manage portfolio" ON public.portfolio;';
        EXECUTE 'CREATE POLICY "Admins and editors can manage portfolio" ON public.portfolio FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'profiles' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all profiles" ON public.profiles;';
        EXECUTE 'CREATE POLICY "Admin all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'project_categories' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all project_categories" ON public.project_categories;';
        EXECUTE 'CREATE POLICY "Admin all project_categories" ON public.project_categories FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'projects' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all projects" ON public.projects;';
        EXECUTE 'CREATE POLICY "Admin all projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'service_faqs' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all service_faqs" ON public.service_faqs;';
        EXECUTE 'CREATE POLICY "Admin all service_faqs" ON public.service_faqs FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'service_steps' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all service_steps" ON public.service_steps;';
        EXECUTE 'CREATE POLICY "Admin all service_steps" ON public.service_steps FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'services' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all services" ON public.services;';
        EXECUTE 'CREATE POLICY "Admin all services" ON public.services FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'site_content' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins and editors can update site content" ON public.site_content;';
        EXECUTE 'DROP POLICY IF EXISTS "Admins and editors can insert site content" ON public.site_content;';
        EXECUTE 'CREATE POLICY "Admin all site_content" ON public.site_content FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'site_settings' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings;';
        EXECUTE 'CREATE POLICY "Admin all site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'team_members' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all team_members" ON public.team_members;';
        EXECUTE 'CREATE POLICY "Admin all team_members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'testimonials' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all testimonials" ON public.testimonials;';
        EXECUTE 'CREATE POLICY "Admin all testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));';
      ELSIF t = 'user_roles' THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;';
        EXECUTE 'CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''));';
      END IF;
    END IF;
  END LOOP;
END $$;
-- Storage Objects (Admins and editors can delete/update)
DO $$ BEGIN -- update
IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Admins and editors can update media files'
) THEN DROP POLICY "Admins and editors can update media files" ON storage.objects;
CREATE POLICY "Admins and editors can update media files" ON storage.objects FOR
UPDATE TO authenticated USING (public.is_admin_or_editor(auth.uid()));
END IF;
-- delete
IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Admins and editors can delete media files'
) THEN DROP POLICY "Admins and editors can delete media files" ON storage.objects;
CREATE POLICY "Admins and editors can delete media files" ON storage.objects FOR DELETE TO authenticated USING (public.is_admin_or_editor(auth.uid()));
END IF;
-- insert (often named "Admins and editors can upload media files" or similar, checking if it exists or generic)
IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Admins and editors can upload media files'
) THEN DROP POLICY "Admins and editors can upload media files" ON storage.objects;
CREATE POLICY "Admins and editors can upload media files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (public.is_admin_or_editor(auth.uid()));
END IF;
END $$;