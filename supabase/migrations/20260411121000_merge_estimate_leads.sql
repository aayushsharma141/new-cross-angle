-- ================================================================
-- Merge estimate_leads into the unified leads table
-- ================================================================
BEGIN;

-- 1. Add estimator-specific columns to leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS area INTEGER,
  ADD COLUMN IF NOT EXISTS city_tier TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS start_timing TEXT,
  ADD COLUMN IF NOT EXISTS estimate_breakdown JSONB;

-- 2. Migrate any existing estimate_leads rows into leads
INSERT INTO public.leads (
  name, email, phone, city,
  message, source,
  area, city_tier, property_type, state, start_timing,
  estimated_min, estimated_max, lead_score, estimate_breakdown,
  created_at
)
SELECT
  el.name, el.email, el.phone, el.city,
  COALESCE(el.notes, 'Imported from estimate_leads'),
  'website'::public.lead_source,
  el.area, el.city_tier, el.property_type, el.state, el.timeline,
  el.estimate_total_min, el.estimate_total_max, el.lead_score,
  el.estimate_breakdown,
  el.created_at
FROM public.estimate_leads el
ON CONFLICT DO NOTHING;

-- 3. Drop estimate_leads (CASCADE drops RLS policies)
DROP TABLE IF EXISTS public.estimate_leads CASCADE;

-- 4. Source-based index
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

CREATE OR REPLACE FUNCTION public.get_lead_stats()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total', count(*),
    'hot',  coalesce(count(*) FILTER (WHERE coalesce(lead_score,0) >= 70), 0),
    'warm', coalesce(count(*) FILTER (WHERE coalesce(lead_score,0) >= 40 AND coalesce(lead_score,0) < 70), 0),
    'cold', coalesce(count(*) FILTER (WHERE coalesce(lead_score,0) < 40), 0),
    'bySource', coalesce((SELECT json_object_agg(source_name,cnt) FROM (SELECT COALESCE(source::text,'unknown') AS source_name, count(*) AS cnt FROM public.leads GROUP BY source) s),'{}'::json),
    'avgResponseTime', 0,
    'estimatorLeads', coalesce(count(*) FILTER (WHERE source::text = 'website'), 0),
    'avgEstimate', coalesce(avg(estimated_min) FILTER (WHERE source::text = 'website' AND estimated_min > 0), 0)
  ) INTO result FROM public.leads;
  RETURN result;
END; $$;

COMMIT;
