-- Add city_tier to estimate_leads
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS city_tier TEXT;
-- Ensure team_members exists (it should be in blueprint, but enforcing here just in case)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    email TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read team_members" ON public.team_members FOR
SELECT USING (true);
CREATE POLICY "Admin all team_members" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');