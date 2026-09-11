-- Migration: Drop Legacy Telegram Trigger
-- Drops the old plaintext-GUC trigger which is being replaced by a Supabase Database Webhook.

DROP TRIGGER IF EXISTS on_lead_insert_telegram_notify ON public.leads;
DROP FUNCTION IF EXISTS public.handle_new_lead_telegram_notify();
