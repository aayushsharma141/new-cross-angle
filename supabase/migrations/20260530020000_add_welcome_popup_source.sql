-- Alter type lead_source_enum to add welcome_popup value
ALTER TYPE public.lead_source_enum ADD VALUE IF NOT EXISTS 'welcome_popup';
