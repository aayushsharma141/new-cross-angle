-- Add about_video_url field to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_video_url text;
