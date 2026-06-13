-- Add non-posthog integrations keys
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS resend_api_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS supabase_api_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vercel_api_key TEXT;
