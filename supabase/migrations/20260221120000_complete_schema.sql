-- 20260221_complete_schema.sql
-- Completes the schema by adding missing columns to estimate_leads and restoring lead_activities
-- 1. Enhance estimate_leads
CREATE TABLE IF NOT EXISTS public.estimate_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    city_tier TEXT,
    state TEXT,
    property_type TEXT,
    area INTEGER,
    budget TEXT,
    design_package TEXT,
    timeline TEXT,
    scopes TEXT [],
    site_visits INTEGER DEFAULT 0,
    estimate_breakdown JSONB DEFAULT '{}'::jsonb,
    estimate_total_min INTEGER,
    estimate_total_max INTEGER,
    lead_score INTEGER,
    lead_category TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add missing columns idempotently
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS city_tier TEXT;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS scopes TEXT [];
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS site_visits INTEGER DEFAULT 0;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS estimate_breakdown JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.estimate_leads
ADD COLUMN IF NOT EXISTS admin_notes TEXT;
-- 2. Restore lead_activities
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type text NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    performed_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view activities" ON public.lead_activities;
CREATE POLICY "Admins view activities" ON public.lead_activities FOR
SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins insert activities" ON public.lead_activities;
CREATE POLICY "Admins insert activities" ON public.lead_activities FOR
INSERT TO authenticated WITH CHECK (true);
-- 3. Fix team_members (Aligning Blueprint to Frontend)
DO $$ BEGIN -- Rename full_name -> name
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'full_name'
) THEN
ALTER TABLE public.team_members
    RENAME COLUMN full_name TO name;
END IF;
-- Rename role_title -> role
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'role_title'
) THEN
ALTER TABLE public.team_members
    RENAME COLUMN role_title TO role;
END IF;
-- Rename profile_image_url -> image_url
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'profile_image_url'
) THEN
ALTER TABLE public.team_members
    RENAME COLUMN profile_image_url TO image_url;
END IF;
END $$;
-- Add missing columns to team_members if they don't exist
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'team_members'
) THEN
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS email TEXT;
END IF;
END $$;