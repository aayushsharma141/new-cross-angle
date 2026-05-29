-- 20241006_estimate_leads_generated_cols.sql
-- Replace manually maintained estimate_total_min/max with GENERATED ALWAYS columns
-- Step 1: Drop old columns (preserves data integrity, values are recomputed)
ALTER TABLE public.estimate_leads DROP COLUMN IF EXISTS estimate_total_min,
    DROP COLUMN IF EXISTS estimate_total_max;
-- Step 2: Add GENERATED ALWAYS columns
-- Rates: standard=$150/sqft, premium=$300/sqft, luxury=$600/sqft
-- Max is 20% buffer over min
ALTER TABLE public.estimate_leads
ADD COLUMN estimate_total_min integer GENERATED ALWAYS AS (
        COALESCE(area, 0) * CASE
            WHEN design_package ILIKE '%standard%' THEN 150
            WHEN design_package ILIKE '%premium%' THEN 300
            WHEN design_package ILIKE '%luxury%' THEN 600
            ELSE 0
        END
    ) STORED,
    ADD COLUMN estimate_total_max integer GENERATED ALWAYS AS (
        (
            COALESCE(area, 0) * CASE
                WHEN design_package ILIKE '%standard%' THEN 150
                WHEN design_package ILIKE '%premium%' THEN 300
                WHEN design_package ILIKE '%luxury%' THEN 600
                ELSE 0
            END
        ) * 1.2
    ) STORED;
-- Step 3: Enforce status default at the DB level
ALTER TABLE public.estimate_leads
ALTER COLUMN status
SET DEFAULT 'new';
-- Step 4: Enforce status = 'new' on INSERT via a trigger (blocks client tampering)
CREATE OR REPLACE FUNCTION public.trg_estimate_leads_enforce_status() RETURNS trigger AS $$ BEGIN IF TG_OP = 'INSERT' THEN NEW.status := 'new';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_estimate_leads_status ON public.estimate_leads;
CREATE TRIGGER trg_estimate_leads_status BEFORE
INSERT ON public.estimate_leads FOR EACH ROW EXECUTE FUNCTION public.trg_estimate_leads_enforce_status();