-- Fix Schema Migration
-- 1. Create estimate_leads table (was missing)
CREATE TABLE IF NOT EXISTS public.estimate_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    area INTEGER,
    budget TEXT,
    design_package TEXT,
    timeline TEXT,
    estimate_total_min INTEGER,
    estimate_total_max INTEGER,
    lead_score INTEGER,
    lead_category TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger for estimate_leads updated_at
DROP TRIGGER IF EXISTS update_estimate_leads_updated_at ON public.estimate_leads;
CREATE TRIGGER update_estimate_leads_updated_at BEFORE
UPDATE ON public.estimate_leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS for estimate_leads
ALTER TABLE public.estimate_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all estimate_leads" ON public.estimate_leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert estimate_leads" ON public.estimate_leads FOR
INSERT WITH CHECK (true);
-- 2. Refine leads table (Fix column mismatches)
-- Rename inquiries to leads if inquiries exists (from blueprint)
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'inquiries'
) THEN DROP TABLE IF EXISTS public.leads CASCADE;
ALTER TABLE public.inquiries
    RENAME TO leads;
END IF;
END $$;
-- Rename columns to match Admin UI expectations if they exist with old names
DO $$ BEGIN -- Check if we need to rename submitter_name
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'leads'
        AND column_name = 'submitter_name'
) THEN
ALTER TABLE public.leads
    RENAME COLUMN submitter_name TO name;
END IF;
-- Check if we need to rename service_interest
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'leads'
        AND column_name = 'service_interest'
) THEN
ALTER TABLE public.leads
    RENAME COLUMN service_interest TO service;
END IF;
-- Check if we need to rename submitted_at
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'leads'
        AND column_name = 'submitted_at'
) THEN
ALTER TABLE public.leads
    RENAME COLUMN submitted_at TO created_at;
END IF;
END $$;
-- 3. Create Enums for strict typing (if not exists)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'lead_source_enum'
) THEN CREATE TYPE lead_source_enum AS ENUM (
    'website_contact',
    'estimator',
    'style_quiz',
    'whatsapp',
    'instagram',
    'referral',
    'other'
);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'lead_type_enum'
) THEN CREATE TYPE lead_type_enum AS ENUM (
    'interior',
    'renovation',
    'consultation',
    'commercial'
);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'lead_status_enum'
) THEN CREATE TYPE lead_status_enum AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal',
    'won',
    'lost'
);
END IF;
END $$;
-- 4. Apply Enums and Constraints to leads
-- Note: We cast using ::text first to avoid casting errors if data doesn't match
-- In a real prod env, we'd clean data first. Here we assume loose data or empty.
-- Ensure columns exist before altering
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_type TEXT;
-- Drop default and strict constraints from inquiries before modifying
ALTER TABLE public.leads
ALTER COLUMN status DROP DEFAULT;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_status_check'
) THEN
ALTER TABLE public.leads DROP CONSTRAINT inquiries_status_check;
END IF;
END $$;
-- Update status values to match Enum (proposal_sent -> proposal)
UPDATE public.leads
SET status = 'proposal'
WHERE status = 'proposal_sent';
-- Cast columns to Enums
ALTER TABLE public.leads
ALTER COLUMN lead_source TYPE lead_source_enum USING lead_source::text::lead_source_enum,
    ALTER COLUMN lead_type TYPE lead_type_enum USING lead_type::text::lead_type_enum,
    ALTER COLUMN status TYPE lead_status_enum USING status::text::lead_status_enum;
-- Restore Default for status (using Enum value)
ALTER TABLE public.leads
ALTER COLUMN status
SET DEFAULT 'new'::lead_status_enum;
-- 5. Add Indexes for Dashboard Performance
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_leads_created_at ON public.estimate_leads(created_at DESC);