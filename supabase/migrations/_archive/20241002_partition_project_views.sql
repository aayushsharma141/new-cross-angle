-- 20241002_partition_project_views.sql
-- Partition project_views by month (range partitioning)
-- Create parent table if not exists (should already exist)
CREATE TABLE IF NOT EXISTS public.project_views (
    id uuid DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id),
    session_hash text NOT NULL,
    viewed_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (id, viewed_at)
) PARTITION BY RANGE (viewed_at);
-- Create partitions for the next 12 months (example)
DO $$
DECLARE start_date date := date_trunc('month', current_date);
i integer;
BEGIN FOR i IN 0..11 LOOP EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.project_views_%s PARTITION OF public.project_views FOR VALUES FROM (%L) TO (%L);',
    to_char(start_date + (i * interval '1 month'), 'YYYY_MM'),
    (start_date + (i * interval '1 month'))::date,
    (start_date + ((i + 1) * interval '1 month'))::date
);
END LOOP;
END $$;
-- Index on each partition (optional, inherits from parent)
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views (project_id, viewed_at);