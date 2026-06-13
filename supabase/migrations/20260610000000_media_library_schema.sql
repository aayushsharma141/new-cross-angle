-- =========================================================================
-- ADVANCED MEDIA LIBRARY OVERHAUL
-- Introduces hierarchical folders (via ltree) and full media metadata.
-- =========================================================================

-- Enable ltree extension for materialized path
CREATE EXTENSION IF NOT EXISTS ltree;

-- Create Folders Table
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    path ltree NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, name)
);

-- Index for fast subtree queries
CREATE INDEX IF NOT EXISTS path_gist_idx ON public.media_folders USING GIST (path);

-- Create Files Table (Replacing public.media)
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'imagekit',
    storage_path VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    size_bytes BIGINT NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(folder_id, display_name)
);

-- Row Level Security (RLS)
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to media (assuming a public-facing website)
CREATE POLICY "Public Read Access for Media Folders" 
ON public.media_folders FOR SELECT USING (true);

CREATE POLICY "Public Read Access for Media Files" 
ON public.media_files FOR SELECT USING (true);

-- Allow authenticated users to manage media
CREATE POLICY "Auth Manage Media Folders" 
ON public.media_folders FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Manage Media Files" 
ON public.media_files FOR ALL USING (auth.role() = 'authenticated');

-- Data Migration: Seed a root-level "General" folder
INSERT INTO public.media_folders (id, name, path)
VALUES ('00000000-0000-0000-0000-000000000000', 'General', 'root')
ON CONFLICT DO NOTHING;

-- Data Migration: Move existing data from `public.media` to `public.media_files`
-- Assign all existing files to the "General" folder.
INSERT INTO public.media_files (
    id, folder_id, display_name, file_name, storage_provider, 
    storage_path, url, mime_type, size_bytes, created_at
)
SELECT 
    m.id,
    '00000000-0000-0000-0000-000000000000'::uuid as folder_id,
    COALESCE(m.title, m.file_name) as display_name,
    m.file_name,
    m.storage_provider,
    COALESCE(m.provider_path, m.file_name) as storage_path,
    m.url,
    COALESCE(m.file_type, 'image/jpeg') as mime_type,
    COALESCE(m.size_bytes, 0) as size_bytes,
    m.created_at
FROM public.media m
ON CONFLICT DO NOTHING;

-- Drop the old table now that data is migrated
-- IMPORTANT: We cascade to remove constraints/dependencies, but application code MUST be updated to use media_files
DROP TABLE IF EXISTS public.media CASCADE;
