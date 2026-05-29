-- Seed Site Settings with About Video URL
-- Run this to set default site settings

INSERT INTO public.site_settings (
  studio_name,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  about_video_url,
  seo_title_template,
  social_links
) VALUES (
  'Crossangle Interior',
  'Premium Interior Design Studio',
  'hello@crossangle.com',
  '+917909041132',
  '917909041132',
  '2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango, Jamshedpur, Jharkhand 831012',
  'https://www.youtube.com/embed/gJMCIaI7nKg',
  '%s | Crossangle Interior',
  '{"facebook": "https://www.facebook.com/crossangleinterior", "instagram": "https://www.instagram.com/crossangleinterior/", "twitter": "", "linkedin": ""}'
) ON CONFLICT DO NOTHING;

-- If settings exist but about_video_url is null, update it
UPDATE public.site_settings
SET about_video_url = 'https://www.youtube.com/embed/gJMCIaI7nKg'
WHERE about_video_url IS NULL OR about_video_url = '';
