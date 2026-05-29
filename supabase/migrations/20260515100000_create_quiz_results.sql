-- quiz_results: stores shareable quiz results with unique slugs
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    archetype TEXT NOT NULL,
    scores JSONB NOT NULL,
    signals JSONB,
    ai_result JSONB,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX idx_quiz_results_slug ON public.quiz_results(slug);

-- RLS: anyone can read by slug, only service role can insert
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read quiz results" ON public.quiz_results
    FOR SELECT USING (true);

CREATE POLICY "Service role insert quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (true);
