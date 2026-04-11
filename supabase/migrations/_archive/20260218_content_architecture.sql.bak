-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Site Settings Table (Global Content)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id BIGINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    -- Enforce singleton row
    branding JSONB DEFAULT '{}'::jsonb,
    -- Logo, colors, etc.
    contact_info JSONB DEFAULT '{}'::jsonb,
    -- Phone, email, address, maps
    social_links JSONB DEFAULT '{}'::jsonb,
    -- Facebook, Instagram, etc.
    navigation JSONB DEFAULT '[]'::jsonb,
    -- Dynamic menu structure
    footer_content JSONB DEFAULT '{}'::jsonb,
    -- Copyright, quick links config
    seo_defaults JSONB DEFAULT '{}'::jsonb,
    -- Default title, desc, og_image
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- RLS for Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR
SELECT USING (true);
CREATE POLICY "Authenticated update site_settings" ON public.site_settings FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert site_settings" ON public.site_settings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 2. Pages Table (Page Metadata)
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    -- e.g., 'home', 'about', 'services'
    title TEXT NOT NULL,
    seo JSONB DEFAULT '{}'::jsonb,
    -- title, description, og_image, keywords
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- RLS for Pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published pages" ON public.pages FOR
SELECT USING (is_published = true);
CREATE POLICY "Authenticated all pages" ON public.pages FOR ALL USING (auth.role() = 'authenticated');
-- 3. Page Sections Table (Hybrid Content Blocks)
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    -- e.g., 'hero', 'about_intro', 'process'
    content JSONB DEFAULT '{}'::jsonb,
    -- The flexible content schema
    is_enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(page_id, section_key)
);
-- RLS for Page Sections
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read enabled sections" ON public.page_sections FOR
SELECT USING (is_enabled = true);
CREATE POLICY "Authenticated all sections" ON public.page_sections FOR ALL USING (auth.role() = 'authenticated');
-- 4. Service Categories Table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id TEXT PRIMARY KEY,
    -- e.g., 'residential', 'commercial'
    title TEXT NOT NULL,
    description TEXT,
    hero_image TEXT,
    icon TEXT,
    -- Lucide icon name
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- RLS for Service Categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_categories" ON public.service_categories FOR
SELECT USING (true);
CREATE POLICY "Authenticated all service_categories" ON public.service_categories FOR ALL USING (auth.role() = 'authenticated');
-- 5. Update Services Table (Rich Content)
-- Check if table exists, if not create it (handling legacy migrations)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Add new columns if they don't exist
DO $$ BEGIN
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.service_categories(id) ON DELETE
SET NULL;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS long_description TEXT;
-- Markdown
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS related_services TEXT [] DEFAULT '{}';
-- Array of UUID strings
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
END $$;
-- Enable RLS for Services if not already
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated all services" ON public.services;
CREATE POLICY "Authenticated all services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
-- 6. Update Projects Table (Rich Content)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
DO $$ BEGIN
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_type TEXT;
-- Residential/Commercial
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS category TEXT;
-- Can be same as project_type or more specific
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS style TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS brief TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
-- Structured gallery
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS testimonial JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
END $$;
-- Enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR
SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Authenticated all projects" ON public.projects;
CREATE POLICY "Authenticated all projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
-- 7. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- RLS for Team Members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read team_members" ON public.team_members FOR
SELECT USING (is_active = true);
CREATE POLICY "Authenticated all team_members" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
-- 8. Updated_at Triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply triggers
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE
UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at BEFORE
UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_page_sections_updated_at ON public.page_sections;
CREATE TRIGGER update_page_sections_updated_at BEFORE
UPDATE ON public.page_sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON public.service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE
UPDATE ON public.service_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE
UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE
UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE
UPDATE ON public.team_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();