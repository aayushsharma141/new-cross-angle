-- Fix record_blog_event RPC to target public.blog_posts instead of public.blogs
CREATE OR REPLACE FUNCTION public.record_blog_event(
    p_event_type text,
    p_article_id text DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}',
    p_device text DEFAULT NULL,
    p_referrer text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ 
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
        p_article_id,
        p_session_id,
        p_metadata,
        p_device,
        p_referrer
    );

    -- Auto-increment views_count on blog_posts table for article_view events
    IF p_event_type = 'article_view' AND p_article_id IS NOT NULL THEN
        UPDATE public.blog_posts
        SET views_count = COALESCE(views_count, 0) + 1
        WHERE id = p_article_id::uuid;
    END IF;
END;
$$;

-- Create missing increment_blog_view RPC
CREATE OR REPLACE FUNCTION public.increment_blog_view(p_article_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.blog_posts
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_article_id;
END;
$$;

-- Create function to aggregate blog_user_events into article_analytics table
CREATE OR REPLACE FUNCTION public.aggregate_blog_analytics()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Check if it's an article view to update analytics
    IF NEW.event_type = 'article_view' AND NEW.article_id IS NOT NULL THEN
        UPDATE public.article_analytics
        SET views = views + 1, updated_at = now()
        WHERE article_id = NEW.article_id;
        
        IF NOT FOUND THEN
            INSERT INTO public.article_analytics (article_id, views, unique_views)
            VALUES (NEW.article_id, 1, 1);
        END IF;
    ELSIF NEW.event_type = 'reading_time' AND NEW.article_id IS NOT NULL THEN
        NULL;
    ELSIF NEW.event_type = 'cta_click' AND NEW.article_id IS NOT NULL THEN
        UPDATE public.article_analytics
        SET cta_clicks = COALESCE(cta_clicks, 0) + 1, updated_at = now()
        WHERE article_id = NEW.article_id;
        
        IF NOT FOUND THEN
            INSERT INTO public.article_analytics (article_id, cta_clicks)
            VALUES (NEW.article_id, 1);
        END IF;
    ELSIF NEW.event_type = 'share_click' AND NEW.article_id IS NOT NULL THEN
        UPDATE public.article_analytics
        SET shares = COALESCE(shares, 0) + 1, updated_at = now()
        WHERE article_id = NEW.article_id;
        
        IF NOT FOUND THEN
            INSERT INTO public.article_analytics (article_id, shares)
            VALUES (NEW.article_id, 1);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on blog_user_events
DROP TRIGGER IF EXISTS trigger_aggregate_blog_analytics ON public.blog_user_events;
CREATE TRIGGER trigger_aggregate_blog_analytics
AFTER INSERT ON public.blog_user_events
FOR EACH ROW EXECUTE FUNCTION public.aggregate_blog_analytics();
