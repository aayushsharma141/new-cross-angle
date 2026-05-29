-- Migration: Add transactional RPC for upserting services
-- Purpose: Atomically update/insert services and their related steps and FAQs.

CREATE OR REPLACE FUNCTION public.upsert_service(
    p_service_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_description JSONB,
    p_icon_url TEXT,
    p_short_tag TEXT,
    p_display_order INT,
    p_active BOOLEAN,
    p_steps JSONB,
    p_faqs JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
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

    -- Upsert Service
    IF p_service_id IS NOT NULL THEN
        UPDATE public.services
        SET name = p_name,
            slug = p_slug,
            description = p_description,
            icon_url = p_icon_url,
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
            name, slug, description, icon_url, short_tag, display_order, active
        ) VALUES (
            p_name, p_slug, p_description, p_icon_url, p_short_tag, p_display_order, p_active
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

GRANT EXECUTE ON FUNCTION public.upsert_service TO authenticated;
