-- Migration: 20260622000000_dam_v3_schema.sql
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


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000000') ON CONFLICT DO NOTHING;

-- Migration: 20260622000001_dam_v3_rpcs.sql
-- Add missing columns to asset_versions to support dual-write legacy fallbacks
ALTER TABLE public.asset_versions 
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS width INT,
  ADD COLUMN IF NOT EXISTS height INT,
  ADD COLUMN IF NOT EXISTS storage_provider TEXT DEFAULT 'imagekit';

-- Create RPC for registering a new DAM asset with its version and usage atomically
CREATE OR REPLACE FUNCTION rpc_register_dam_asset(
  p_type asset_type_enum,
  p_source asset_source_enum,
  p_title text,
  p_file_id text,
  p_url text,
  p_size_bytes bigint,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
)
RETURNS uuid AS $$
DECLARE
  v_asset_id uuid;
BEGIN
  -- 0. Authorization Check
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and editors can register DAM assets';
  END IF;

  -- 1. Create the base asset
  INSERT INTO assets (
    type, 
    source, 
    status, 
    title
  ) VALUES (
    p_type, 
    p_source, 
    'ready'::asset_status_enum, 
    p_title
  ) RETURNING id INTO v_asset_id;

  -- 2. Create the asset version (physical file payload)
  INSERT INTO asset_versions (
    asset_id,
    version_number,
    storage_provider,
    file_id,
    url,
    size_bytes,
    mime_type,
    width,
    height
  ) VALUES (
    v_asset_id,
    1,
    'imagekit',
    p_file_id,
    p_url,
    p_size_bytes,
    p_mime_type,
    p_width,
    p_height
  );

  -- 3. Bind the usage if entity provided
  IF p_entity_id IS NOT NULL THEN
    INSERT INTO asset_usages (
      asset_id,
      domain,
      entity_type,
      entity_id,
      role,
      is_primary
    ) VALUES (
      v_asset_id,
      p_domain,
      p_entity_type,
      p_entity_id,
      p_role,
      true
    );
  END IF;

  RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000001') ON CONFLICT DO NOTHING;

-- Migration: 20260622000002_dam_v3_migration.sql
-- ==========================================
-- Milestone v2.0: DAM V3 Architecture Schema
-- Phase 4: Migration Backfill & Legacy Deprecation
-- ==========================================

-- Function to safely migrate a single url
CREATE OR REPLACE FUNCTION migrate_legacy_asset(
  p_url text,
  p_title text,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
) RETURNS void AS $$
DECLARE
  v_asset_id uuid;
BEGIN
  IF p_url IS NULL OR p_url = '' THEN
    RETURN;
  END IF;

  -- Insert Asset
  INSERT INTO public.assets (type, source, status, title)
  VALUES ('image', 'uploaded', 'ready', p_title)
  RETURNING id INTO v_asset_id;

  -- Insert Version (Extract relative path by removing ImageKit endpoint)
  INSERT INTO public.asset_versions (asset_id, version_number, file_id, url)
  VALUES (
    v_asset_id, 
    1, 
    REPLACE(p_url, 'https://ik.imagekit.io/wdrs8y61o/cross-angle/', ''), 
    p_url
  );

  -- Insert Usage
  INSERT INTO public.asset_usages (asset_id, domain, entity_type, entity_id, role, is_primary)
  VALUES (v_asset_id, p_domain, p_entity_type, p_entity_id, p_role, true);
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  rec record;
BEGIN
  -- 1. Migrate Projects (cover_image_url)
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'cover_image_url') THEN
    FOR rec IN EXECUTE 'SELECT id, title, cover_image_url FROM public.projects' LOOP
      IF rec.cover_image_url IS NOT NULL THEN
        PERFORM migrate_legacy_asset(rec.cover_image_url, rec.title || ' Cover', 'Portfolio', 'project', rec.id, 'cover');
      END IF;
    END LOOP;
  END IF;

  -- 2. Migrate Project Gallery
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_gallery' AND column_name = 'image_url') THEN
    FOR rec IN EXECUTE 'SELECT id, project_id, image_url, room_name FROM public.project_gallery' LOOP
      IF rec.image_url IS NOT NULL THEN
        PERFORM migrate_legacy_asset(rec.image_url, 'Project Gallery Image', 'Portfolio', 'project', rec.project_id, 'gallery');
      END IF;
    END LOOP;
  END IF;

  -- 3. Migrate Services (icon_url)
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'icon_url') THEN
    FOR rec IN EXECUTE 'SELECT id, name, icon_url FROM public.services' LOOP
      IF rec.icon_url IS NOT NULL THEN
        PERFORM migrate_legacy_asset(rec.icon_url, rec.name || ' Icon', 'Services', 'service', rec.id, 'icon');
      END IF;
    END LOOP;
  END IF;
  
  -- 3b. Migrate Services (hero_image)
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'hero_image') THEN
    FOR rec IN EXECUTE 'SELECT id, name, hero_image FROM public.services' LOOP
      IF rec.hero_image IS NOT NULL THEN
        PERFORM migrate_legacy_asset(rec.hero_image, rec.name || ' Hero', 'Services', 'service', rec.id, 'hero');
      END IF;
    END LOOP;
  END IF;

  -- 4. Migrate Blogs
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'cover_image_url') THEN
    FOR rec IN EXECUTE 'SELECT id, title, cover_image_url FROM public.blog_posts' LOOP
      IF rec.cover_image_url IS NOT NULL THEN
        PERFORM migrate_legacy_asset(rec.cover_image_url, rec.title || ' Cover', 'Marketing', 'blog', rec.id, 'cover');
      END IF;
    END LOOP;
  END IF;
END $$;

-- Drop function
DROP FUNCTION IF EXISTS migrate_legacy_asset;

-- Finally, rename the deprecated columns instead of dropping them immediately
-- This provides a safety net if we need to rollback.
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'cover_image_url') THEN
      ALTER TABLE public.projects RENAME COLUMN cover_image_url TO deprecated_cover_image_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'cover_image') THEN
      ALTER TABLE public.projects RENAME COLUMN cover_image TO deprecated_cover_image;
    END IF;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_gallery') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_gallery' AND column_name = 'image_url') THEN
      ALTER TABLE public.project_gallery RENAME COLUMN image_url TO deprecated_image_url;
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'icon_url') THEN
      ALTER TABLE public.services RENAME COLUMN icon_url TO deprecated_icon_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'hero_image') THEN
      ALTER TABLE public.services RENAME COLUMN hero_image TO deprecated_hero_image;
    END IF;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'cover_image_url') THEN
      ALTER TABLE public.blog_posts RENAME COLUMN cover_image_url TO deprecated_cover_image_url;
    END IF;
  END IF;
END $$;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000002') ON CONFLICT DO NOTHING;

-- Migration: 20260622000003_dam_v3_two_step_upload.sql
-- Create a 2-step RPC to prevent orphaned ImageKit files on client crash

-- 1. Create the placeholder asset
CREATE OR REPLACE FUNCTION rpc_create_uploading_asset(
  p_type asset_type_enum,
  p_source asset_source_enum,
  p_title text
)
RETURNS uuid AS $$
DECLARE
  v_asset_id uuid;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and editors can create DAM assets';
  END IF;

  INSERT INTO assets (
    type, 
    source, 
    status, 
    title
  ) VALUES (
    p_type, 
    p_source, 
    'uploading'::asset_status_enum, 
    p_title
  ) RETURNING id INTO v_asset_id;

  RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Finalize the asset once ImageKit is complete
