-- Create content_analytics table
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'blog', 'project', 'service'
    content_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- 'view', 'read', 'share'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can view analytics
CREATE POLICY "Admins can view analytics" ON public.content_analytics
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Anyone can insert analytics (for tracking public views)
-- Be careful with this, maybe rate limit or rely on edge function.
-- For now, allow public insert for 'view' events?
CREATE POLICY "Anyone can insert analytics" ON public.content_analytics
    FOR INSERT WITH CHECK (true);

-- Add simple counters to blogs for quick access (optional but useful)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS read_time_minutes INTEGER DEFAULT 5; -- Default estimation
