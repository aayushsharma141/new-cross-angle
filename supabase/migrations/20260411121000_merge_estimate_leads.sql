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
  name, email, phone, city, budget, service, score, score_details,
  lead_source, message, status,
  area, city_tier, property_type, state, start_timing,
  estimated_min, estimated_max, lead_score, estimate_breakdown,
  internal_notes, created_at
)
SELECT
  el.name, el.email, el.phone, el.city, el.budget,
  el.design_package, el.lead_score, el.estimate_breakdown,
  'estimator'::lead_source_enum,
  COALESCE(el.notes, 'Imported from estimate_leads'),
  CASE WHEN el.status IN ('new','contacted','qualified','lost','won')
    THEN el.status::lead_status_enum ELSE 'new'::lead_status_enum END,
  el.area, el.city_tier, el.property_type, el.state, el.timeline,
  el.estimate_total_min, el.estimate_total_max, el.lead_score,
  el.estimate_breakdown,
  jsonb_build_object('migrated_from','estimate_leads','original_id',el.id,'admin_notes',el.admin_notes),
  el.created_at
FROM public.estimate_leads el
ON CONFLICT DO NOTHING;

-- 3. Drop estimate_leads (CASCADE drops RLS policies)
DROP TABLE IF EXISTS public.estimate_leads CASCADE;

-- 4. Source-based index
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON public.leads(lead_source);

-- 5. Refined get_lead_stats RPC
CREATE OR REPLACE FUNCTION public.get_lead_stats()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total', count(*),
    'hot',  coalesce(count(*) FILTER (WHERE COALESCE(score,lead_score,0) >= 70), 0),
    'warm', coalesce(count(*) FILTER (WHERE COALESCE(score,lead_score,0) >= 40 AND COALESCE(score,lead_score,0) < 70), 0),
    'cold', coalesce(count(*) FILTER (WHERE COALESCE(score,lead_score,0) < 40), 0),
    'byStatus', coalesce((SELECT json_object_agg(status,cnt) FROM (SELECT status::text, count(*) AS cnt FROM public.leads GROUP BY status) s),'{}'::json),
    'bySource', coalesce((SELECT json_object_agg(source_name,cnt) FROM (SELECT COALESCE(lead_source::text,'unknown') AS source_name, count(*) AS cnt FROM public.leads GROUP BY lead_source) s),'{}'::json),
    'avgResponseTime', 0,
    'estimatorLeads', coalesce(count(*) FILTER (WHERE lead_source = 'estimator'), 0),
    'avgEstimate', coalesce(avg(estimated_min) FILTER (WHERE lead_source = 'estimator' AND estimated_min > 0), 0)
  ) INTO result FROM public.leads;
  RETURN result;
END; $$;

COMMIT;
