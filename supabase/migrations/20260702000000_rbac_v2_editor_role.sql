-- =========================================================
-- Migration: rbac_v2_editor_role
-- Date: 2026-07-02
-- Description: Add 'editor' role to app_role enum, fix all
--              helper functions and RLS policies to correctly
--              enforce editor (CMS) and viewer (CRM) access.
-- =========================================================

-- ─── 1. Add 'editor' to the app_role enum ────────────────────────────────────
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';


-- ─── 2. Fix is_admin_or_editor (name kept for backward compat) ───────────────
--    Semantics: "is platform admin" (super_admin or admin)
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  );
$$;


-- ─── 3. Fix is_cms_editor: super_admin + admin + editor can write CMS ─────────
CREATE OR REPLACE FUNCTION public.is_cms_editor()
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'editor')
  );
$$;


-- ─── 4. NEW: is_crm_viewer — super_admin + admin + viewer can access CRM ──────
CREATE OR REPLACE FUNCTION public.is_crm_viewer()
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'viewer')
  );
$$;


-- ─── 5. NEW: is_platform_admin — super_admin + admin write access ─────────────
CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
  );
$$;


-- ─── 6. Fix leads RLS ─────────────────────────────────────────────────────────

-- Drop old over-permissive policies
DROP POLICY IF EXISTS "Admin all leads" ON public.leads;
DROP POLICY IF EXISTS "admins_select_leads" ON public.leads;
DROP POLICY IF EXISTS "admins_update_leads" ON public.leads;
DROP POLICY IF EXISTS "admins_delete_leads" ON public.leads;

-- SELECT: super_admin + admin + viewer
CREATE POLICY "crm_select_leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (is_crm_viewer());

-- INSERT: super_admin + admin only
CREATE POLICY "crm_insert_leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- UPDATE: super_admin + admin + viewer (viewers can update status/notes/follow-ups)
CREATE POLICY "crm_update_leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (is_crm_viewer())
  WITH CHECK (is_crm_viewer());

-- DELETE: super_admin + admin only
CREATE POLICY "crm_delete_leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (is_platform_admin());


-- ─── 7. Fix lead_activities RLS ───────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins view activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Admins insert activities" ON public.lead_activities;

CREATE POLICY "crm_select_lead_activities"
  ON public.lead_activities FOR SELECT
  TO authenticated
  USING (is_crm_viewer());

CREATE POLICY "crm_insert_lead_activities"
  ON public.lead_activities FOR INSERT
  TO authenticated
  WITH CHECK (is_crm_viewer());

CREATE POLICY "crm_update_lead_activities"
  ON public.lead_activities FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY "crm_delete_lead_activities"
  ON public.lead_activities FOR DELETE
  TO authenticated
  USING (is_platform_admin());


-- ─── 8. Fix CMS table RLS ─────────────────────────────────────────────────────

-- blog_posts: editors can manage
DROP POLICY IF EXISTS "Admin all blog_posts" ON public.blog_posts;
CREATE POLICY "cms_all_blog_posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (is_cms_editor())
  WITH CHECK (is_cms_editor());

-- gallery_items: editors can manage
DROP POLICY IF EXISTS "Admin all gallery_items" ON public.gallery_items;
CREATE POLICY "cms_all_gallery_items"
  ON public.gallery_items FOR ALL
  TO authenticated
  USING (is_cms_editor())
  WITH CHECK (is_cms_editor());

-- testimonials: consolidate fragmented policies
DROP POLICY IF EXISTS "Admin all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "admin_delete_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "admin_insert_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "admin_update_testimonials" ON public.testimonials;
CREATE POLICY "cms_all_testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (is_cms_editor())
  WITH CHECK (is_cms_editor());

-- services: consolidate fragmented policies
DROP POLICY IF EXISTS "Admin all services" ON public.services;
DROP POLICY IF EXISTS "admin_delete_services" ON public.services;
DROP POLICY IF EXISTS "admin_insert_services" ON public.services;
DROP POLICY IF EXISTS "admin_update_services" ON public.services;
CREATE POLICY "cms_all_services"
  ON public.services FOR ALL
  TO authenticated
  USING (is_cms_editor())
  WITH CHECK (is_cms_editor());


-- ─── 9. Fix profiles RLS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin all profiles" ON public.profiles;

-- Admins can see all profiles (needed for user management)
CREATE POLICY "admin_select_all_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR is_platform_admin()
  );

-- Only platform admins can update other users' profiles
CREATE POLICY "admin_update_profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id) OR is_platform_admin()
  )
  WITH CHECK (
    (auth.uid() = id) OR is_platform_admin()
  );


-- ─── 10. Fix user_roles RLS — scoped role assignment ─────────────────────────
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;

-- super_admin: can assign any role
-- admin: can only assign editor or viewer
CREATE POLICY "platform_admin_insert_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE
      WHEN has_role(auth.uid(), 'super_admin') THEN true
      WHEN has_role(auth.uid(), 'admin') THEN
        role IN ('editor', 'viewer')
      ELSE false
    END
  );

CREATE POLICY "platform_admin_update_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    CASE
      WHEN has_role(auth.uid(), 'super_admin') THEN true
      WHEN has_role(auth.uid(), 'admin') THEN
        role IN ('editor', 'viewer')
      ELSE false
    END
  )
  WITH CHECK (
    CASE
      WHEN has_role(auth.uid(), 'super_admin') THEN true
      WHEN has_role(auth.uid(), 'admin') THEN
        role IN ('editor', 'viewer')
      ELSE false
    END
  );

-- Only super_admin can delete roles
CREATE POLICY "super_admin_delete_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));
