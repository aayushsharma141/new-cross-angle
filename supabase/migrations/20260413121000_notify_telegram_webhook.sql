-- Migration: Add Telegram Lead Notification Webhook
-- Triggered only on INSERT to public.leads

CREATE OR REPLACE FUNCTION public.handle_new_lead_telegram_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/notify-telegram',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
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

-- Create trigger (replace if exists)
DROP TRIGGER IF EXISTS on_lead_insert_telegram_notify ON public.leads;

CREATE TRIGGER on_lead_insert_telegram_notify
    AFTER INSERT
    ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_lead_telegram_notify();

COMMENT ON FUNCTION public.handle_new_lead_telegram_notify() IS 'Sends a Telegram notification via Edge Function on every new lead insertion.';
