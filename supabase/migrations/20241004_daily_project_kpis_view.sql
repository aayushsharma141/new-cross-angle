-- 20241004_daily_project_kpis_view.sql
-- Aggregate raw project_views into a materialized view for fast dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_project_kpis AS
SELECT project_id,
    date(viewed_at) AS view_date,
    COUNT(DISTINCT session_hash) AS unique_views,
    COUNT(*) AS total_views
FROM public.project_views
GROUP BY project_id,
    view_date;
-- Allow concurrent refreshes so the view is never locked during refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_project_kpis_pk ON public.daily_project_kpis (project_id, view_date);
-- Schedule refresh via pg_cron (requires pg_cron extension):
-- SELECT cron.schedule('refresh-kpis', '0 3 * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_project_kpis;');