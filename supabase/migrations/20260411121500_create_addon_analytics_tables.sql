CREATE TABLE IF NOT EXISTS public.addon_sessions (
    id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mode TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    archetype TEXT,
    total_seconds INTEGER,
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.addon_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert addon_sessions" ON public.addon_sessions;
CREATE POLICY "Public can insert addon_sessions" ON public.addon_sessions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update addon_sessions" ON public.addon_sessions;
CREATE POLICY "Public can update addon_sessions" ON public.addon_sessions FOR UPDATE TO anon USING (true);


CREATE TABLE IF NOT EXISTS public.addon_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.addon_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert addon_events" ON public.addon_events;
CREATE POLICY "Public can insert addon_events" ON public.addon_events FOR INSERT TO anon WITH CHECK (true);
