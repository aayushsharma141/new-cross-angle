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
