-- Enable RLS on site_content
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (to be safe)
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins and editors can manage site content" ON public.site_content;

-- Create policies
CREATE POLICY "Public can view site content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage site content" ON public.site_content
  FOR ALL TO authenticated 
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
