-- Refinement Migration
-- Refinement Migration
-- 1. Add new fields to leads (leads table renamed in fix_schema)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'leads'
) THEN
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS budget TEXT;
END IF;
END $$;
-- 2. Update site_settings
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'site_settings'
) THEN
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS footer_text TEXT;
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS contact_intro TEXT;
END IF;
END $$;
-- 3. Update milestones (Recreate to match "Counter" format: label, value)
-- Drop existing milestones table if it exists and recreate
DROP TABLE IF EXISTS public.milestones;
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    -- e.g. "Years Experience"
    value TEXT NOT NULL,
    -- e.g. "15+"
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read milestones" ON public.milestones FOR
SELECT USING (true);
CREATE POLICY "Admin all milestones" ON public.milestones FOR ALL USING (auth.role() = 'authenticated');
-- 4. Create profiles table (User Management)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin all profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
-- Simplified for now
-- 5. Ensure projects has service_tag (or mapping)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'projects'
) THEN
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS service_tag TEXT;
END IF;
END $$;