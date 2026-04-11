-- =====================================
-- STORAGE BUCKET SETUP
-- Run this AFTER the main setup SQL
-- =====================================

-- Create media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for media bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
CREATE POLICY "Allow authenticated users to update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

-- Verify bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'media';
