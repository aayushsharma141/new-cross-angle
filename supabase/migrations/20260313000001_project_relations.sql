-- =============================================================
-- PROJECT SCHEMA RELATIONS
-- Resolves missing relationship fetch errors in api.ts
-- =============================================================
-- 1. Project Categories
CREATE TABLE IF NOT EXISTS public.project_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);
-- Ensure projects can relate to categories
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='projects') THEN
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.project_categories(id) ON DELETE SET NULL;
END IF; END $$;

-- 2. Project Gallery
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='projects') THEN
    CREATE TABLE IF NOT EXISTS public.project_gallery (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
        image_url text NOT NULL,
        room_name text,
        display_order integer DEFAULT 0,
        created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;
END IF; END $$;

-- 3. Project Materials
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='projects') THEN
    CREATE TABLE IF NOT EXISTS public.project_materials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
        name text NOT NULL,
        details text,
        display_order integer DEFAULT 0,
        created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
END IF; END $$;

-- 4. Testimonials Fix
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='testimonials') THEN
    ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
END IF; END $$;

-- 5. Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
-- 6. Read Policies (Public)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_categories') THEN
    DROP POLICY IF EXISTS "Public read project_categories" ON public.project_categories;
    CREATE POLICY "Public read project_categories" ON public.project_categories FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_gallery') THEN
    DROP POLICY IF EXISTS "Public read project_gallery" ON public.project_gallery;
    CREATE POLICY "Public read project_gallery" ON public.project_gallery FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_materials') THEN
    DROP POLICY IF EXISTS "Public read project_materials" ON public.project_materials;
    CREATE POLICY "Public read project_materials" ON public.project_materials FOR SELECT USING (true);
END IF; END $$;

-- 7. Write Policies (Admin)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_categories') THEN
    DROP POLICY IF EXISTS "Admin manage project_categories" ON public.project_categories;
    CREATE POLICY "Admin manage project_categories" ON public.project_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()));
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_gallery') THEN
    DROP POLICY IF EXISTS "Admin manage project_gallery" ON public.project_gallery;
    CREATE POLICY "Admin manage project_gallery" ON public.project_gallery FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()));
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='project_materials') THEN
    DROP POLICY IF EXISTS "Admin manage project_materials" ON public.project_materials;
    CREATE POLICY "Admin manage project_materials" ON public.project_materials FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()));
END IF; END $$;