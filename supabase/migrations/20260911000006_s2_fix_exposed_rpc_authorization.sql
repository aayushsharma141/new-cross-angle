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


-- ── 4. update_media_metadata: Guard Storage Metadata Updates ──────────────────
CREATE OR REPLACE FUNCTION public.update_media_metadata(file_path text, new_metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _bucket_id text := 'media';
BEGIN
  IF NOT public.is_cms_editor() THEN
    RAISE EXCEPTION 'Unauthorized: CMS editor access required';
  END IF;

  UPDATE storage.objects
  SET metadata = metadata || new_metadata
  WHERE bucket_id = _bucket_id
    AND name = file_path;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_media_metadata(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_media_metadata(text, jsonb) TO authenticated, service_role;


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
