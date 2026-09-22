-- Add company_logo_url column to site_settings
-- This column is used throughout the codebase as a general-purpose logo URL field
-- (falls back to logo_light_url if not set)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'site_settings'
) THEN
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Also add posthog tracking columns that are expected in the TypeScript interface
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS posthog_api_key TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS posthog_host TEXT;
END IF;
END $$;
