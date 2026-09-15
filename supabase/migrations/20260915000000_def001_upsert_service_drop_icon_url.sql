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
