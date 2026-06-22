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
