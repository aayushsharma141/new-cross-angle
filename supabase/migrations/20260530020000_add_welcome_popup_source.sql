-- Alter type lead_source to add welcome_popup value
-- We must disable transactions for this to work in older Supabase setups, or just let it run.
-- If the type is actually lead_source, this will succeed.
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'welcome_popup';

