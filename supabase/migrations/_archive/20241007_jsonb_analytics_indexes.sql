-- 20241007_jsonb_analytics_indexes.sql
-- Create analytics_events table and add expression indexes on frequently queried JSONB keys
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    payload jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
-- Create a default partition so inserts don't fail immediately
CREATE TABLE IF NOT EXISTS public.analytics_events_default PARTITION OF public.analytics_events DEFAULT;
-- Index on the 'action' key within the payload
CREATE INDEX IF NOT EXISTS idx_analytics_event_action ON public.analytics_events ((payload->>'action'));
-- Index on user_id for per-user activity lookups
CREATE INDEX IF NOT EXISTS idx_analytics_event_user ON public.analytics_events (user_id);
-- Optional: Index on event_type and occurred_at for time-series aggregation
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_time ON public.analytics_events (event_type, occurred_at DESC);