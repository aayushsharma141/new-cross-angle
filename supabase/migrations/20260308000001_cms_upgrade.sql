-- =============================================================
-- CMS UPGRADE MIGRATION
-- Adds production-grade CMS features:
--   1. pages table (slug-based page registry)
--   2. Upgrade page_sections with order_index, status, section_type, content_json
--   3. Add status lifecycle to blogs
--   4. content_versions table (audit / rollback)
--   5. Indexes for all new columns
--   6. RLS policies for new tables
-- =============================================================
-- ── 1. PAGES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title TEXT,
    meta_desc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT pages_slug_key UNIQUE (slug)
);
-- Seed common pages (idempotent via ON CONFLICT DO NOTHING)
INSERT INTO public.pages (slug, title, status)
VALUES ('home', 'Home', 'published'),
    ('about', 'About Us', 'published'),
    ('services', 'Services', 'published'),
    ('portfolio', 'Portfolio', 'published'),
    ('blog', 'Blog', 'published'),
    ('contact', 'Contact Us', 'published') ON CONFLICT (slug) DO NOTHING;
-- Trigger to auto-update updated_at
CREATE TRIGGER update_pages_updated_at BEFORE
UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published pages" ON public.pages;
CREATE POLICY "Anyone can read published pages" ON public.pages FOR
SELECT USING (
        status = 'published'
        OR public.is_admin_or_editor(auth.uid())
    );
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (public.is_admin_or_editor(auth.uid()));
-- ── 2. UPGRADE page_sections ──────────────────────────────────
-- The existing table uses: page (text), section_key, title, subtitle, body,
-- image_url, cta_text, cta_url, extra (jsonb), updated_at
-- Add order_index (default 0, so existing rows keep working)
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
-- Add status lifecycle
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
-- Add section_type (mirrors section_key but designed for the block registry)
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS section_type TEXT;
-- Backfill section_type from section_key for existing rows
UPDATE public.page_sections
SET section_type = section_key
WHERE section_type IS NULL;
-- Add content_json (structured block payload — superset of existing flat fields)
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT '{}'::jsonb;
-- Backfill content_json from existing flat columns
UPDATE public.page_sections
SET content_json = jsonb_strip_nulls(
        jsonb_build_object(
            'title',
            title,
            'subtitle',
            subtitle,
            'body',
            body,
            'imageUrl',
            image_url,
            'ctaText',
            cta_text,
            'ctaUrl',
            cta_url
        )
    )
WHERE content_json = '{}'::jsonb
    OR content_json IS NULL;
-- Add created_at if missing
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON public.page_sections (page);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON public.page_sections (page, order_index);
CREATE INDEX IF NOT EXISTS idx_page_sections_status ON public.page_sections (status);
CREATE INDEX IF NOT EXISTS idx_page_sections_content_gin ON public.page_sections USING gin (content_json);
-- ── 3. BLOGS – status lifecycle ───────────────────────────────
-- Keep existing is_published column (backward-compat) but add status text column
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
-- Add content_json column for rich-text (TipTap JSON)
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT NULL;
-- Add featured_media_id for the media library FK
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS featured_media_id UUID DEFAULT NULL;
-- Backfill status from existing is_published flag
UPDATE public.blogs
SET status = 'published'
WHERE is_published = true
    AND status = 'draft';
-- Indexes
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs (status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
-- Update the read policy to honour new status column
DROP POLICY IF EXISTS "Anyone can read published blogs" ON public.blogs;
CREATE POLICY "Anyone can read published blogs" ON public.blogs FOR
SELECT USING (
        (
            is_published = true
            OR status = 'published'
        )
        OR public.is_admin_or_editor(auth.uid())
    );
-- ── 4. MEDIA TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    size_bytes BIGINT,
    alt TEXT,
    title TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view media" ON public.media;
CREATE POLICY "Anyone can view media" ON public.media FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
CREATE POLICY "Admins can manage media" ON public.media FOR ALL USING (public.is_admin_or_editor(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media (file_type);
CREATE INDEX IF NOT EXISTS idx_media_created ON public.media (created_at DESC);
-- ── 5. CONTENT VERSIONS (audit / rollback) ────────────────────
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    -- 'page_section' | 'blog' | 'page'
    entity_id UUID NOT NULL,
    content_json JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view content versions" ON public.content_versions;
CREATE POLICY "Admins can view content versions" ON public.content_versions FOR
SELECT USING (public.is_admin_or_editor(auth.uid()));
DROP POLICY IF EXISTS "Admins can insert content versions" ON public.content_versions;
CREATE POLICY "Admins can insert content versions" ON public.content_versions FOR
INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_content_versions_entity ON public.content_versions (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_date ON public.content_versions (created_at DESC);