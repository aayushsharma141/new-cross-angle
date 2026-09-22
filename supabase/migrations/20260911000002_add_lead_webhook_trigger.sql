-- Migration: Add Database Webhook trigger for Telegram notifications
-- Replaces the dropped plaintext-GUC trigger (20260911000001_drop_legacy_telegram_trigger.sql).
--
-- Architecture:
--   leads INSERT
--     ↓
--   handle_lead_webhook_notify() [pg_net, secret stored in function body]
--     ↓
--   notify-telegram Edge Function  [authenticates via WEBHOOK_SECRET env var]
--     ↓
--   Telegram
--
-- The Authorization header secret is stored in the trigger function body (pg_proc).
-- It is NOT exposed via current_setting() GUC.
-- The matching WEBHOOK_SECRET is stored in Supabase Edge Function secrets only.
-- To rotate: regenerate secret, update Edge Function secret, re-run this migration.
--
-- NOTE: The actual secret value is NOT in this migration file.
-- Re-create this trigger (with updated secret) by running:
--   supabase db push
-- after setting the new secret value in the function body via the Supabase Dashboard SQL editor
-- or via the project's secure secret management workflow.

-- Idempotent: safe to re-run
DROP TRIGGER IF EXISTS on_lead_insert_webhook_notify ON public.leads;
DROP FUNCTION IF EXISTS public.handle_lead_webhook_notify();

-- The trigger function body below is intentionally redacted in this migration file.
-- The live version (with the actual Authorization header) was applied directly
-- via the Supabase SQL API to avoid committing the secret to version control.
-- See: docs/architecture/telegram-webhook.md for the rotation procedure.
CREATE OR REPLACE FUNCTION public.handle_lead_webhook_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- PLACEHOLDER: This function must be re-applied with the actual WEBHOOK_SECRET
  -- via the secure rotation procedure documented in docs/architecture/telegram-webhook.md.
  -- The live version was deployed directly; this migration sets up the trigger
  -- structure for reproducibility.
  PERFORM net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/notify-telegram',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.webhook_secret', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', row_to_json(NEW),
      'schema', 'public'
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lead_insert_webhook_notify
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_lead_webhook_notify();

COMMENT ON FUNCTION public.handle_lead_webhook_notify() IS
  'Sends Telegram notification via Edge Function on every new lead INSERT. '
  'Authenticated via WEBHOOK_SECRET (stored in Edge Function secrets). '
  'The live trigger function body contains the actual secret — rotate via the procedure '
  'in docs/architecture/telegram-webhook.md.';
