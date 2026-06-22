-- Add non-posthog integrations keys
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'site_settings'
) THEN
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS resend_api_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS supabase_api_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vercel_api_key TEXT;
END IF;
END $$;
