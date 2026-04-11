-- ============================================================================
-- BLOGS TABLE SCHEMA FIX
-- ============================================================================
-- This migration ensures the blogs table has the correct schema
-- matching the frontend code expectations

-- Drop potentially conflicting policy first (might depend on 'published' or 'is_published')
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;

-- Ensure is_published column exists (not just 'published')
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- If you had 'published' column, migrate data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'published'
  ) THEN
    UPDATE public.blogs SET is_published = published WHERE is_published IS NULL;
    ALTER TABLE public.blogs DROP COLUMN published;
  END IF;
END $$;

-- Ensure published_at exists
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Update published_at for already published blogs
UPDATE public.blogs 
SET published_at = updated_at 
WHERE is_published = TRUE AND published_at IS NULL;

-- Add trigger for auto-setting published_at
CREATE OR REPLACE FUNCTION set_blog_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_published_at_trigger ON public.blogs;
CREATE TRIGGER set_blog_published_at_trigger BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION set_blog_published_at();

-- Add Policy for Public Read (Moved from 20240205_init_cms.sql)
CREATE POLICY "Public can view published blogs" ON public.blogs
  FOR SELECT USING (is_published = true);
