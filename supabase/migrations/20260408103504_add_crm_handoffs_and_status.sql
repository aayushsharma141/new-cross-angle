-- Add new statuses to existing enum
ALTER TYPE lead_status_enum ADD VALUE IF NOT EXISTS 'consultation_scheduled';
ALTER TYPE lead_status_enum ADD VALUE IF NOT EXISTS 'proposal_sent';
ALTER TYPE lead_status_enum ADD VALUE IF NOT EXISTS 'final_review';

-- Create loss_reason_enum
DO $$ BEGIN
    CREATE TYPE loss_reason_enum AS ENUM (
        'no_budget',
        'out_of_area',
        'no_response',
        'not_ready',
        'lost_to_competitor',
        'scope_mismatch',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new fields to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS loss_reason loss_reason_enum,
ADD COLUMN IF NOT EXISTS scope text,
ADD COLUMN IF NOT EXISTS timeline text;

-- Create crm_handoffs table
CREATE TABLE IF NOT EXISTS public.crm_handoffs (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    budget text,
    budget_value_inr numeric,
    scope text,
    city text,
    timeline text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    updated_at timestamp with time zone default timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_handoffs_lead_id ON public.crm_handoffs(lead_id);

-- Enable RLS
ALTER TABLE public.crm_handoffs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow editors to manage crm_handoffs"
        ON public.crm_handoffs
        FOR ALL
        TO authenticated
        USING (is_admin_or_editor(auth.uid()))
        WITH CHECK (is_admin_or_editor(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
