-- ======================================================================
-- Migration: Tighten CMS RLS policies for RBAC compliance
-- 
-- Problem: auth_all_* policies on CMS tables (projects, services, blogs,
--          testimonials, media) use USING(true) for authenticated users,
--          meaning ANY authenticated user (including 'viewer' role) can 
--          INSERT/UPDATE/DELETE content.
--
-- Fix: Replace permissive ALL policies with role-gated write policies.
--      Viewers get READ-ONLY access; only admin/super_admin can write.
-- ======================================================================

-- Helper function to check admin write access (admin or super_admin)
CREATE OR REPLACE FUNCTION public.is_cms_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_cms_editor() TO authenticated;

-- ── 1. projects ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_all_projects" ON public.projects;

-- Authenticated users can READ all projects (draft + published)
CREATE POLICY "authenticated_read_projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- Only admin/editor can INSERT
CREATE POLICY "admin_insert_projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor());

-- Only admin/editor can UPDATE
CREATE POLICY "admin_update_projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

-- Only admin/editor can DELETE
CREATE POLICY "admin_delete_projects" ON public.projects
  FOR DELETE TO authenticated USING (public.is_cms_editor());


-- ── 2. services ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_all_services" ON public.services;

CREATE POLICY "authenticated_read_services" ON public.services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_insert_services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_update_services" ON public.services
  FOR UPDATE TO authenticated
  USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_delete_services" ON public.services
  FOR DELETE TO authenticated USING (public.is_cms_editor());


-- ── 3. blogs ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_all_blogs" ON public.blogs;

CREATE POLICY "authenticated_read_blogs" ON public.blogs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_insert_blogs" ON public.blogs
  FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_update_blogs" ON public.blogs
  FOR UPDATE TO authenticated
  USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_delete_blogs" ON public.blogs
  FOR DELETE TO authenticated USING (public.is_cms_editor());


-- ── 4. testimonials ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_all_testimonials" ON public.testimonials;

CREATE POLICY "authenticated_read_testimonials" ON public.testimonials
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_insert_testimonials" ON public.testimonials
  FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_update_testimonials" ON public.testimonials
  FOR UPDATE TO authenticated
  USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor());

CREATE POLICY "admin_delete_testimonials" ON public.testimonials
  FOR DELETE TO authenticated USING (public.is_cms_editor());


-- ── 5. media ─────────────────────────────────────────────────────────────
-- Check if media has an overly permissive write policy
DO $$
BEGIN
  -- Drop if exists (safe for idempotent runs)
  DROP POLICY IF EXISTS "auth_all_media" ON public.media;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.media;
  DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.media;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.media;
EXCEPTION WHEN undefined_table THEN
  -- media table might not exist in some envs
  NULL;
END;
$$;

-- Conditionally create media policies only if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media') THEN
    EXECUTE 'CREATE POLICY "authenticated_read_media" ON public.media FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "admin_insert_media" ON public.media FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor())';
    EXECUTE 'CREATE POLICY "admin_update_media" ON public.media FOR UPDATE TO authenticated USING (public.is_cms_editor()) WITH CHECK (public.is_cms_editor())';
    EXECUTE 'CREATE POLICY "admin_delete_media" ON public.media FOR DELETE TO authenticated USING (public.is_cms_editor())';
  END IF;
END;
$$;
