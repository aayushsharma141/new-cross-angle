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
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.project_categories(id) ON DELETE
SET NULL;
-- 2. Project Gallery
CREATE TABLE IF NOT EXISTS public.project_gallery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    room_name text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
-- 3. Project Materials
CREATE TABLE IF NOT EXISTS public.project_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    details text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
-- 4. Testimonials Fix
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
-- 5. Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
-- 6. Read Policies (Public)
CREATE POLICY "Public read project_categories" ON public.project_categories FOR
SELECT USING (true);
CREATE POLICY "Public read project_gallery" ON public.project_gallery FOR
SELECT USING (true);
CREATE POLICY "Public read project_materials" ON public.project_materials FOR
SELECT USING (true);
-- 7. Write Policies (Admin)
CREATE POLICY "Admin manage project_categories" ON public.project_categories FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.users.id = auth.uid()
    )
);
CREATE POLICY "Admin manage project_gallery" ON public.project_gallery FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.users.id = auth.uid()
    )
);
CREATE POLICY "Admin manage project_materials" ON public.project_materials FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.users.id = auth.uid()
    )
);