-- Migration: Add CRM automation (pg_cron for stale-lead-checker + DB trigger for auto-score-lead)
-- Run after: 20260408103504_add_crm_handoffs_and_status.sql

-- ══════════════════════════════════════════════════════════════
-- 1. pg_cron — schedule stale-lead-checker every 6 hours
-- ══════════════════════════════════════════════════════════════

-- Enable pg_cron extension (run once per database)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on pg_cron schema to service_role so Edge Functions can manage jobs
GRANT USAGE ON SCHEMA cron TO SERVICE_ROLE;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA cron TO SERVICE_ROLE;

-- Schedule: every 6 hours, on the hour
-- The stale-lead-checker edge function handles staleness detection,
-- digest emails, and hot lead priority alerts.
SELECT cron.schedule(
    'stale-lead-checker-every-6h',
    '0 */6 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/stale-lead-checker',
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

-- ══════════════════════════════════════════════════════════════
-- 2. Supabase DB trigger — auto-score-lead on INSERT or UPDATE
-- ══════════════════════════════════════════════════════════════

-- Wrapper function called by the database trigger
CREATE OR REPLACE FUNCTION public.handle_lead_score_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only fire when scoring-relevant fields change
    IF TG_OP = 'INSERT'
       OR OLD.budget IS DISTINCT FROM NEW.budget
       OR OLD.budget_value_inr IS DISTINCT FROM NEW.budget_value_inr
       OR OLD.category IS DISTINCT FROM NEW.category
       OR OLD.lead_type IS DISTINCT FROM NEW.lead_type
       OR OLD.message IS DISTINCT FROM NEW.message
       OR OLD.timeline IS DISTINCT FROM NEW.timeline
       OR OLD.source IS DISTINCT FROM NEW.source
       OR OLD.lead_source IS DISTINCT FROM NEW.lead_source
       OR OLD.email IS DISTINCT FROM NEW.email
       OR OLD.phone IS DISTINCT FROM NEW.phone
    THEN
        PERFORM net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/auto-score-lead',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
            ),
            body := jsonb_build_object(
                'lead_id', NEW.id,
                'old_score', OLD.score
            )
        );
    END IF;

    -- Auto-set closed_at when status changes to won or lost
    IF OLD.status IS DISTINCT FROM NEW.status
       AND NEW.status IN ('won', 'lost')
    THEN
        NEW.closed_at := COALESCE(NEW.closed_at, now());
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger (replace if exists)
DROP TRIGGER IF EXISTS on_lead_change_score_update ON public.leads;

CREATE TRIGGER on_lead_change_score_update
    AFTER INSERT OR UPDATE OF
        budget,
        budget_value_inr,
        category,
        lead_type,
        message,
        timeline,
        source,
        lead_source,
        email,
        phone,
        status
    ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_lead_score_update();

-- ══════════════════════════════════════════════════════════════
-- 3. App settings (used by cron job above)
-- ══════════════════════════════════════════════════════════════
-- These are set via the Supabase dashboard → Settings → Secrets,
-- or via the Supabase CLI: supabase secrets set KEY=VALUE
--
-- Required secrets:
--   SUPABASE_URL            → app.supabase_url
--   SUPABASE_SERVICE_ROLE_KEY → app.supabase_service_role_key
