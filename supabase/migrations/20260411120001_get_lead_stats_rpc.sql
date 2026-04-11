-- Create RPC function to fetch lead stats directly from database
CREATE OR REPLACE FUNCTION public.get_lead_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', count(*),
    'hot', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) >= 70), 0),
    'warm', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) >= 40 AND COALESCE(score, lead_score, 0) < 70), 0),
    'cold', coalesce(count(*) FILTER (WHERE COALESCE(score, lead_score, 0) < 40), 0),
    'byStatus', coalesce((SELECT json_object_agg(status, count) FROM (SELECT status::text, count(*) FROM public.leads GROUP BY status) s), '{}'::json),
    'bySource', coalesce((SELECT json_object_agg(source_name, count) FROM (SELECT COALESCE(lead_source::text, 'unknown') as source_name, count(*) FROM public.leads GROUP BY lead_source) s), '{}'::json),
    'avgResponseTime', 0
  ) INTO result
  FROM public.leads;

  RETURN result;
END;
$$;
