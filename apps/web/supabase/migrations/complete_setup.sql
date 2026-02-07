-- =====================================
-- CROSS ANGLE INTERIOR - DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================

-- =====================
-- 1. USER ROLES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" ON public.user_roles
  FOR ALL USING (true);

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('d5aba90d-2c63-4603-b2ec-210902bafddf', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- =====================
-- 2. BLOGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  published boolean DEFAULT false,
  published_at timestamptz,
  author text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" ON public.blogs
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON public.blogs;
CREATE POLICY "Authenticated users can manage blogs" ON public.blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- 3. SERVICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  hero_image text,
  category_id text,
  icon text,
  tag text,
  features jsonb DEFAULT '[]'::jsonb,
  process_steps jsonb DEFAULT '[]'::jsonb,
  faq jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage services" ON public.services;
CREATE POLICY "Authenticated users can manage services" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- 4. PORTFOLIO TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  style text,
  description text,
  hero_image text,
  location text,
  completed_date text,
  featured boolean DEFAULT false,
  gallery jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio;
CREATE POLICY "Public can view portfolio" ON public.portfolio
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage portfolio" ON public.portfolio;
CREATE POLICY "Authenticated users can manage portfolio" ON public.portfolio
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- 5. LEADS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text,
  service text,
  status text DEFAULT 'new',
  source text DEFAULT 'contact_form',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- 6. SITE CONTENT TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site content" ON public.site_content;
CREATE POLICY "Authenticated users can manage site content" ON public.site_content
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- 7. SERVICE CATEGORIES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  hero_image text,
  icon text
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view service categories" ON public.service_categories;
CREATE POLICY "Public can view service categories" ON public.service_categories
  FOR SELECT USING (true);

-- =====================
-- VERIFY ALL TABLES CREATED
-- =====================
SELECT 
  'user_roles' as table_name, count(*) as rows FROM public.user_roles
UNION ALL
SELECT 'blogs', count(*) FROM public.blogs
UNION ALL
SELECT 'services', count(*) FROM public.services
UNION ALL
SELECT 'portfolio', count(*) FROM public.portfolio
UNION ALL
SELECT 'leads', count(*) FROM public.leads
UNION ALL
SELECT 'site_content', count(*) FROM public.site_content
UNION ALL
SELECT 'service_categories', count(*) FROM public.service_categories;
