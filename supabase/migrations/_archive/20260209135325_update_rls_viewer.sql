-- Create a function to check for any staff role (admin, editor, viewer)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'editor', 'viewer')
  );
$$;

-- Grant Viewer/Editor/Admin access to view all user roles (so they can browse the team)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Staff can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_staff(auth.uid()));

-- Keep stricter constraint for managing roles (only admins)
-- (Existing policy "Admins can manage roles" covers INSERT/UPDATE/DELETE)

-- Update Blogs: Allow staff to view unpublished posts
DROP POLICY IF EXISTS "Anyone can read published blogs" ON public.blogs;
CREATE POLICY "Public read published, Staff read all" ON public.blogs
    FOR SELECT USING (
        (is_published = true) OR public.is_staff(auth.uid())
    );

-- Update Leads: Allow staff (including viewers) to view leads
-- Currently: "Admins and editors can view leads"
DROP POLICY IF EXISTS "Admins and editors can view leads" ON public.leads;
CREATE POLICY "Staff can view leads" ON public.leads
    FOR SELECT USING (public.is_staff(auth.uid()));

-- Update Portfolio: Allow staff to view unpublished items (if applicable)
-- Currently: "Anyone can read portfolio" (public ALL)
-- If we add draft status later, we'd need this. For now, it's fine.

-- Update Site Content: Allow staff to view everything (public already can)
-- Currently: "Anyone can read site content"

-- Ensure Viewers explicitly CANNOT write (by ensuring existing write policies exclude them)
-- Existing write policies use `is_admin_or_editor()`.
-- Since `viewer` is NOT in `is_admin_or_editor` by definition (unless we changed it), write access remains restricted.
-- We do NOT modify `is_admin_or_editor`.

