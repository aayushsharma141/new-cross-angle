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
-- awards
DROP POLICY IF EXISTS "Admin all awards" ON public.awards;
CREATE POLICY "Admin all awards" ON public.awards FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- blog_posts
DROP POLICY IF EXISTS "Admin all blog_posts" ON public.blog_posts;
CREATE POLICY "Admin all blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- blogs
DROP POLICY IF EXISTS "Admins and editors can manage blogs" ON public.blogs;
CREATE POLICY "Admins and editors can manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- estimate_leads
DROP POLICY IF EXISTS "Admin all estimate_leads" ON public.estimate_leads;
CREATE POLICY "Admin all estimate_leads" ON public.estimate_leads FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- leads (inquiries)
DROP POLICY IF EXISTS "Admin all inquiries" ON public.leads;
-- Handle old policy name if persists
DROP POLICY IF EXISTS "Admin all leads" ON public.leads;
-- Recreate with standard Admin check
CREATE POLICY "Admin all leads" ON public.leads FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- media_assets
DROP POLICY IF EXISTS "Admin all media_assets" ON public.media_assets;
CREATE POLICY "Admin all media_assets" ON public.media_assets FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- milestones
DROP POLICY IF EXISTS "Admin all milestones" ON public.milestones;
CREATE POLICY "Admin all milestones" ON public.milestones FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- page_sections
DROP POLICY IF EXISTS "Admin all page_sections" ON public.page_sections;
CREATE POLICY "Admin all page_sections" ON public.page_sections FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- portfolio
DROP POLICY IF EXISTS "Admins and editors can manage portfolio" ON public.portfolio;
CREATE POLICY "Admins and editors can manage portfolio" ON public.portfolio FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- profiles
DROP POLICY IF EXISTS "Admin all profiles" ON public.profiles;
CREATE POLICY "Admin all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- project_categories
DROP POLICY IF EXISTS "Admin all project_categories" ON public.project_categories;
CREATE POLICY "Admin all project_categories" ON public.project_categories FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- projects
DROP POLICY IF EXISTS "Admin all projects" ON public.projects;
CREATE POLICY "Admin all projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- service_faqs
DROP POLICY IF EXISTS "Admin all service_faqs" ON public.service_faqs;
CREATE POLICY "Admin all service_faqs" ON public.service_faqs FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- service_steps
DROP POLICY IF EXISTS "Admin all service_steps" ON public.service_steps;
CREATE POLICY "Admin all service_steps" ON public.service_steps FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- services
DROP POLICY IF EXISTS "Admin all services" ON public.services;
CREATE POLICY "Admin all services" ON public.services FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- site_content
DROP POLICY IF EXISTS "Admins and editors can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins and editors can insert site content" ON public.site_content;
-- Unified admin policy for site_content
CREATE POLICY "Admin all site_content" ON public.site_content FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- site_settings
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings;
-- Unified admin policy for site_settings
CREATE POLICY "Admin all site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- team_members
DROP POLICY IF EXISTS "Admin all team_members" ON public.team_members;
CREATE POLICY "Admin all team_members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- testimonials
DROP POLICY IF EXISTS "Admin all testimonials" ON public.testimonials;
CREATE POLICY "Admin all testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid()));
-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
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