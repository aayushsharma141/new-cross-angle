-- Key function to track analytics
CREATE OR REPLACE FUNCTION public.track_blog_view(blog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Increment the simple counter on the blog itself (for fast retrieval)
    UPDATE public.blogs 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = blog_id;

    -- 2. Log the event for time-series analysis
    INSERT INTO public.content_analytics (
        content_type,
        content_id,
        event_type,
        metadata
    ) VALUES (
        'blog',
        blog_id,
        'view',
        jsonb_build_object('source', 'web')
    );
END;
$$;
