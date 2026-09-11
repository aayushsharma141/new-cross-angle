-- Migration S1: Drop dead legacy trigger and demote unnecessary SECURITY DEFINER
-- Part of isolated SECURITY DEFINER function audit & remediation.
--
-- 1. Drop dead legacy unauthenticated telegram notification trigger & function
--    (Superseded by on_lead_insert_webhook_notify / Supabase Database Webhook)
DROP TRIGGER IF EXISTS trg_leads_notify_telegram ON public.leads;
DROP FUNCTION IF EXISTS public.notify_telegram_on_lead_insert();

-- 2. Demote touch_estimator_flow_config from SECURITY DEFINER to SECURITY INVOKER
--    (Function only sets in-memory NEW.updated_at and NEW.updated_by; requires no elevated privileges)
CREATE OR REPLACE FUNCTION public.touch_estimator_flow_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Restrict trigger function execution grants
REVOKE EXECUTE ON FUNCTION public.touch_estimator_flow_config() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_estimator_flow_config() TO authenticated, service_role, postgres;
