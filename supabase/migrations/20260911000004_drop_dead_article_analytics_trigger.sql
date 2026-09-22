-- Migration: Drop dead article_analytics aggregation trigger and function
-- article_analytics has been superseded by canonical blog_user_events.
-- This removes the dead trigger and function that attempted to update the non-existent table.

DROP TRIGGER IF EXISTS trigger_aggregate_blog_analytics ON public.blog_user_events;
DROP FUNCTION IF EXISTS public.aggregate_blog_analytics();
