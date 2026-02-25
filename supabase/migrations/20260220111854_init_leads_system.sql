-- Create leads_master table
CREATE TABLE IF NOT EXISTS public.leads_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    source TEXT,
    consent BOOLEAN DEFAULT FALSE,
    archetype TEXT,
    investment_tier TEXT,
    project_type TEXT,
    estimated_min INTEGER,
    estimated_max INTEGER,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new'
);
-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_master_email ON public.leads_master(email);
CREATE INDEX IF NOT EXISTS idx_leads_master_created_at ON public.leads_master(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_master_status ON public.leads_master(status);
-- Create raw_payload table containing the full JSON submission for deep analysis
CREATE TABLE IF NOT EXISTS public.raw_payload (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads_master(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Index the JSONB, foreign key, and timestamp for auditing
CREATE INDEX IF NOT EXISTS idx_raw_payload_lead_id ON public.raw_payload(lead_id);
CREATE INDEX IF NOT EXISTS idx_raw_payload_payload ON public.raw_payload USING GIN (payload);
CREATE INDEX IF NOT EXISTS idx_raw_payload_created_at ON public.raw_payload(created_at);
-- Enable Row Level Security (RLS)
ALTER TABLE public.leads_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_payload ENABLE ROW LEVEL SECURITY;
-- Security Policies 
-- We assume backend API edge functions will use the service_role key to bypass RLS for inserts
-- We allow authenticated admins full read access.
CREATE POLICY "Enable read for authenticated users only" ON public.leads_master FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for authenticated users only" ON public.leads_master FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.leads_master FOR DELETE TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users only" ON public.raw_payload FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.raw_payload FOR DELETE TO authenticated USING (true);