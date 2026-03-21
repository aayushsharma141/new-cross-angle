-- Migration to handle estimate_rates config table and insert rate limiting
-- 1. Create or verify estimate_rates table
CREATE TABLE IF NOT EXISTS public.estimate_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.estimate_rates ENABLE ROW LEVEL SECURITY;
-- Allow anonymous users to READ the latest rates so the frontend can preview prices instantly
DROP POLICY IF EXISTS "Public can read estimate rates" ON public.estimate_rates;
CREATE POLICY "Public can read estimate rates" ON public.estimate_rates FOR
SELECT TO anon USING (true);
-- Allow authenticated users (admins) full access
DROP POLICY IF EXISTS "Admins can update estimate rates" ON public.estimate_rates;
CREATE POLICY "Admins can update estimate rates" ON public.estimate_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 2. Prevent spam on the estimate_leads table (Audit Issue #9)
-- Limits identical emails to 5 estimate requests per 15 minutes.
CREATE OR REPLACE FUNCTION public.check_estimate_lead_rate_limit() RETURNS TRIGGER AS $$
DECLARE recent_count INTEGER;
BEGIN -- Check how many requests this email made in the last 15 minutes
SELECT count(*) INTO recent_count
FROM public.estimate_leads
WHERE email = NEW.email
    AND created_at > (NOW() - INTERVAL '15 minutes');
IF recent_count >= 5 THEN RAISE EXCEPTION 'Rate limit exceeded: Too many estimates generated for this email. Please try again later.';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS enforce_estimate_lead_rate_limit ON public.estimate_leads;
CREATE TRIGGER enforce_estimate_lead_rate_limit BEFORE
INSERT ON public.estimate_leads FOR EACH ROW EXECUTE FUNCTION public.check_estimate_lead_rate_limit();
-- 3. Prevent spam on the main leads table (Added security)
CREATE OR REPLACE FUNCTION public.check_lead_rate_limit() RETURNS TRIGGER AS $$
DECLARE recent_count INTEGER;
BEGIN
SELECT count(*) INTO recent_count
FROM public.leads
WHERE email = NEW.email
    AND created_at > (NOW() - INTERVAL '15 minutes');
IF recent_count >= 5 THEN RAISE EXCEPTION 'Rate limit exceeded: Too many leads generated for this email. Please try again later.';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS enforce_lead_rate_limit ON public.leads;
CREATE TRIGGER enforce_lead_rate_limit BEFORE
INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.check_lead_rate_limit();