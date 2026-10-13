-- Migration: Schedule sync-posthog-reporting via pg_cron
--
-- Why: nothing in the repo scheduled this function, so analytics_reporting_daily
-- (read by Blog, Discovery and Traffic admin pages) only refreshed if someone had
-- configured a cron by hand in the Dashboard. This makes the schedule explicit.
--
-- The function syncs "yesterday (UTC)" by default, so it runs shortly after
-- midnight UTC. 01:30 UTC = 07:00 IST.
--
-- Before applying: check the Dashboard (Database > Cron) for an existing job that
-- calls sync-posthog-reporting. This migration unschedules its own job name first,
-- but it will not remove a differently-named job created by hand.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

GRANT USAGE ON SCHEMA cron TO SERVICE_ROLE;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA cron TO SERVICE_ROLE;

SELECT cron.unschedule('sync-posthog-reporting-daily')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'sync-posthog-reporting-daily'
);

SELECT cron.schedule(
    'sync-posthog-reporting-daily',
    '30 1 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/sync-posthog-reporting',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
            'cron_run', true,
            'timestamp', now()::text
        )
    );
    $$
);
