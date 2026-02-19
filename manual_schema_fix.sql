-- Manual Schema Fix Script (v2 - Complete)
-- Run this in Supabase Dashboard SQL Editor to ensure schema is fully aligned with Frontend

-- ==========================================
-- 1. Estimate Leads Table (Enhanced)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.estimate_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    city_tier TEXT,            -- Added
    state TEXT,                -- Added
    property_type TEXT,        -- Added
    area INTEGER,
    budget TEXT,
    design_package TEXT,
    timeline TEXT,
    scopes TEXT[],             -- Added (Array of strings)
    site_visits INTEGER DEFAULT 0, -- Added
    estimate_breakdown JSONB DEFAULT '{}'::jsonb, -- Added
    estimate_total_min INTEGER,
    estimate_total_max INTEGER,
    lead_score INTEGER,
    lead_category TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,                -- Added
    admin_notes TEXT,          -- Added
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already existed but was incomplete
DO $$ 
BEGIN 
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS city_tier TEXT;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS property_type TEXT;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS scopes TEXT[];
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS site_visits INTEGER DEFAULT 0;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS estimate_breakdown JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.estimate_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT;
END $$;

-- Policies for estimate_leads
ALTER TABLE public.estimate_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin all estimate_leads" ON public.estimate_leads;
CREATE POLICY "Admin all estimate_leads" ON public.estimate_leads FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public insert estimate_leads" ON public.estimate_leads;
CREATE POLICY "Public insert estimate_leads" ON public.estimate_leads FOR INSERT WITH CHECK (true);

-- ==========================================
-- 2. Leads Table Refinement
-- ==========================================
-- Ensure 'leads' table exists (renamed from inquiries or created status)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    service TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    -- Add status if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
        ALTER TABLE public.leads ADD COLUMN status TEXT DEFAULT 'new';
    END IF;

    -- Add Enums types safely
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source_enum') THEN
        CREATE TYPE lead_source_enum AS ENUM ('website_contact', 'estimator', 'style_quiz', 'whatsapp', 'instagram', 'referral', 'other');
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_source') THEN
        ALTER TABLE public.leads ADD COLUMN lead_source lead_source_enum;
    END IF;

    -- Add validation columns if missing
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority TEXT;
END $$;

-- ==========================================
-- 3. Lead Activities Table (Restored)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  performed_by uuid REFERENCES auth.users(id), -- Direct ref to auth.users if profiles missing
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and editors can view lead activities" ON public.lead_activities;
CREATE POLICY "Admins and editors can view lead activities" ON public.lead_activities
  FOR SELECT TO authenticated USING (true); -- Simplified for immediate access

DROP POLICY IF EXISTS "Admins and editors can insert lead activities" ON public.lead_activities;
CREATE POLICY "Admins and editors can insert lead activities" ON public.lead_activities
  FOR INSERT TO authenticated WITH CHECK (true);