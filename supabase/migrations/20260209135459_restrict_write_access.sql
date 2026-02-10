-- Ensure restrictive policies for write access (Exclude 'viewer' role)

-- === BLOGS ===
DROP POLICY IF EXISTS "Admin can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins and editors can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins and editors can manage blogs" ON public.blogs;

CREATE POLICY "Admins/Editors can insert blogs" ON public.blogs
    FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admin can update blogs" ON public.blogs;
CREATE POLICY "Admins/Editors can update blogs" ON public.blogs
    FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete blogs" ON public.blogs;
CREATE POLICY "Admins/Editors can delete blogs" ON public.blogs
    FOR DELETE USING (public.is_admin_or_editor(auth.uid()));


-- === PORTFOLIO ===
DROP POLICY IF EXISTS "Admins and editors can manage portfolio" ON public.portfolio;

CREATE POLICY "Admins/Editors can insert portfolio" ON public.portfolio
    FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/Editors can update portfolio" ON public.portfolio
    FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/Editors can delete portfolio" ON public.portfolio
    FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- === LEADS ===
DROP POLICY IF EXISTS "Admins and editors can update leads" ON public.leads;
CREATE POLICY "Admins/Editors can update leads" ON public.leads
    FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

-- === USER ROLES ===
-- Only ADMINS can manage roles
-- Re-implementing logic directly since has_role(uuid, app_role) seems to have signature issues or schema scoping issues in migration context
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins Only can manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
