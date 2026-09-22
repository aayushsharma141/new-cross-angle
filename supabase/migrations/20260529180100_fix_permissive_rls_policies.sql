-- Drop overly permissive RLS policies from early migrations
-- These grant full CRUD to ANY authenticated user (should be admin-only for writes)

BEGIN;

-- Helper: check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = 'public' STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  );
$$;

DO $$ BEGIN
    -- ═══ LEADS ═══
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
        DROP POLICY IF EXISTS "auth_all_leads" ON public.leads;
        -- Admin/super_admin can SELECT all leads
        CREATE POLICY "admin_select_leads" ON public.leads FOR SELECT TO authenticated
          USING (public.is_admin_user());
        -- Admin/super_admin can UPDATE leads
        CREATE POLICY "admin_update_leads" ON public.leads FOR UPDATE TO authenticated
          USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
        -- Admin/super_admin can DELETE leads
        CREATE POLICY "admin_delete_leads" ON public.leads FOR DELETE TO authenticated
          USING (public.is_admin_user());
    END IF;

    -- ═══ PROJECTS ═══
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        DROP POLICY IF EXISTS "auth_all_projects" ON public.projects;
        CREATE POLICY "admin_write_projects" ON public.projects FOR ALL TO authenticated
          USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
    END IF;

    -- ═══ SERVICES ═══
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
        DROP POLICY IF EXISTS "auth_all_services" ON public.services;
        CREATE POLICY "admin_write_services" ON public.services FOR ALL TO authenticated
          USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
    END IF;

    -- ═══ BLOGS ═══
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blogs') THEN
        DROP POLICY IF EXISTS "auth_all_blogs" ON public.blogs;
        CREATE POLICY "admin_write_blogs" ON public.blogs FOR ALL TO authenticated
          USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
    END IF;

    -- ═══ TESTIMONIALS ═══
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
        DROP POLICY IF EXISTS "auth_all_testimonials" ON public.testimonials;
        CREATE POLICY "admin_write_testimonials" ON public.testimonials FOR ALL TO authenticated
          USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
    END IF;

    -- ═══ LEAD_ACTIVITIES ═══
    -- Fix the USING(true) policy
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lead_activities') THEN
        DROP POLICY IF EXISTS "lead_activities_select" ON public.lead_activities;
        DROP POLICY IF EXISTS "lead_activities_insert" ON public.lead_activities;
        CREATE POLICY "admin_select_lead_activities" ON public.lead_activities FOR SELECT TO authenticated
          USING (public.is_admin_user());
        CREATE POLICY "admin_insert_lead_activities" ON public.lead_activities FOR INSERT TO authenticated
          WITH CHECK (public.is_admin_user());
    END IF;
END $$;

COMMIT;
