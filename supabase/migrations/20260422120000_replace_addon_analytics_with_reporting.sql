-- 1. Drop Legacy Analytics Tables (from Task 7) --
DROP TABLE IF EXISTS addon_events CASCADE;
DROP TABLE IF EXISTS addon_sessions CASCADE;

-- 2. Create the analytics_reporting_daily table (from Task 6) --
CREATE TABLE IF NOT EXISTS public.analytics_reporting_daily (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    module_name text NOT NULL, -- e.g., 'discovery', 'estimator'
    metric_name text NOT NULL, -- e.g., 'total_views', 'completion_rate'
    metric_value numeric NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(date, module_name, metric_name)
);

-- Turn on row level security for the new table --
ALTER TABLE public.analytics_reporting_daily ENABLE ROW LEVEL SECURITY;

-- Create an RLS policy that allows only authenticated admins/super_admins to read the reporting data --
CREATE POLICY "Admins can view reporting data"
    ON public.analytics_reporting_daily
    FOR SELECT
    TO authenticated
    USING (public.is_admin_or_editor(auth.uid()));

-- Create an RLS policy that allows ONLY the service role (Edge Function) to insert data --
-- (Service role bypasses RLS by default, but to be explicit it's good practice)
-- Actually, service_role bypasses RLS, so no INSERT policy needed for authenticated users.

-- Create trigger to automatically update the updated_at timestamp --
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_analytics_reporting_daily_updated_at
BEFORE UPDATE ON public.analytics_reporting_daily
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Grand permissions
GRANT SELECT ON public.analytics_reporting_daily TO authenticated;
