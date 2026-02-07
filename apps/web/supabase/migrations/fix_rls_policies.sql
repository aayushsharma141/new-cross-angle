-- =====================================
-- CROSS ANGLE INTERIOR - IMPROVED RLS
-- Fixes security linter warnings
-- Run this AFTER complete_setup.sql
-- =====================================

-- =====================
-- 1. FIX USER_ROLES POLICY
-- Remove overly permissive "Service role full access"
-- =====================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;

-- Instead, allow admins to manage all roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- =====================
-- 2. FIX BLOGS POLICIES
-- Separate anonymous read from authenticated write
-- =====================

-- Public can ONLY SELECT published blogs (intentional - public website needs this)
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs
  FOR SELECT
  USING (published = true);

-- Authenticated users can do everything
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON public.blogs;
CREATE POLICY "Authenticated users can manage blogs"
  ON public.blogs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 3. FIX LEADS POLICIES  
-- Only authenticated users should access leads
-- =====================

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 4. FIX PORTFOLIO POLICIES
-- =====================

DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio;
CREATE POLICY "Public can view portfolio"
  ON public.portfolio
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage portfolio" ON public.portfolio;
CREATE POLICY "Authenticated users can manage portfolio"
  ON public.portfolio
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 5. FIX SERVICES POLICIES
-- =====================

DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services"
  ON public.services
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage services" ON public.services;
CREATE POLICY "Authenticated users can manage services"
  ON public.services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 6. FIX SITE_CONTENT POLICIES
-- =====================

DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content"
  ON public.site_content
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site content" ON public.site_content;
CREATE POLICY "Authenticated users can manage site content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 7. FIX SERVICE_CATEGORIES POLICIES
-- =====================

DROP POLICY IF EXISTS "Public can view service categories" ON public.service_categories;
CREATE POLICY "Public can view service categories"
  ON public.service_categories
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage service categories" ON public.service_categories;
CREATE POLICY "Authenticated users can manage service categories"
  ON public.service_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- 8. FIX STORAGE POLICIES
-- =====================

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
CREATE POLICY "Allow authenticated users to update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

-- =====================
-- NOTE: Leaked Password Protection
-- This is a Pro-only feature and can be safely ignored on free tier
-- =====================

SELECT 'RLS policies updated successfully!' AS status;
