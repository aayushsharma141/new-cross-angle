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