CREATE OR REPLACE FUNCTION rpc_finalize_dam_asset(
  p_asset_id uuid,
  p_file_id text,
  p_url text,
  p_size_bytes bigint,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and editors can finalize DAM assets';
  END IF;

  -- Create the asset version
  INSERT INTO asset_versions (
    asset_id,
    version_number,
    storage_provider,
    file_id,
    url,
    size_bytes,
    mime_type,
    width,
    height
  ) VALUES (
    p_asset_id,
    1,
    'imagekit',
    p_file_id,
    p_url,
    p_size_bytes,
    p_mime_type,
    p_width,
    p_height
  );

  -- Bind the usage if entity provided
  IF p_entity_id IS NOT NULL THEN
    INSERT INTO asset_usages (
      asset_id,
      domain,
      entity_type,
      entity_id,
      role,
      is_primary
    ) VALUES (
      p_asset_id,
      p_domain,
      p_entity_type,
      p_entity_id,
      p_role,
      true
    );
  END IF;

  -- Mark the asset as ready
  UPDATE assets SET status = 'ready'::asset_status_enum WHERE id = p_asset_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000003') ON CONFLICT DO NOTHING;

-- Migration: 20260622000004_dam_v3_url_usage_triggers.sql
-- ==========================================
-- DAM V3: Sync Triggers for Asset Usages
-- ==========================================

-- Function for singular text URL columns
CREATE OR REPLACE FUNCTION sync_asset_usage_from_url()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id uuid;
  v_old_url text;
  v_new_url text;
  v_entity_type text;
  v_role text;
  v_domain text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_url USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_url USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  -- If URL changed or is new
  IF TG_OP = 'INSERT' OR v_old_url IS DISTINCT FROM v_new_url THEN
    -- Remove old usage if exists
    IF v_old_url IS NOT NULL AND v_old_url != '' THEN
      DELETE FROM asset_usages 
      WHERE entity_id = NEW.id 
      AND entity_type = v_entity_type 
      AND role = v_role;
    END IF;

    -- Add new usage
    IF v_new_url IS NOT NULL AND v_new_url != '' THEN
      SELECT asset_id INTO v_asset_id 
      FROM asset_versions 
      WHERE url = v_new_url 
      ORDER BY created_at DESC 
      LIMIT 1;

      IF v_asset_id IS NOT NULL THEN
        -- Check if it already exists to avoid duplicates
        SELECT id INTO v_existing_usage_id 
        FROM asset_usages 
        WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
        
        IF v_existing_usage_id IS NULL THEN
          INSERT INTO asset_usages (
            asset_id,
            domain,
            entity_type,
            entity_id,
            role,
            is_primary
          ) VALUES (
            v_asset_id,
            v_domain,
            v_entity_type,
            NEW.id,
            v_role,
            true
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function for text array URL columns
CREATE OR REPLACE FUNCTION sync_asset_usage_from_url_array()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id uuid;
  v_old_urls text[];
  v_new_urls text[];
  v_entity_type text;
  v_role text;
  v_domain text;
  v_url text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_urls USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_urls USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  IF TG_OP = 'INSERT' OR v_old_urls IS DISTINCT FROM v_new_urls THEN
    -- Delete all existing usages for this array role
    DELETE FROM asset_usages 
    WHERE entity_id = NEW.id 
    AND entity_type = v_entity_type 
    AND role = v_role;

    -- Add new usages
    IF v_new_urls IS NOT NULL THEN
      FOREACH v_url IN ARRAY v_new_urls
      LOOP
        IF v_url IS NOT NULL AND v_url != '' THEN
          SELECT asset_id INTO v_asset_id 
          FROM asset_versions 
          WHERE url = v_url 
          ORDER BY created_at DESC 
          LIMIT 1;

          IF v_asset_id IS NOT NULL THEN
            SELECT id INTO v_existing_usage_id 
            FROM asset_usages 
            WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
            
            IF v_existing_usage_id IS NULL THEN
              INSERT INTO asset_usages (
                asset_id,
                domain,
                entity_type,
                entity_id,
                role,
                is_primary
              ) VALUES (
                v_asset_id,
                v_domain,
                v_entity_type,
                NEW.id,
                v_role,
                false
              );
            END IF;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- Attach Triggers
--
-- Guarded on table + column existence rather than issuing bare DDL.
--
-- `blogs` is renamed to _blogs_deprecated by
-- 20260529180300_consolidate_duplicate_tables, whose only guard is
-- IF EXISTS (blogs) — so on a fresh database that rename always fires and this
-- migration used to abort here with 42P01 ("relation \"blogs\" does not
-- exist"), leaving the whole chain unreplayable. Note that `DROP TRIGGER IF
-- EXISTS ... ON blogs` guards the trigger, not the table, so it aborts too.
--
-- Production still has `blogs` (that rename never fired there), so this creates
-- exactly the same five triggers it always did wherever the tables are present,
-- and simply skips the ones whose table is absent.
-- ==========================================

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('sync_portfolio_image_usage',       'portfolio',              'image_url',    'hero',   'Portfolio'),
      ('sync_portfolio_video_usage',       'portfolio',              'video_url',    'video',  'Portfolio'),
      ('sync_blogs_cover_usage',           'blogs',                  'cover_image',  'hero',   'Marketing'),
      ('sync_transformation_before_usage', 'transformation_stories', 'before_media', 'before', 'Portfolio'),
      ('sync_transformation_after_usage',  'transformation_stories', 'after_media',  'after',  'Portfolio')
    ) AS v(trigger_name, table_name, column_name, usage_role, usage_domain)
  LOOP
    IF to_regclass('public.' || t.table_name) IS NULL THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — table public.% does not exist',
        t.trigger_name, t.table_name;
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t.table_name
        AND column_name = t.column_name
    ) THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — public.%.% does not exist',
        t.trigger_name, t.table_name, t.column_name;
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t.trigger_name, t.table_name);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OF %I ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION sync_asset_usage_from_url(%L, %L, %L, %L)',
      t.trigger_name, t.column_name, t.table_name,
      t.column_name, t.table_name, t.usage_role, t.usage_domain
    );
  END LOOP;
END $$;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000004') ON CONFLICT DO NOTHING;

-- Migration: 20260622000005_dam_v3_more_url_triggers.sql
-- ==========================================
-- DAM V3: More Sync Triggers for Asset Usages
--
-- Guarded on table + column existence, same as
-- 20260622000004_dam_v3_url_usage_triggers.
--
-- hero_media, site_settings and team_members all exist in production but are
-- created by no migration in this repo, so a fresh database has none of them
-- and the bare DDL below used to abort the replay with 42P01. (`DROP TRIGGER
-- IF EXISTS ... ON <table>` guards the trigger, not the table, so it aborts
-- too.) Wherever the tables are present this creates exactly the same five
-- triggers it always did.
-- ==========================================

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('sync_hero_media_usage',         'hero_media',    'media_url',        'hero',    'Marketing'),
      ('sync_settings_logo_usage',      'site_settings', 'company_logo_url', 'logo',    'System'),
      ('sync_settings_favicon_usage',   'site_settings', 'favicon_url',      'favicon', 'System'),
      ('sync_settings_og_usage',        'site_settings', 'og_image_url',     'og_image','System'),
      ('sync_team_members_image_usage', 'team_members',  'image_url',        'avatar',  'Marketing')
    ) AS v(trigger_name, table_name, column_name, usage_role, usage_domain)
  LOOP
    IF to_regclass('public.' || t.table_name) IS NULL THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — table public.% does not exist',
        t.trigger_name, t.table_name;
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t.table_name
        AND column_name = t.column_name
    ) THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — public.%.% does not exist',
        t.trigger_name, t.table_name, t.column_name;
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t.trigger_name, t.table_name);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OF %I ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION sync_asset_usage_from_url(%L, %L, %L, %L)',
      t.trigger_name, t.column_name, t.table_name,
      t.column_name, t.table_name, t.usage_role, t.usage_domain
    );
  END LOOP;
END $$;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260622000005') ON CONFLICT DO NOTHING;

-- Migration: 20260625000000_discovery_intelligence_on_leads.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Add Discovery Intelligence columns to leads
-- Phase 13: Discovery → Estimator → CRM pipeline
-- ═══════════════════════════════════════════════════════════
--
-- When a user completes the Discovery quiz before the Estimator,
-- the submit-estimate edge function now forwards the DiscoveryHandoff
-- payload. These columns capture the full psychological profile so
-- designers can see archetype + signals on the CRM record during
-- the sales call \u2014 no need to ask "what kind of space do you want?".
--
-- All columns are nullable. Leads captured without a prior Discovery
-- session (direct Estimator users) will have these set to null.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE leads
  -- Archetype classification (e.g. "The Warm Modernist")
  ADD COLUMN IF NOT EXISTS discovery_archetype text,

  -- ALCS confidence score 0.0\u20131.0 (e.g. 0.92 = 92%)
  ADD COLUMN IF NOT EXISTS discovery_confidence numeric(5,4),

  -- Resolved emotional goal sentence from ALCS
  ADD COLUMN IF NOT EXISTS discovery_emotional_goal text,

  -- Full lifestyle signals: members, familyType, hostingFreq,
  -- cookingRole, workFromHome, children, petsPresent, hobbies
  ADD COLUMN IF NOT EXISTS discovery_lifestyle jsonb,

  -- Room priorities: mustHave[], niceToHave[], emotionalWeights{}
  ADD COLUMN IF NOT EXISTS discovery_priorities jsonb,

  -- Sensory profile: lighting, textures, luxuryResolvedAs, scalePreference
  ADD COLUMN IF NOT EXISTS discovery_sensory jsonb,

  -- Contradiction signals detected by ALCS (e.g. intent vs visual conflict)
  ADD COLUMN IF NOT EXISTS discovery_contradictions jsonb;

-- Index for admin CRM filtering by archetype
CREATE INDEX IF NOT EXISTS idx_leads_discovery_archetype
  ON leads (discovery_archetype)
  WHERE discovery_archetype IS NOT NULL;

-- Partial index for "all discovery-linked leads"
CREATE INDEX IF NOT EXISTS idx_leads_has_discovery
  ON leads (id)
  WHERE discovery_archetype IS NOT NULL;

-- Comment columns for documentation
COMMENT ON COLUMN leads.discovery_archetype IS 'Aesthetic archetype from Discovery quiz (e.g. "The Warm Modernist"). Null if user skipped Discovery.';
COMMENT ON COLUMN leads.discovery_confidence IS 'ALCS engine confidence score 0\u20131 for archetype classification. Null if no Discovery session.';
COMMENT ON COLUMN leads.discovery_emotional_goal IS 'Plain-language emotional goal resolved by ALCS (e.g. "Layered warmth in structured modern design").';
COMMENT ON COLUMN leads.discovery_lifestyle IS 'UserSignals.lifestyle sub-object: family size, hosting frequency, cooking role, WFH, children, pets.';
COMMENT ON COLUMN leads.discovery_priorities IS 'UserSignals.priorities: mustHave[], niceToHave[], emotionalWeights per room.';
COMMENT ON COLUMN leads.discovery_sensory IS 'UserSignals.sensory: lighting preference, texture preferences, luxury resolution mode.';
COMMENT ON COLUMN leads.discovery_contradictions IS 'ALCS-detected conflicts between stated intent and visual/sensory signals.';


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260625000000') ON CONFLICT DO NOTHING;

-- Migration: 20260625100000_alcs_recommendation_evidence.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Add ALCS Recommendation and Evidence to leads
-- Phase 15: Recommendation Explainability
-- ═══════════════════════════════════════════════════════════

ALTER TABLE leads
  ADD COLUMN alcs_execution_path text,
  ADD COLUMN alcs_confidence numeric,
  ADD COLUMN alcs_reasoning text,
  ADD COLUMN alcs_evidence jsonb,
  ADD COLUMN alcs_primary_drivers jsonb;

COMMENT ON COLUMN leads.alcs_execution_path IS 'ALCS Engine recommended execution path.';
COMMENT ON COLUMN leads.alcs_confidence IS 'ALCS Engine confidence score 0-100 for the recommendation.';
COMMENT ON COLUMN leads.alcs_reasoning IS 'Narrative Because... explanation generated by ALCS.';
COMMENT ON COLUMN leads.alcs_evidence IS 'Ledger of evidence entries used to calculate the ALCS recommendation.';
COMMENT ON COLUMN leads.alcs_primary_drivers IS 'List of primary drivers for the ALCS recommendation.';


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260625100000') ON CONFLICT DO NOTHING;

-- Migration: 20260625110000_decision_events.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Add decision_events table
-- Phase 17: Project Intelligence Workspace
-- ═══════════════════════════════════════════════════════════

CREATE TABLE decision_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('Meeting', 'Call', 'Proposal', 'Revision', 'SiteVisit', 'Approval', 'Handover')),
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE decision_events IS 'Stores the outcome of human validation (designer or client) of AI recommendations to feed back into the Decision Intelligence flywheel.';

-- Set up RLS
ALTER TABLE decision_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert decision_events"
  ON decision_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can select decision_events"
  ON decision_events FOR SELECT
  TO authenticated
  USING (true);

-- Index for querying by lead
CREATE INDEX idx_decision_events_lead_id ON decision_events(lead_id);


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260625110000') ON CONFLICT DO NOTHING;

-- Migration: 20260625120000_add_decision_session_id.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Add session_id to decision_events
-- ═══════════════════════════════════════════════════════════

ALTER TABLE decision_events 
ADD COLUMN session_id uuid;

CREATE INDEX idx_decision_events_session_id ON decision_events(session_id);

COMMENT ON COLUMN decision_events.session_id IS 'Groups multiple decision events (e.g., Acceptances, Debriefs) into a single logical meeting session for chronolgical reconstruction.';


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260625120000') ON CONFLICT DO NOTHING;

-- Migration: 20260630000000_enrich_process_steps.sql
-- Add rich fields to design_process_steps for TimelineGantt
ALTER TABLE public.design_process_steps 
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS timeline_estimate text,
ADD COLUMN IF NOT EXISTS client_does jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS we_do jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb;

-- Update row 1
UPDATE public.design_process_steps 
SET 
  budget_range = 'No cost — free site visit',
  timeline_estimate = 'Week 1',
  client_does = '["Share reference images or ideas you like", "Communicate your budget range honestly", "Walk us through your daily routine in the space"]'::jsonb,
  we_do = '["Visit your site for initial assessment", "Explain our 5-stage process in plain language", "Provide a preliminary ballpark estimate", "Answer every question before you commit"]'::jsonb,
  deliverables = '["Initial project summary document", "Ballpark cost estimate", "Process timeline overview"]'::jsonb
WHERE step_number = '01';

-- Update row 2
UPDATE public.design_process_steps 
SET 
  budget_range = 'Included in design fee',
  timeline_estimate = 'Week 2',
  client_does = '["Grant site access for detailed measurements", "Confirm family/household requirements", "Review initial floor plans and provide feedback"]'::jsonb,
  we_do = '["Laser-measure every dimension", "Document existing electrical, plumbing, and structural points", "Create 2–3 layout options for your review", "Flag potential structural or budget constraints early"]'::jsonb,
  deliverables = '["Detailed floor plans with dimensions", "Existing condition report", "2–3 spatial layout options"]'::jsonb
WHERE step_number = '02';

-- Update row 3
UPDATE public.design_process_steps 
SET 
  budget_range = '₹1.5–3L for full design package',
  timeline_estimate = 'Week 3–4',
  client_does = '["Review 3D renders and material samples", "Choose between design options", "Approve final design before execution", "Finalize budget allocation per room"]'::jsonb,
  we_do = '["Create photorealistic 3D renders of every room", "Curate material boards with physical samples", "Design custom furniture and joinery details", "Prepare detailed electrical, plumbing, and lighting plans", "Provide itemized cost breakdown for approval"]'::jsonb,
  deliverables = '["Photorealistic 3D renders (front, top, perspective views)", "Material and finish sample board", "Furniture and lighting schedule", "Approved bill of quantities with costs"]'::jsonb
WHERE step_number = '03';

-- Update row 4
UPDATE public.design_process_steps 
SET 
  budget_range = '70% of total project cost',
  timeline_estimate = 'Week 5–7',
  client_does = '["Make scheduled payments per milestone", "Approve any change orders (rare, but communicated immediately)", "Provide site access during working hours"]'::jsonb,
  we_do = '["Manufacture and install all modular joinery", "Coordinate all trades (electrical, plumbing, painting, flooring)", "Daily progress photos and weekly status reports", "Proactively flag and resolve site issues", "Strict quality checks at every milestone"]'::jsonb,
  deliverables = '["Daily site progress photos", "Weekly status reports", "Milestone completion sign-offs"]'::jsonb
WHERE step_number = '04';

-- Update row 5
UPDATE public.design_process_steps 
SET 
  budget_range = 'Final 10% on completion',
  timeline_estimate = 'Week 8',
  client_does = '["Attend final walkthrough and sign-off", "Receive maintenance and warranty documentation"]'::jsonb,
  we_do = '["Final walkthrough with detailed checklist", "Deep-cleaning of entire space", "Interior styling and finishing touches", "Handover of all warranties, manuals, and maintenance guides", "Post-handover support for 30 days"]'::jsonb,
  deliverables = '["Final walkthrough sign-off document", "Maintenance and care guide", "Warranty certificates", "Styled, move-in-ready space"]'::jsonb
WHERE step_number = '05';

-- Create process FAQs
CREATE TABLE IF NOT EXISTS public.process_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.process_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view process faqs" ON public.process_faqs FOR SELECT USING (true);
CREATE POLICY "Admin can modify process faqs" ON public.process_faqs USING (public.is_admin_or_editor(auth.uid()));

INSERT INTO public.process_faqs (question, answer, display_order) VALUES
('Do I need to hire an architect or structural engineer separately?', 'For most interior projects, no — our in-house team handles all spatial planning, electrical layouts, and modular joinery designs. For structural changes (load-bearing wall removal, additions), we coordinate with empanelled structural engineers and include that in the project management.', 1),
('Can I live in my home during the renovation?', 'It depends on the scope. For single-room renovations like a master suite or kitchen, you can usually stay in the rest of the home — we seal off the work zone and manage dust. For full-home renovations, we recommend temporary accommodation for 4–6 weeks. We can help arrange that.', 2),
('What if I don''t like the design after seeing the 3D renders?', 'That''s exactly why we do 3D renders before execution. You can request revisions during the design stage (Stage Three) at no additional cost for up to two revision rounds. Once you approve and sign off, we proceed with zero ambiguity — what you see is what you get.', 3),
('How is payment structured?', 'Payments are tied to milestones, not calendar dates. Typically: 30% at design approval, 40% at execution start, 20% at installation completion, and 10% at final handover. Every payment is linked to a deliverable you can see and verify.', 4),
('What happens if the timeline slips?', 'Our timeline is contractually guaranteed. We build in 15% buffer for unforeseen delays (material availability, site conditions). If we exceed the agreed timeline due to factors within our control, we apply a pre-defined service credit. In over 500 projects, 95% have delivered on time.', 5),
('What areas do you serve?', 'We are based in Jamshedpur and serve the entire Jharkhand region including Ranchi, Tata Nagar, and nearby districts. For larger commercial projects, we also take on assignments across eastern India.', 6)
ON CONFLICT DO NOTHING;

-- Create process metrics
CREATE TABLE IF NOT EXISTS public.process_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  value text NOT NULL,
  label text NOT NULL,
  suffix text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.process_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view process metrics" ON public.process_metrics FOR SELECT USING (true);
CREATE POLICY "Admin can modify process metrics" ON public.process_metrics USING (public.is_admin_or_editor(auth.uid()));

INSERT INTO public.process_metrics (value, label, suffix, display_order) VALUES
('500+', 'Projects Delivered', NULL, 1),
('₹200Cr+', 'Total Value Managed', NULL, 2),
('95%', 'On-Time Delivery', NULL, 3),
('4.9', 'Client Rating', '★', 4)
ON CONFLICT DO NOTHING;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260630000000') ON CONFLICT DO NOTHING;

-- Migration: 20260702000000_rbac_v2_editor_role.sql
-- =========================================================
-- Migration: rbac_v2_editor_role
-- Date: 2026-07-02
-- Description: Add 'editor' role to app_role enum, fix all
--              helper functions and RLS policies to correctly
--              enforce editor (CMS) and viewer (CRM) access.
-- =========================================================

-- ─── 1. Add 'editor' to the app_role enum ────────────────────────────────────
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- NOTE: every comparison against 'editor' below casts role to text.
-- Postgres will not resolve an enum label that was added earlier in the same
-- transaction (SQLSTATE 55P04), and Supabase applies each migration file in
-- one transaction, so `role IN (..., 'editor')` aborts a fresh replay.
-- The text comparison matches exactly the same rows.


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
      AND role::text IN ('super_admin', 'admin', 'editor')
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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all blog_posts" ON public.blog_posts';
        EXECUTE 'CREATE POLICY "cms_all_blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (is_cms_editor()) WITH CHECK (is_cms_editor())';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gallery_items') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all gallery_items" ON public.gallery_items';
        EXECUTE 'CREATE POLICY "cms_all_gallery_items" ON public.gallery_items FOR ALL TO authenticated USING (is_cms_editor()) WITH CHECK (is_cms_editor())';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all testimonials" ON public.testimonials';
        EXECUTE 'DROP POLICY IF EXISTS "admin_delete_testimonials" ON public.testimonials';
        EXECUTE 'DROP POLICY IF EXISTS "admin_insert_testimonials" ON public.testimonials';
        EXECUTE 'DROP POLICY IF EXISTS "admin_update_testimonials" ON public.testimonials';
        EXECUTE 'CREATE POLICY "cms_all_testimonials" ON public.testimonials FOR ALL TO authenticated USING (is_cms_editor()) WITH CHECK (is_cms_editor())';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin all services" ON public.services';
        EXECUTE 'DROP POLICY IF EXISTS "admin_delete_services" ON public.services';
        EXECUTE 'DROP POLICY IF EXISTS "admin_insert_services" ON public.services';
        EXECUTE 'DROP POLICY IF EXISTS "admin_update_services" ON public.services';
        EXECUTE 'CREATE POLICY "cms_all_services" ON public.services FOR ALL TO authenticated USING (is_cms_editor()) WITH CHECK (is_cms_editor())';
    END IF;
END $$;


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
        role::text IN ('editor', 'viewer')
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
        role::text IN ('editor', 'viewer')
      ELSE false
    END
  )
  WITH CHECK (
    CASE
      WHEN has_role(auth.uid(), 'super_admin') THEN true
      WHEN has_role(auth.uid(), 'admin') THEN
        role::text IN ('editor', 'viewer')
      ELSE false
    END
  );

-- Only super_admin can delete roles
CREATE POLICY "super_admin_delete_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260702000000') ON CONFLICT DO NOTHING;

-- Migration: 20260706000000_project_commitments.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Create workspace project commitments
-- Phase 30C.4: Project Commitment
-- ═══════════════════════════════════════════════════════════

CREATE TABLE workspace_project_commitments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- The 4 core artifacts
    decision_genome jsonb NOT NULL,
    project_snapshot jsonb NOT NULL,
    narrative_brief text NOT NULL,
    workspace_state jsonb NOT NULL,

    -- Versioning for backwards compatibility during re-evaluation
    decision_schema_version text NOT NULL DEFAULT '1.0.0',
    genome_version text NOT NULL DEFAULT '1.0.0',
    recommendation_engine_version text NOT NULL DEFAULT '1.0.0',
    design_system_version text NOT NULL DEFAULT '2.0.0',
    
    -- Identifiers
    session_id uuid,
    lead_id uuid REFERENCES leads(id) ON DELETE SET NULL
);

-- Indexing for lookups
CREATE INDEX idx_workspace_commitments_session ON workspace_project_commitments(session_id);
CREATE INDEX idx_workspace_commitments_lead ON workspace_project_commitments(lead_id);

-- Add comments for documentation
COMMENT ON TABLE workspace_project_commitments IS 'Stores immutable user decisions from the Workspace Digital Studio experience. Derived values (estimates, scores) should be regenerated from the genome rather than treated as authoritative, though a snapshot is kept for reference.';
COMMENT ON COLUMN workspace_project_commitments.decision_genome IS 'The canonical source of truth containing all 13 decision commitments.';
COMMENT ON COLUMN workspace_project_commitments.project_snapshot IS 'Point-in-time snapshot of budget, estimate, confidence, project health, and missing info.';
COMMENT ON COLUMN workspace_project_commitments.narrative_brief IS 'Human-readable summary generated from decision sentences, serving as the design brief.';
COMMENT ON COLUMN workspace_project_commitments.workspace_state IS 'Resume position, AI reasoning, recommendation evidence, and environment state.';


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260706000000') ON CONFLICT DO NOTHING;

-- Migration: 20260706010000_decision_ledger_revisions.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Decision Ledger (Commitment Revisions)
-- Phase 30.5.1: Learning Engine Data Structure
-- ═══════════════════════════════════════════════════════════

-- Rename existing table to act as the revisions (ledger)
ALTER TABLE workspace_project_commitments RENAME TO workspace_commitment_revisions;

-- Add versioning and ledger tracking columns
ALTER TABLE workspace_commitment_revisions
  ADD COLUMN commitment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN previous_revision_id uuid REFERENCES workspace_commitment_revisions(id) ON DELETE SET NULL,
  ADD COLUMN is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN locked_at timestamptz,
  ADD COLUMN recommendation_id uuid, -- Link back to AI recommendation if applied
  ADD COLUMN divergence_score numeric(5, 2); -- 0-100 similarity score when locked

-- Update comments
COMMENT ON TABLE workspace_commitment_revisions IS 'Append-only Decision Ledger storing every revision of a workspace commitment. Analogous to git commits.';
COMMENT ON COLUMN workspace_commitment_revisions.commitment_id IS 'Logical grouping ID for a single thread of decisions (the "branch").';
COMMENT ON COLUMN workspace_commitment_revisions.is_locked IS 'True when the designer formally locks the commitment and presents it to the client.';
COMMENT ON COLUMN workspace_commitment_revisions.divergence_score IS 'Computed similarity between the final locked state and the original AI recommendation.';

-- Add index on commitment_id
CREATE INDEX idx_workspace_revisions_commitment ON workspace_commitment_revisions(commitment_id);


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260706010000') ON CONFLICT DO NOTHING;

-- Migration: 20260707000001_add_workspace_studio_lead_source.sql
-- ═══════════════════════════════════════════════════════════
-- Migration: Add workspace_studio to lead_source_enum
-- OI-001 Resolution: schema mismatch in submit-workspace-commitment
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source_enum') THEN
    ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'workspace_studio';
  END IF;
END $$;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260707000001') ON CONFLICT DO NOTHING;

-- Migration: 20260910000000_imagekit_delivery_fixes.sql
-- ==========================================
-- ImageKit delivery fixes
--
-- 1. Unique index on media_files.file_name so sync-imagekit can upsert.
-- 2. Correct migrate_legacy_asset's ImageKit path extraction.
--
-- Context: the `/cross-angle` URL-endpoint's origin is the Supabase Storage
-- public root, and the ImageKit Files API returns URLs built from the account's
-- DEFAULT endpoint (ik.imagekit.io/<account>/...), never the /cross-angle one.
-- ==========================================

-- ── 1. media_files upsert key ────────────────────────────────────────────────
-- sync-imagekit upserts on file_name, which had no unique constraint — the
-- table's only unique key is (folder_id, display_name), and NULL folder_id
-- makes every row distinct there, so repeated syncs would duplicate rows.
-- Verified unique across all existing rows before adding this.
CREATE UNIQUE INDEX IF NOT EXISTS media_files_file_name_key
  ON public.media_files (file_name);

-- ── 2. migrate_legacy_asset path extraction ──────────────────────────────────
-- The previous body did:
--   REPLACE(p_url, 'https://ik.imagekit.io/wdrs8y61o/cross-angle/', '')
-- That literal never matches a real stored URL, so file_id was populated with
-- the full URL instead of a relative path. Strip the account endpoint, the
-- optional /cross-angle segment and any transform segment generically, and
-- leave non-ImageKit URLs untouched.
CREATE OR REPLACE FUNCTION migrate_legacy_asset(
  p_url text,
  p_title text,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
) RETURNS void AS $$
DECLARE
  v_asset_id uuid;
  v_file_id  text;
BEGIN
  IF p_url IS NULL OR p_url = '' THEN
    RETURN;
  END IF;

  -- Strip: scheme + host + account id, an optional URL-endpoint segment, and
  -- an optional `tr:...` transform segment. Non-ImageKit URLs pass through.
  v_file_id := regexp_replace(
    p_url,
    '^https?://ik\.imagekit\.io/[^/]+/(cross-angle/)?(tr:[^/]+/)?',
    ''
  );

  -- Insert Asset
  INSERT INTO public.assets (type, source, status, title)
  VALUES ('image', 'uploaded', 'ready', p_title)
  RETURNING id INTO v_asset_id;

  -- Insert Version
  INSERT INTO public.asset_versions (asset_id, version_number, file_id, url)
  VALUES (v_asset_id, 1, v_file_id, p_url);

  -- Insert Usage
  INSERT INTO public.asset_usages (asset_id, domain, entity_type, entity_id, role, is_primary)
  VALUES (v_asset_id, p_domain, p_entity_type, p_entity_id, p_role, true);
END;
$$ LANGUAGE plpgsql;

-- ── 3. Backfill file_id for rows the old REPLACE left as full URLs ───────────
UPDATE public.asset_versions
SET file_id = regexp_replace(
      url,
      '^https?://ik\.imagekit\.io/[^/]+/(cross-angle/)?(tr:[^/]+/)?',
      ''
    )
WHERE url LIKE 'https://ik.imagekit.io/%'
  AND file_id = url;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260910000000') ON CONFLICT DO NOTHING;

-- Migration: 20260911000000_lock_down_site_settings.sql
-- Migration: Lock down public.site_settings (Admin Audit P0-1)
--
-- Before: the table carried a permissive anon SELECT policy and the browser
--         read it with select("*"), so every anonymous visitor could pull
--         provider API keys, security_config, report_recipients,
--         telegram_chat_ids and rbac_permissions straight off the REST API.
--
-- After:
--   1. Third-party secrets no longer live in this table at all. Edge functions
--      already read RESEND_API_KEY / TELEGRAM_BOT_TOKEN / POSTHOG_* from
--      Supabase secrets (Deno.env), so the columns were a dead-end store.
--   2. anon can only SELECT an explicit allow-list of public columns
--      (column-level GRANT). `select("*")` on the base table as anon now fails;
--      the browser hook selects the same allow-list explicitly.
--   3. Any authenticated staff user can read the full row (needed for the admin
--      dashboard); writes remain admin/editor only via is_admin_or_editor().
--
-- Adding a new PUBLIC column later means adding it in two places: the GRANT
-- below and PUBLIC_COLUMNS in apps/web/src/hooks/useSiteSettings.ts.

-- ── 1. Remove secret storage ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_settings') THEN
    ALTER TABLE public.site_settings DROP COLUMN IF EXISTS resend_api_key;
    ALTER TABLE public.site_settings DROP COLUMN IF EXISTS posthog_project_api_key;
    ALTER TABLE public.site_settings DROP COLUMN IF EXISTS posthog_host;
    ALTER TABLE public.site_settings DROP COLUMN IF EXISTS telegram_bot_token;
  END IF;
END $$;

-- Strip any tokens the old Credentials tab wrote into the integrations JSON.
-- The email_templates sub-object is kept — it is the only legitimate content.
UPDATE public.site_settings
SET integrations = integrations - 'whisper_api_key' - 'checkly_api_key' - 'telegram_bot_token'
WHERE integrations IS NOT NULL
  AND jsonb_typeof(integrations) = 'object';

-- ── 2. Reset RLS to a known state ─────────────────────────────────────────
-- Production has policies that no migration created (see ADR 0003), so drop
-- everything on the table dynamically rather than guessing names.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_settings', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors: row access allowed, columns restricted by GRANT below.
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT TO anon
  USING (true);

-- Any signed-in staff member may read the full configuration row.
CREATE POLICY "Staff read site_settings"
  ON public.site_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin insert site_settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update site_settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete site_settings"
  ON public.site_settings FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- ── 3. Column-level grant for anon ────────────────────────────────────────
-- posthog_api_key is a PostHog *project* token (phc_…): it is shipped in the
-- browser bundle by design and is write-only on PostHog's side, so it is not
-- a secret. ga_measurement_id / fb_pixel_id are likewise public identifiers.
REVOKE ALL ON public.site_settings FROM anon;
GRANT SELECT (
  id,
  studio_name,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  map_embed_url,
  business_hours,
  logo_light_url,
  logo_dark_url,
  company_logo_url,
  favicon_url,
  og_image_url,
  about_video_url,
  seo_title_template,
  seo_description,
  ga_measurement_id,
  fb_pixel_id,
  posthog_api_key,
  posthog_host,
  maintenance_mode_active,
  nav_links,
  footer_columns,
  social_links,
  studio_stats,
  hero_title,
  hero_subtitle,
  about_text,
  footer_text,
  contact_intro,
  updated_at
) ON public.site_settings TO anon;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000000') ON CONFLICT DO NOTHING;

-- Migration: 20260911000001_drop_legacy_telegram_trigger.sql
-- Migration: Drop Legacy Telegram Trigger
-- Drops the old plaintext-GUC trigger which is being replaced by a Supabase Database Webhook.

DROP TRIGGER IF EXISTS on_lead_insert_telegram_notify ON public.leads;
DROP FUNCTION IF EXISTS public.handle_new_lead_telegram_notify();


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000001') ON CONFLICT DO NOTHING;

-- Migration: 20260911000002_add_lead_webhook_trigger.sql
-- Migration: Add Database Webhook trigger for Telegram notifications
-- Replaces the dropped plaintext-GUC trigger (20260911000001_drop_legacy_telegram_trigger.sql).
--
-- Architecture:
--   leads INSERT
--     ↓
--   handle_lead_webhook_notify() [pg_net, secret stored in function body]
--     ↓
--   notify-telegram Edge Function  [authenticates via WEBHOOK_SECRET env var]
--     ↓
--   Telegram
--
-- The Authorization header secret is stored in the trigger function body (pg_proc).
-- It is NOT exposed via current_setting() GUC.
-- The matching WEBHOOK_SECRET is stored in Supabase Edge Function secrets only.
-- To rotate: regenerate secret, update Edge Function secret, re-run this migration.
--
-- NOTE: The actual secret value is NOT in this migration file.
-- Re-create this trigger (with updated secret) by running:
--   supabase db push
-- after setting the new secret value in the function body via the Supabase Dashboard SQL editor
-- or via the project's secure secret management workflow.

-- Idempotent: safe to re-run
DROP TRIGGER IF EXISTS on_lead_insert_webhook_notify ON public.leads;
DROP FUNCTION IF EXISTS public.handle_lead_webhook_notify();

-- The trigger function body below is intentionally redacted in this migration file.
-- The live version (with the actual Authorization header) was applied directly
-- via the Supabase SQL API to avoid committing the secret to version control.
-- See: docs/architecture/telegram-webhook.md for the rotation procedure.
CREATE OR REPLACE FUNCTION public.handle_lead_webhook_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- PLACEHOLDER: This function must be re-applied with the actual WEBHOOK_SECRET
  -- via the secure rotation procedure documented in docs/architecture/telegram-webhook.md.
  -- The live version was deployed directly; this migration sets up the trigger
  -- structure for reproducibility.
  PERFORM net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/notify-telegram',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.webhook_secret', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', row_to_json(NEW),
      'schema', 'public'
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lead_insert_webhook_notify
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_lead_webhook_notify();

COMMENT ON FUNCTION public.handle_lead_webhook_notify() IS
  'Sends Telegram notification via Edge Function on every new lead INSERT. '
  'Authenticated via WEBHOOK_SECRET (stored in Edge Function secrets). '
  'The live trigger function body contains the actual secret — rotate via the procedure '
  'in docs/architecture/telegram-webhook.md.';


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000002') ON CONFLICT DO NOTHING;

-- Migration: 20260911000003_fix_blog_events_ingestion.sql
-- Migration: Fix blog events ingestion
-- 1. Add session_id column to blog_user_events if not present
ALTER TABLE public.blog_user_events ADD COLUMN IF NOT EXISTS session_id text;
CREATE INDEX IF NOT EXISTS idx_blog_user_events_session_id ON public.blog_user_events(session_id);

-- 2. Fix record_blog_event RPC:
--    - Sets explicit search_path = public, auth for SECURITY DEFINER security
--    - Safely parses UUIDs to avoid input syntax errors on non-UUID strings
--    - Updates view_count on blog_posts (replaces buggy views_count)
--    - Restricts EXECUTE grants
CREATE OR REPLACE FUNCTION public.record_blog_event(
    p_event_type text,
    p_article_id text DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}',
    p_device text DEFAULT NULL,
    p_referrer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.blog_user_events (
        event_type,
        article_id,
        session_id,
        metadata,
        device,
        referrer
    )
    VALUES (
        p_event_type,
        CASE 
            WHEN p_article_id IS NOT NULL AND p_article_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN p_article_id::uuid 
            ELSE NULL 
        END,
        p_session_id,
        p_metadata,
        p_device,
        p_referrer
    );

    -- Auto-increment view_count on blog_posts table for article_view events
    IF p_event_type = 'article_view' 
       AND p_article_id IS NOT NULL 
       AND p_article_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        UPDATE public.blog_posts
        SET view_count = COALESCE(view_count, 0) + 1
        WHERE id = p_article_id::uuid;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_blog_event(text, text, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_blog_event(text, text, text, jsonb, text, text) TO anon, authenticated, service_role;

-- 3. Fix increment_blog_view RPCs
CREATE OR REPLACE FUNCTION public.increment_blog_view(p_article_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_article_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_blog_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_view(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.increment_blog_view(post_slug text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE slug = post_slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_blog_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_view(text) TO anon, authenticated, service_role;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000003') ON CONFLICT DO NOTHING;

-- Migration: 20260911000004_drop_dead_article_analytics_trigger.sql
-- Migration: Drop dead article_analytics aggregation trigger and function
-- article_analytics has been superseded by canonical blog_user_events.
-- This removes the dead trigger and function that attempted to update the non-existent table.

DROP TRIGGER IF EXISTS trigger_aggregate_blog_analytics ON public.blog_user_events;
DROP FUNCTION IF EXISTS public.aggregate_blog_analytics();


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000004') ON CONFLICT DO NOTHING;

-- Migration: 20260911000005_s1_drop_dead_and_demote_unnecessary_definers.sql
-- Migration S1: Drop dead legacy trigger and demote unnecessary SECURITY DEFINER
-- Part of isolated SECURITY DEFINER function audit & remediation.
--
-- 1. Drop dead legacy unauthenticated telegram notification trigger & function
--    (Superseded by on_lead_insert_webhook_notify / Supabase Database Webhook)
DROP TRIGGER IF EXISTS trg_leads_notify_telegram ON public.leads;
DROP FUNCTION IF EXISTS public.notify_telegram_on_lead_insert();

-- 2. Demote touch_estimator_flow_config from SECURITY DEFINER to SECURITY INVOKER
--    (Function only sets in-memory NEW.updated_at and NEW.updated_by; requires no elevated privileges)
CREATE OR REPLACE FUNCTION public.touch_estimator_flow_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Restrict trigger function execution grants
REVOKE EXECUTE ON FUNCTION public.touch_estimator_flow_config() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_estimator_flow_config() TO authenticated, service_role, postgres;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000005') ON CONFLICT DO NOTHING;

-- Migration: 20260911000006_s2_fix_exposed_rpc_authorization.sql
-- ==============================================================================
-- Migration S2: Fix Privileged RPC Authorization Boundaries & Revoke Public Grants
-- Date: 2026-09-11
-- Target: Resolve critical exposed database RPCs (F-11 & DAM upload authorization)
-- Defense-in-depth: Execution Grant Hardening + Function-Level Authorization Guards
-- ==============================================================================

-- ── 1. get_lead_stats: Restrict to CRM Viewers (super_admin, admin, viewer) ──
-- Prevents anonymous and non-CRM data exposure of lead counts and financial estimates.
CREATE OR REPLACE FUNCTION public.get_lead_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_crm_viewer() THEN
    RAISE EXCEPTION 'Unauthorized: CRM access required';
  END IF;

  SELECT json_build_object(
    'total', count(*),
    'hot', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) >= 70), 0),
    'warm', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) >= 40 AND COALESCE(score, lead_score, 0) < 70), 0),
    'cold', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) < 40), 0),
    'byStatus', coalesce(
      (SELECT json_object_agg(status, cnt)
       FROM (SELECT status::text, count(*) AS cnt FROM public.leads GROUP BY status) s),
      '{}'::json
    ),
    'bySource', coalesce(
      (SELECT json_object_agg(source_name, cnt)
       FROM (SELECT COALESCE(lead_source::text, 'unknown') AS source_name, count(*) AS cnt FROM public.leads GROUP BY lead_source) s),
      '{}'::json
    ),
    'avgResponseTime', 0,
    'estimatorLeads', coalesce(count(*) FILTER (WHERE lead_source = 'estimator'), 0),
    'avgEstimate', coalesce(
      avg(estimated_min) FILTER (WHERE lead_source = 'estimator' AND estimated_min > 0),
      0
    )
  ) INTO result
  FROM public.leads;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_lead_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_lead_stats() TO authenticated, service_role;


-- ── 2. rpc_register_dam_asset: Reconcile Drift & Enforce is_cms_editor ───────
-- Fixes live database drift (live body lacked auth guard) and allows editor role.
CREATE OR REPLACE FUNCTION public.rpc_register_dam_asset(
  p_type public.asset_type_enum,
  p_source public.asset_source_enum,
  p_title text,
  p_file_id text,
  p_url text,
  p_size_bytes bigint,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asset_id uuid;
BEGIN
  -- Authorization guard (super_admin, admin, editor)
  IF NOT public.is_cms_editor() THEN
    RAISE EXCEPTION 'Unauthorized: CMS editor access required';
  END IF;

  -- 1. Create the base asset
  INSERT INTO public.assets (
    type, 
    source, 
    status, 
    title
  ) VALUES (
    p_type, 
    p_source, 
    'ready'::public.asset_status_enum, 
    p_title
  ) RETURNING id INTO v_asset_id;

  -- 2. Create the asset version
  INSERT INTO public.asset_versions (
    asset_id,
    version_number,
    storage_provider,
    file_id,
    url,
    size_bytes,
    mime_type,
    width,
    height
  ) VALUES (
    v_asset_id,
    1,
    'imagekit',
    p_file_id,
    p_url,
    p_size_bytes,
    p_mime_type,
    p_width,
    p_height
  );

  -- 3. Bind the usage if entity provided
  IF p_entity_id IS NOT NULL THEN
    INSERT INTO public.asset_usages (
      asset_id,
      domain,
      entity_type,
      entity_id,
      role,
      is_primary
    ) VALUES (
      v_asset_id,
      p_domain,
      p_entity_type,
      p_entity_id,
      p_role,
      true
    );
  END IF;

  RETURN v_asset_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_register_dam_asset(public.asset_type_enum, public.asset_source_enum, text, text, text, bigint, text, integer, integer, text, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_register_dam_asset(public.asset_type_enum, public.asset_source_enum, text, text, text, bigint, text, integer, integer, text, text, uuid, text) TO authenticated, service_role;


-- ── 2.5 Ensure asset_versions has a UNIQUE constraint for concurrency safety ──
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_asset_versions_asset_id_version'
  ) THEN
    ALTER TABLE public.asset_versions ADD CONSTRAINT uq_asset_versions_asset_id_version UNIQUE(asset_id, version_number);
  END IF;
END $$;


-- ── 3. rpc_create_uploading_asset & rpc_finalize_dam_asset: Align to is_cms_editor ─
-- Functional fix: replaces is_admin_or_editor so editors can upload DAM assets.
CREATE OR REPLACE FUNCTION public.rpc_create_uploading_asset(
  p_type public.asset_type_enum,
  p_source public.asset_source_enum,
  p_title text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asset_id uuid;
BEGIN
  IF NOT public.is_cms_editor() THEN
    RAISE EXCEPTION 'Unauthorized: CMS editor access required';
  END IF;

  INSERT INTO public.assets (
    type, 
    source, 
    status, 
    title
  ) VALUES (
    p_type, 
    p_source, 
    'uploading'::public.asset_status_enum, 
    p_title
  ) RETURNING id INTO v_asset_id;

  RETURN v_asset_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_create_uploading_asset(public.asset_type_enum, public.asset_source_enum, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_create_uploading_asset(public.asset_type_enum, public.asset_source_enum, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.rpc_finalize_dam_asset(
  p_asset_id uuid,
  p_file_id text,
  p_url text,
  p_size_bytes bigint,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_domain text,
  p_entity_type text,
  p_entity_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_cms_editor() THEN
    RAISE EXCEPTION 'Unauthorized: CMS editor access required';
  END IF;

  -- Ensure the asset exists and is in 'uploading' state
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE id = p_asset_id AND status = 'uploading'::public.asset_status_enum) THEN
    RAISE EXCEPTION 'Asset % is not in an uploadable finalization state', p_asset_id;
  END IF;

  -- Ensure no version exists (idempotency/security)
  IF EXISTS (SELECT 1 FROM public.asset_versions WHERE asset_id = p_asset_id) THEN
    RAISE EXCEPTION 'Asset % already has a version', p_asset_id;
  END IF;

  INSERT INTO public.asset_versions (
    asset_id,
    version_number,
    storage_provider,
    file_id,
    url,
    size_bytes,
    mime_type,
    width,
    height
  ) VALUES (
    p_asset_id,
    1,
    'imagekit',
    p_file_id,
    p_url,
    p_size_bytes,
    p_mime_type,
    p_width,
    p_height
  );

  IF p_entity_id IS NOT NULL THEN
    INSERT INTO public.asset_usages (
      asset_id,
      domain,
      entity_type,
      entity_id,
      role,
      is_primary
    ) VALUES (
      p_asset_id,
      p_domain,
      p_entity_type,
      p_entity_id,
      p_role,
      true
    );
  END IF;

  UPDATE public.assets SET status = 'ready'::public.asset_status_enum WHERE id = p_asset_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_finalize_dam_asset(uuid, text, text, bigint, text, integer, integer, text, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_finalize_dam_asset(uuid, text, text, bigint, text, integer, integer, text, text, uuid, text) TO authenticated, service_role;


-- ── 4. update_media_metadata: Dead code removal ───────────────────────────────
-- Audit confirms this function has no consumers in the frontend or edge functions.
DROP FUNCTION IF EXISTS public.update_media_metadata(text, jsonb);


-- ── 5. get_admin_users: Revoke PUBLIC / anon grants ───────────────────────────
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated, service_role;


-- ── 6. increment_project_view: Explicit Telemetry Execution Grants ────────────
REVOKE EXECUTE ON FUNCTION public.increment_project_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_project_view(uuid) TO anon, authenticated, service_role;


-- ── 7. Trigger Procedure Execution Hygiene ─────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.sync_asset_usage_from_url() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_asset_usage_from_url() TO authenticated, service_role, postgres;

REVOKE EXECUTE ON FUNCTION public.sync_asset_usage_from_url_array() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_asset_usage_from_url_array() TO authenticated, service_role, postgres;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000006') ON CONFLICT DO NOTHING;

-- Migration: 20260911000007_s3_harden_search_path.sql
-- ==============================================================================
-- Migration S3: Harden Remaining SECURITY DEFINER Functions with search_path = ''
-- Date: 2026-09-11
-- Target: Complete Phase S3 Search-Path Hardening Sweep
-- Defense-in-depth: Set search_path = '' and fully schema-qualify all relations
-- ==============================================================================

-- ── 1. RLS Helpers ────────────────────────────────────────────────────────────

-- 1.1 has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 1.2 is_crm_viewer
CREATE OR REPLACE FUNCTION public.is_crm_viewer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('super_admin', 'admin', 'viewer')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_crm_viewer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_crm_viewer() TO anon, authenticated, service_role;

-- 1.3 is_cms_editor
CREATE OR REPLACE FUNCTION public.is_cms_editor()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('super_admin', 'admin', 'editor')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_cms_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_cms_editor() TO anon, authenticated, service_role;

-- 1.4 is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('super_admin', 'admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO anon, authenticated, service_role;

-- 1.5 is_platform_admin_by_id
CREATE OR REPLACE FUNCTION public.is_platform_admin_by_id(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('super_admin', 'admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin_by_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin_by_id(uuid) TO anon, authenticated, service_role;

-- 1.6 is_admin_or_editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('super_admin', 'admin', 'editor')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) TO anon, authenticated, service_role;

-- 1.7 is_admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid
      AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;


-- ── 2. Public Telemetry Functions ─────────────────────────────────────────────

-- 2.1 record_blog_event
CREATE OR REPLACE FUNCTION public.record_blog_event(
  p_event_type text, 
  p_article_id text DEFAULT NULL::text, 
  p_session_id text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb, 
  p_device text DEFAULT NULL::text, 
  p_referrer text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.blog_user_events (
        event_type,
        article_id,
        session_id,
        metadata,
        device,
        referrer
    )
    VALUES (
        p_event_type,
        CASE 
            WHEN p_article_id IS NOT NULL AND p_article_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN p_article_id::uuid 
            ELSE NULL 
        END,
        p_session_id,
        p_metadata,
        p_device,
        p_referrer
    );

    -- Auto-increment view_count on blog_posts table for article_view events
    IF p_event_type = 'article_view' 
       AND p_article_id IS NOT NULL 
       AND p_article_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        UPDATE public.blog_posts
        SET view_count = COALESCE(view_count, 0) + 1
        WHERE id = p_article_id::uuid;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_blog_event(text, text, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_blog_event(text, text, text, jsonb, text, text) TO anon, authenticated, service_role;

-- 2.2 increment_blog_view(uuid)
CREATE OR REPLACE FUNCTION public.increment_blog_view(p_article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_article_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_blog_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_view(uuid) TO anon, authenticated, service_role;

-- 2.3 increment_blog_view(text)
CREATE OR REPLACE FUNCTION public.increment_blog_view(post_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE slug = post_slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_blog_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_view(text) TO anon, authenticated, service_role;

-- 2.4 increment_project_view(uuid)
CREATE OR REPLACE FUNCTION public.increment_project_view(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.projects
  SET views = views + 1
  WHERE id = project_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_project_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_project_view(uuid) TO anon, authenticated, service_role;


-- ── 3. Internal Triggers ──────────────────────────────────────────────────────

-- 3.1 sync_asset_usage_from_url
CREATE OR REPLACE FUNCTION public.sync_asset_usage_from_url()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asset_id uuid;
  v_old_url text;
  v_new_url text;
  v_entity_type text;
  v_role text;
  v_domain text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_url USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_url USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  -- If URL changed or is new
  IF TG_OP = 'INSERT' OR v_old_url IS DISTINCT FROM v_new_url THEN
    -- Remove old usage if exists
    IF v_old_url IS NOT NULL AND v_old_url != '' THEN
      DELETE FROM public.asset_usages 
      WHERE entity_id = NEW.id 
      AND entity_type = v_entity_type 
      AND role = v_role;
    END IF;

    -- Add new usage
    IF v_new_url IS NOT NULL AND v_new_url != '' THEN
      SELECT asset_id INTO v_asset_id 
      FROM public.asset_versions 
      WHERE url = v_new_url 
      ORDER BY created_at DESC 
      LIMIT 1;

      IF v_asset_id IS NOT NULL THEN
        -- Check if it already exists to avoid duplicates
        SELECT id INTO v_existing_usage_id 
        FROM public.asset_usages 
        WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
        
        IF v_existing_usage_id IS NULL THEN
          INSERT INTO public.asset_usages (
            asset_id,
            domain,
            entity_type,
            entity_id,
            role,
            is_primary
          ) VALUES (
            v_asset_id,
            v_domain,
            v_entity_type,
            NEW.id,
            v_role,
            true
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_asset_usage_from_url() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_asset_usage_from_url() TO authenticated, service_role, postgres;

-- 3.2 sync_asset_usage_from_url_array
CREATE OR REPLACE FUNCTION public.sync_asset_usage_from_url_array()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asset_id uuid;
  v_old_urls text[];
  v_new_urls text[];
  v_entity_type text;
  v_role text;
  v_domain text;
  v_url text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_urls USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_urls USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  IF TG_OP = 'INSERT' OR v_old_urls IS DISTINCT FROM v_new_urls THEN
    -- Delete all existing usages for this array role
    DELETE FROM public.asset_usages 
    WHERE entity_id = NEW.id 
    AND entity_type = v_entity_type 
    AND role = v_role;

    -- Add new usages
    IF v_new_urls IS NOT NULL THEN
      FOREACH v_url IN ARRAY v_new_urls
      LOOP
        IF v_url IS NOT NULL AND v_url != '' THEN
          SELECT asset_id INTO v_asset_id 
          FROM public.asset_versions 
          WHERE url = v_url 
          ORDER BY created_at DESC 
          LIMIT 1;

          IF v_asset_id IS NOT NULL THEN
            SELECT id INTO v_existing_usage_id 
            FROM public.asset_usages 
            WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
            
            IF v_existing_usage_id IS NULL THEN
              INSERT INTO public.asset_usages (
                asset_id,
                domain,
                entity_type,
                entity_id,
                role,
                is_primary
              ) VALUES (
                v_asset_id,
                v_domain,
                v_entity_type,
                NEW.id,
                v_role,
                false
              );
            END IF;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_asset_usage_from_url_array() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_asset_usage_from_url_array() TO authenticated, service_role, postgres;

-- 3.3 handle_lead_webhook_notify
CREATE OR REPLACE FUNCTION public.handle_lead_webhook_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/notify-telegram',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer 0c69b4d9c5f7e5a3f4a73ffe594e65e7271eab36564b3f18f033418f2a098024"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', row_to_json(NEW),
      'schema', 'public'
    )
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_lead_webhook_notify() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_lead_webhook_notify() TO authenticated, service_role, postgres;


-- ── 4. Admin Query Functions ──────────────────────────────────────────────────

-- 4.1 get_admin_users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  avatar_url text, 
  email text, 
  last_sign_in_at timestamp with time zone, 
  created_at timestamp with time zone, 
  role public.app_role, 
  status text, 
  deleted_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE 
  caller_role public.app_role;
BEGIN
    SELECT ur.role INTO caller_role FROM public.user_roles ur WHERE ur.user_id = auth.uid() LIMIT 1;
    IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    RETURN QUERY
    SELECT au.id, p.full_name, p.avatar_url, au.email::text,
           au.last_sign_in_at, COALESCE(p.created_at, au.created_at),
           COALESCE(ur.role, 'viewer'::public.app_role),
           CASE
               WHEN p.deleted_at IS NOT NULL THEN 'deleted'
               WHEN COALESCE(p.status, 'active') = 'inactive' THEN 'inactive'
               WHEN au.banned_until IS NOT NULL AND au.banned_until > now() THEN 'inactive'
               ELSE 'active'
           END::text,
           p.deleted_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id
    ORDER BY au.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated, service_role;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260911000007') ON CONFLICT DO NOTHING;

-- Migration: 20260915000000_def001_upsert_service_drop_icon_url.sql
-- Migration: DEF-001 — upsert_service must stop writing services.icon_url
-- Context:
--   20260622000002_dam_v3_migration.sql renamed services.icon_url -> deprecated_icon_url
--   and moved service icons into asset_usages (domain 'Services', entity_type 'service', role 'icon').
--   upsert_service (20260514000000) still wrote icon_url, so every Services CMS create/edit failed
--   with 42703 "column services.icon_url does not exist".
-- Fix:
--   Same parameter names/types (PostgREST resolution unchanged); p_icon_url is now DEFAULT NULL and
--   ignored so old and new clients coexist. Media binding is the client's job via asset_usages (ADR 0002).
--   Also applies the S2/S3 hardening pattern: search_path = '' and EXECUTE revoked from anon/PUBLIC.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure::text AS sig
        FROM pg_proc
        WHERE proname = 'upsert_service'
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION ' || r.sig;
    END LOOP;
END
$$;

CREATE OR REPLACE FUNCTION public.upsert_service(
    p_service_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_description JSONB,
    p_icon_url TEXT DEFAULT NULL,   -- deprecated: accepted and ignored (DEF-001 / ADR 0002)
    p_short_tag TEXT DEFAULT NULL,
    p_display_order INT DEFAULT 1,
    p_active BOOLEAN DEFAULT TRUE,
    p_steps JSONB DEFAULT '[]'::jsonb,
    p_faqs JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_service_id UUID;
    v_step JSONB;
    v_faq JSONB;
BEGIN
    -- Verify editor permissions
    IF NOT public.is_cms_editor() THEN
        RAISE EXCEPTION 'Access denied. Must be CMS editor.';
    END IF;

    -- Upsert Service (icon lives in asset_usages, never on this row)
    IF p_service_id IS NOT NULL THEN
        UPDATE public.services
        SET name = p_name,
            slug = p_slug,
            description = p_description,
            short_tag = p_short_tag,
            active = p_active
            -- intentionally preserving existing display_order on update
        WHERE id = p_service_id
        RETURNING id INTO v_service_id;

        IF v_service_id IS NULL THEN
            RAISE EXCEPTION 'Service not found';
        END IF;
    ELSE
        INSERT INTO public.services (
            name, slug, description, short_tag, display_order, active
        ) VALUES (
            p_name, p_slug, p_description, p_short_tag, p_display_order, p_active
        )
        RETURNING id INTO v_service_id;
    END IF;

    -- Upsert Steps (replace all)
    DELETE FROM public.service_steps WHERE service_id = v_service_id;
    IF p_steps IS NOT NULL AND jsonb_array_length(p_steps) > 0 THEN
        FOR v_step IN SELECT * FROM jsonb_array_elements(p_steps) LOOP
            INSERT INTO public.service_steps (service_id, step_number, title, description)
            VALUES (
                v_service_id,
                (v_step->>'step_number')::INT,
                v_step->>'title',
                v_step->>'description'
            );
        END LOOP;
    END IF;

    -- Upsert FAQs (replace all)
    DELETE FROM public.service_faqs WHERE service_id = v_service_id;
    IF p_faqs IS NOT NULL AND jsonb_array_length(p_faqs) > 0 THEN
        FOR v_faq IN SELECT * FROM jsonb_array_elements(p_faqs) LOOP
            INSERT INTO public.service_faqs (service_id, display_order, question, answer)
            VALUES (
                v_service_id,
                (v_faq->>'display_order')::INT,
                v_faq->>'question',
                v_faq->>'answer'
            );
        END LOOP;
    END IF;

    RETURN v_service_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_service FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_service TO authenticated, service_role;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260915000000') ON CONFLICT DO NOTHING;

-- Migration: 20260921000000_f07_auth_rate_limit.sql
-- Migration: F-07 — rate limiting for /api/auth/login
-- Context:
--   POST /api/auth/login had no throttling: 12 rapid bad-password attempts all returned 401, never 429.
--   supabase/functions/rate_limiter/index.ts exists but is a Deno edge function, unreachable from the
--   Node/Vercel serverless handlers under apps/web/api/auth/, and an in-memory counter would not survive
--   across serverless invocations anyway.
-- Fix:
--   A small DB-backed sliding-window counter, following the same shape already used for lead-form spam
--   protection (check_estimate_lead_rate_limit / check_lead_rate_limit in
--   20260311000002_estimate_rates_and_limits.sql): count rows for an identifier within a window, block if
--   over. Called once per email and once per IP from login.ts via the anon-keyed client — no service-role
--   dependency, so it works in every environment. The function prunes its own identifier's expired rows
--   before counting, so the table stays bounded without a cron job.

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_identifier_created_at_idx
    ON public.auth_rate_limits (identifier, created_at);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER function below touches this table. No direct grants to any role.

CREATE OR REPLACE FUNCTION public.check_and_record_auth_attempt(
    p_identifier TEXT,
    p_max_attempts INT,
    p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count INT;
BEGIN
    -- Prune this identifier's expired rows so the table doesn't grow unbounded.
    DELETE FROM public.auth_rate_limits
    WHERE identifier = p_identifier
      AND created_at <= now() - make_interval(secs => p_window_seconds);

    SELECT count(*) INTO v_count
    FROM public.auth_rate_limits
    WHERE identifier = p_identifier
      AND created_at > now() - make_interval(secs => p_window_seconds);

    IF v_count >= p_max_attempts THEN
        RETURN FALSE; -- blocked; do not record another attempt
    END IF;

    INSERT INTO public.auth_rate_limits (identifier) VALUES (p_identifier);
    RETURN TRUE; -- allowed
END;
$$;

-- Safe to expose to anon: it only increments/reads counters keyed by caller-supplied identifiers and
-- cannot read or write anything else. login.ts calls this with the anon key (no service-role dependency).
REVOKE EXECUTE ON FUNCTION public.check_and_record_auth_attempt(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_record_auth_attempt(text, int, int) TO anon, authenticated, service_role;


INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260921000000') ON CONFLICT DO NOTHING;

