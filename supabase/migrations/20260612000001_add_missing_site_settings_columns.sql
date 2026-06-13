-- Add company_logo_url column to site_settings
-- This column is used throughout the codebase as a general-purpose logo URL field
-- (falls back to logo_light_url if not set)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Also add posthog tracking columns that are expected in the TypeScript interface
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS posthog_api_key TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS posthog_host TEXT;
