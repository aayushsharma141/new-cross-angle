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
