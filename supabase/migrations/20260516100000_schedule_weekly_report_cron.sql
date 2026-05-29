-- Migration: Schedule weekly-report-email via pg_cron
-- Run after all table creations are consolidated

-- Ensure pg_cron and pg_net extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ensure service_role has permissions to manage jobs (idempotent)
GRANT USAGE ON SCHEMA cron TO SERVICE_ROLE;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA cron TO SERVICE_ROLE;

-- Safely unschedule existing job to prevent multiple executions if rerun
SELECT cron.unschedule('weekly-report-email-every-monday')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'weekly-report-email-every-monday'
);

-- Schedule weekly email report for every Monday at 6:00 AM UTC
SELECT cron.schedule(
    'weekly-report-email-every-monday',
    '0 6 * * 1',
    $$
    SELECT net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/weekly-report-email',
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
