-- ==========================================================================
-- Restore RLS policies on projects and the tables the portfolio joins
--
-- Symptom: /portfolio shows only the static fallback projects, and the admin
-- CMS portfolio list is empty. Nothing errors: with RLS enabled and no policy,
-- PostgREST returns HTTP 200 with an empty array.
--
-- Cause: projects, project_gallery, project_materials and project_categories
-- all have RLS enabled and ZERO policies in production (checked 2026-09-24,
-- read-only). anon read projects on 2026-09-21 and returned 0 rows on
-- 2026-09-23 (.planning/STATE.md, 820c84c2); the loss is outside the 24h log
-- window. Part of a wider drift: 68 public tables have RLS on and no policies.
--
-- Deliberate differences from the historical migrations:
--   * Public read uses status = 'live', not 'published'. The app only ever
--     writes 'live' / 'draft' (PortfolioFormDialog), all 3 rows are 'live',
--     and the public query (lib/api/portfolio/queries.ts) has no status
--     filter, so RLS is the only thing keeping drafts off the site.
--     20260226120500's 'published' would still hide every project.
--   * CMS writes use public.is_admin_or_editor(), which exists in production
--     (super_admin / admin / editor, SECURITY DEFINER, empty search_path).
--     20260529180100's is_admin_user() does not exist in production.
--   * Gallery and materials are publicly readable only for live projects, so
--     a draft's images and specs don't leak through the join tables.
--
-- Idempotent and all-or-nothing: safe to re-run.
-- ==========================================================================

BEGIN;

-- ── projects ──────────────────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_projects" ON public.projects;
CREATE POLICY "public_read_projects" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (status = 'live');

DROP POLICY IF EXISTS "cms_write_projects" ON public.projects;
CREATE POLICY "cms_write_projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor((SELECT auth.uid())))
  WITH CHECK (public.is_admin_or_editor((SELECT auth.uid())));

-- ── project_gallery ───────────────────────────────────────────────────────
ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_project_gallery" ON public.project_gallery;
CREATE POLICY "public_read_project_gallery" ON public.project_gallery
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_gallery.project_id AND p.status = 'live'
  ));

DROP POLICY IF EXISTS "cms_write_project_gallery" ON public.project_gallery;
CREATE POLICY "cms_write_project_gallery" ON public.project_gallery
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor((SELECT auth.uid())))
  WITH CHECK (public.is_admin_or_editor((SELECT auth.uid())));

-- ── project_materials ─────────────────────────────────────────────────────
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_project_materials" ON public.project_materials;
CREATE POLICY "public_read_project_materials" ON public.project_materials
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_materials.project_id AND p.status = 'live'
  ));

DROP POLICY IF EXISTS "cms_write_project_materials" ON public.project_materials;
CREATE POLICY "cms_write_project_materials" ON public.project_materials
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor((SELECT auth.uid())))
  WITH CHECK (public.is_admin_or_editor((SELECT auth.uid())));

-- ── project_categories (names only; not sensitive) ────────────────────────
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_project_categories" ON public.project_categories;
CREATE POLICY "public_read_project_categories" ON public.project_categories
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "cms_write_project_categories" ON public.project_categories;
CREATE POLICY "cms_write_project_categories" ON public.project_categories
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor((SELECT auth.uid())))
  WITH CHECK (public.is_admin_or_editor((SELECT auth.uid())));

COMMIT;
