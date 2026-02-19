-- Add RLS policies for the media storage bucket
-- Public can read (needed for portfolio images displayed on public site)
-- Only authenticated admins/editors can upload, update, delete
-- Ensure helper function exists (extracted from 20260103 dump)
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  ) $$;
-- First, enable RLS on storage.objects if not already enabled
-- Note: This applies to the existing 'media' bucket
-- Policy: Anyone can read files from the media bucket (for public portfolio display)
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
CREATE POLICY "Anyone can view media files" ON storage.objects FOR
SELECT USING (bucket_id = 'media');
-- Policy: Authenticated admins/editors can upload files to the media bucket
DROP POLICY IF EXISTS "Admins and editors can upload media files" ON storage.objects;
CREATE POLICY "Admins and editors can upload media files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'media'
    AND public.is_admin_or_editor(auth.uid())
  );
-- Policy: Authenticated admins/editors can update files in the media bucket
DROP POLICY IF EXISTS "Admins and editors can update media files" ON storage.objects;
CREATE POLICY "Admins and editors can update media files" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'media'
    AND public.is_admin_or_editor(auth.uid())
  );
-- Policy: Authenticated admins/editors can delete files from the media bucket
DROP POLICY IF EXISTS "Admins and editors can delete media files" ON storage.objects;
CREATE POLICY "Admins and editors can delete media files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'media'
  AND public.is_admin_or_editor(auth.uid())
);