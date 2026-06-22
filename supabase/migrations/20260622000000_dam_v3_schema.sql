-- ==========================================
-- Milestone v2.0: DAM V3 Architecture Schema
-- Phase 1: Database Tables & Enums
-- ==========================================

-- 1. Create Enums safely
DO $$ BEGIN
    CREATE TYPE asset_type_enum AS ENUM ('image', 'video', 'document');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_source_enum AS ENUM ('uploaded', 'imported', 'external', 'generated', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_status_enum AS ENUM ('uploading', 'processing', 'ready', 'failed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collection_type_enum AS ENUM ('shoot', 'campaign', 'moodboard_set', 'project_delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. Create Asset Collections
CREATE TABLE IF NOT EXISTS public.asset_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type collection_type_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Assets (Identity)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type asset_type_enum NOT NULL,
    source asset_source_enum NOT NULL DEFAULT 'uploaded',
    status asset_status_enum NOT NULL DEFAULT 'uploading',
    title TEXT,
    description TEXT,
    parent_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES public.asset_collections(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_source ON public.assets(source);
CREATE INDEX IF NOT EXISTS idx_assets_parent_id ON public.assets(parent_asset_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_modtime
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION update_assets_updated_at_column();


-- 4. Create Asset Versions (Physical Payload)
CREATE TABLE IF NOT EXISTS public.asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    file_id TEXT NOT NULL, -- e.g., ImageKit ID or path
    mime_type TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON public.asset_versions(asset_id);


-- 5. Create Asset Usages (Polymorphic Relationships)
CREATE TABLE IF NOT EXISTS public.asset_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,       -- e.g., 'Portfolio', 'Discovery', 'Marketing'
    entity_type TEXT NOT NULL,  -- e.g., 'projects', 'services'
    entity_id UUID NOT NULL,    -- Links to projects.id, services.id, etc.
    role TEXT NOT NULL,         -- e.g., 'hero', 'gallery', 'thumbnail'
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_usages_asset_id ON public.asset_usages(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usages_entity ON public.asset_usages(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_asset_usages_role ON public.asset_usages(role);


-- 6. Create Asset Metadata (1:1 with Assets)
CREATE TABLE IF NOT EXISTS public.asset_metadata (
    asset_id UUID PRIMARY KEY REFERENCES public.assets(id) ON DELETE CASCADE,
    dominant_colors JSONB,
    materials JSONB,
    room_type TEXT,
    camera_exif JSONB,
    copyright TEXT,
    photographer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_asset_metadata_modtime
    BEFORE UPDATE ON public.asset_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_assets_updated_at_column();


-- 7. Create Asset Tags & Tag Links
CREATE TABLE IF NOT EXISTS public.asset_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_tag_links (
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.asset_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (asset_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_asset_tag_links_tag_id ON public.asset_tag_links(tag_id);


-- ==========================================
-- RLS Policies
-- ==========================================

-- Enable Row Level Security
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tag_links ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public) so the website can fetch images
CREATE POLICY "Public Read Access for Asset Collections" ON public.asset_collections FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Asset Versions" ON public.asset_versions FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Asset Usages" ON public.asset_usages FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Asset Metadata" ON public.asset_metadata FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Asset Tags" ON public.asset_tags FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Asset Tag Links" ON public.asset_tag_links FOR SELECT USING (true);

-- Allow full access to authenticated users (CMS Admins)
CREATE POLICY "Auth Full Access for Asset Collections" ON public.asset_collections FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Assets" ON public.assets FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Asset Versions" ON public.asset_versions FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Asset Usages" ON public.asset_usages FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Asset Metadata" ON public.asset_metadata FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Asset Tags" ON public.asset_tags FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Auth Full Access for Asset Tag Links" ON public.asset_tag_links FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
