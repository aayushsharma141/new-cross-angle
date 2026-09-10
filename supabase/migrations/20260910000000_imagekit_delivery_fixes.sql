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
