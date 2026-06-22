-- Migrate leads_master to leads
BEGIN;

-- 1. Add fields to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archetype TEXT,
ADD COLUMN IF NOT EXISTS investment_tier TEXT,
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS estimated_min INTEGER,
ADD COLUMN IF NOT EXISTS estimated_max INTEGER,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

-- 2. Update existing leads that were dual-written
UPDATE public.leads l
SET 
  consent = lm.consent,
  archetype = lm.archetype,
  investment_tier = lm.investment_tier,
  project_type = lm.project_type,
  estimated_min = lm.estimated_min,
  estimated_max = lm.estimated_max,
  lead_score = lm.lead_score
FROM public.leads_master lm
WHERE l.email = lm.email;

-- 3. Insert dangling leads_master rows
INSERT INTO public.leads (
  id, name, email, phone, message, source, consent, archetype, investment_tier, 
  project_type, estimated_min, estimated_max, lead_score, created_at
)
SELECT 
  lm.id, lm.name, lm.email, lm.phone, 
  COALESCE('Imported from leads_master. Archetype: ' || lm.archetype, 'Imported from leads_master'),
  (CASE WHEN lm.source = 'discovery_engine' THEN 'website'::public.lead_source ELSE 'other'::public.lead_source END) as source, 
  lm.consent, lm.archetype, 
  lm.investment_tier, lm.project_type, lm.estimated_min, lm.estimated_max, 
  lm.lead_score, lm.created_at
FROM public.leads_master lm
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads l 
  WHERE l.email = lm.email
)
ON CONFLICT DO NOTHING;

-- 4. Re-link raw_payload to leads
ALTER TABLE public.raw_payload ADD COLUMN new_lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE;

UPDATE public.raw_payload rp
SET new_lead_id = COALESCE(
  (SELECT id FROM public.leads WHERE id = rp.lead_id LIMIT 1)
);

-- Delete any orphaned raw_payloads where new_lead_id is completely null (should not happen, but safe measure)
DELETE FROM public.raw_payload WHERE new_lead_id IS NULL;

ALTER TABLE public.raw_payload DROP CONSTRAINT IF EXISTS raw_payload_lead_id_fkey;
DROP INDEX IF EXISTS idx_raw_payload_lead_id;
ALTER TABLE public.raw_payload DROP COLUMN lead_id;
ALTER TABLE public.raw_payload RENAME COLUMN new_lead_id TO lead_id;
CREATE INDEX idx_raw_payload_lead_id ON public.raw_payload(lead_id);

-- 5. Drop leads_master
DROP TABLE IF EXISTS public.leads_master CASCADE;

COMMIT;
