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
