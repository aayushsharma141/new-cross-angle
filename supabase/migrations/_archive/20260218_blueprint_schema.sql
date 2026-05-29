-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Start Transaction
BEGIN;
---------------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS
---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
---------------------------------------------------------------------------------
-- 2. CONFIGURATION TABLES (META)
---------------------------------------------------------------------------------
-- 2.1 site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_name TEXT NOT NULL DEFAULT 'Crossangle Interior',
    tagline TEXT,
    email TEXT NOT NULL DEFAULT 'contact@crossangle.in',
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    map_embed_url TEXT,
    business_hours JSONB,
    logo_light_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    og_image_url TEXT,
    seo_title_template TEXT DEFAULT '%s | Crossangle Interior',
    seo_description TEXT CHECK (length(seo_description) <= 160),
    ga_measurement_id TEXT,
    fb_pixel_id TEXT,
    admin_email TEXT,
    nav_links JSONB DEFAULT '[]'::jsonb,
    footer_columns JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT site_settings_single_row CHECK (true)
);
-- Ensure only one row
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_one_row ON public.site_settings((TRUE));
-- Trigger for site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE
UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR
SELECT USING (true);
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert site_settings" ON public.site_settings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 2.2 page_sections (FIXED Content)
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    section_key TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    body TEXT,
    image_url TEXT,
    cta_text TEXT,
    cta_url TEXT,
    extra JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page, section_key)
);
-- Trigger for page_sections
DROP TRIGGER IF EXISTS update_page_sections_updated_at ON public.page_sections;
CREATE TRIGGER update_page_sections_updated_at BEFORE
UPDATE ON public.page_sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page_sections" ON public.page_sections FOR
SELECT USING (true);
CREATE POLICY "Admin all page_sections" ON public.page_sections FOR ALL USING (auth.role() = 'authenticated');
---------------------------------------------------------------------------------
-- 3. DYNAMIC COLLECTION TABLES
---------------------------------------------------------------------------------
-- 3.1 project_categories
CREATE TABLE IF NOT EXISTS public.project_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0
);
-- RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read project_categories" ON public.project_categories FOR
SELECT USING (true);
CREATE POLICY "Admin all project_categories" ON public.project_categories FOR ALL USING (auth.role() = 'authenticated');
-- 3.2 projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Update projects structure if exists
DO $$ BEGIN
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS slug TEXT;
-- Make slug unique if not already
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_slug_key'
) THEN
ALTER TABLE public.projects
ADD CONSTRAINT projects_slug_key UNIQUE (slug);
END IF;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS year_completed SMALLINT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.project_categories(id) ON DELETE
SET NULL;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS style_tags TEXT [];
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS description JSONB;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS gallery_urls TEXT [];
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS created_by UUID;
END $$;
-- Trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE
UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read live projects" ON public.projects;
CREATE POLICY "Public read live projects" ON public.projects FOR
SELECT USING (status = 'live');
DROP POLICY IF EXISTS "Admin all projects" ON public.projects;
CREATE POLICY "Admin all projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
-- 3.3 services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Update services structure if exists
DO $$ BEGIN
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS short_tag TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS description JSONB;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS slug TEXT;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'services_slug_key'
) THEN
ALTER TABLE public.services
ADD CONSTRAINT services_slug_key UNIQUE (slug);
END IF;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS seo_description TEXT;
END $$;
-- Trigger for services
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE
UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active services" ON public.services;
CREATE POLICY "Public read active services" ON public.services FOR
SELECT USING (active = true);
DROP POLICY IF EXISTS "Admin all services" ON public.services;
CREATE POLICY "Admin all services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
-- 3.4 service_steps (Hybrid Child)
CREATE TABLE IF NOT EXISTS public.service_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    step_number SMALLINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);
-- RLS
ALTER TABLE public.service_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_steps" ON public.service_steps FOR
SELECT USING (true);
CREATE POLICY "Admin all service_steps" ON public.service_steps FOR ALL USING (auth.role() = 'authenticated');
-- 3.5 service_faqs (Hybrid Child)
CREATE TABLE IF NOT EXISTS public.service_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);
-- RLS
ALTER TABLE public.service_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_faqs" ON public.service_faqs FOR
SELECT USING (true);
CREATE POLICY "Admin all service_faqs" ON public.service_faqs FOR ALL USING (auth.role() = 'authenticated');
-- 3.6 team_members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    email TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger for team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE
UPDATE ON public.team_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active team_members" ON public.team_members FOR
SELECT USING (true);
CREATE POLICY "Admin all team_members" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
-- 3.7 blog_posts (Dynamic)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    author_id UUID REFERENCES public.team_members(id) ON DELETE
    SET NULL,
        tags TEXT [],
        excerpt TEXT,
        content JSONB,
        cover_image_url TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
        featured BOOLEAN DEFAULT false,
        seo_title TEXT,
        seo_description TEXT,
        published_at TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger for blog_posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE
UPDATE ON public.blog_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blog_posts" ON public.blog_posts FOR
SELECT USING (status = 'published');
CREATE POLICY "Admin all blog_posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');
-- 3.8 testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    author_role TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    rating SMALLINT,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        display_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
);
-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active testimonials" ON public.testimonials FOR
SELECT USING (active = true);
CREATE POLICY "Admin all testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');
-- 3.9 milestones
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year SMALLINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0
);
-- RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read milestones" ON public.milestones FOR
SELECT USING (true);
CREATE POLICY "Admin all milestones" ON public.milestones FOR ALL USING (auth.role() = 'authenticated');
-- 3.10 awards
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT,
    year SMALLINT,
    image_url TEXT,
    url TEXT,
    display_order INTEGER DEFAULT 0
);
-- RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read awards" ON public.awards FOR
SELECT USING (true);
CREATE POLICY "Admin all awards" ON public.awards FOR ALL USING (auth.role() = 'authenticated');
-- 3.11 inquiries (CRM)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (
        status IN (
            'new',
            'contacted',
            'proposal_sent',
            'won',
            'lost'
        )
    ),
    source_url TEXT,
    assigned_to UUID,
    internal_notes JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger for inquiries
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE
UPDATE ON public.inquiries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all inquiries" ON public.inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert inquiries" ON public.inquiries FOR
INSERT WITH CHECK (true);
-- 3.12 media_assets
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    thumb_url TEXT,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media_assets" ON public.media_assets FOR
SELECT USING (true);
CREATE POLICY "Admin all media_assets" ON public.media_assets FOR ALL USING (auth.role() = 'authenticated');
COMMIT;