-- ═══════════════════════════════════════════
-- PRODUCTION ALIGNMENT MIGRATION v1
-- Alignment with CrossAngle Intelligence Blueprint
-- ═══════════════════════════════════════════
-- 1. SYSTEM LOGGING (Admin Actions)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid REFERENCES auth.users(id) ON DELETE
    SET NULL,
        action text NOT NULL,
        module text NOT NULL,
        status text DEFAULT 'success',
        details jsonb DEFAULT '{}',
        ip_address text,
        device text,
        created_at timestamptz DEFAULT now()
);
-- 2. WEBSITE EVENTS (Client Interactions)
CREATE TABLE IF NOT EXISTS public.website_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    page text,
    source text,
    device text,
    browser text,
    city text,
    session_id text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);
-- 3. ADMIN SESSIONS (Active Logins)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address text,
    user_agent text,
    last_activity timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);
-- 4. CRM PIPELINE TRACKING
CREATE TABLE IF NOT EXISTS public.crm_pipeline_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    from_status text,
    to_status text NOT NULL,
    admin_id uuid REFERENCES auth.users(id) ON DELETE
    SET NULL,
        created_at timestamptz DEFAULT now()
);
-- 5. CMS ARCHITECTURE ENHANCEMENTS
CREATE TABLE IF NOT EXISTS public.cms_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name text NOT NULL,
    section_key text NOT NULL,
    content jsonb NOT NULL DEFAULT '{}',
    is_active boolean DEFAULT true,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    UNIQUE(page_name, section_key)
);
-- 6. REFINE PROFILE TRACKING
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'last_login'
) THEN
ALTER TABLE public.profiles
ADD COLUMN last_login timestamptz;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'status'
) THEN
ALTER TABLE public.profiles
ADD COLUMN status text DEFAULT 'active';
END IF;
END $$;
-- ═══════════════════════════════════════════
-- RLS POLICIES (Admin Only Access)
-- ═══════════════════════════════════════════
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
-- Admins can do everything on these tables
CREATE POLICY "Admins can manage system_logs" ON public.system_logs FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Admins can manage website_events" ON public.website_events FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Admins can manage sessions" ON public.admin_sessions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Admins can manage cms_sections" ON public.cms_sections FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Public can insert website events (anonymous tracking)
CREATE POLICY "Anon can insert website_events" ON public.website_events FOR
INSERT TO anon WITH CHECK (true);
-- ═══════════════════════════════════════════
-- TRIGGERS & LOGS
-- ═══════════════════════════════════════════
-- Update updated_at for cms_sections
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER tr_cms_sections_updated_at BEFORE
UPDATE ON public.cms_sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();