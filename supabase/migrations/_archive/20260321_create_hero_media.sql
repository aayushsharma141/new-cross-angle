-- =====================
-- HERO MEDIA TABLE
-- Manages rotating media (videos/images) for the homepage hero section
-- =====================
CREATE TABLE IF NOT EXISTS public.hero_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'video' CHECK (media_type IN ('video', 'image')),
  title text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  duration_ms integer DEFAULT 3000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active hero media" ON public.hero_media;
CREATE POLICY "Public can view active hero media" ON public.hero_media
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage hero media" ON public.hero_media;
CREATE POLICY "Authenticated users can manage hero media" ON public.hero_media
  FOR ALL USING (auth.role() = 'authenticated');
