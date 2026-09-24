-- ==========================================================================
-- RLS policy for media_assets
--
-- media_assets was meant to be renamed to _media_assets_deprecated by
-- 20260529180300_consolidate_duplicate_tables.sql but the rename never
-- ran in production (migration drift). It has 0 rows; no app code queries
-- it directly. The policy shape matches what 20260222000000_fix_db_lints.sql
-- originally intended: admin/editor full access, no public read.
--
-- This also closes the last "RLS on, zero policies" table that is not either
-- an intentional SECURITY DEFINER-only table (auth_rate_limits) or a
-- partitioned-table child that inherits from its parent (project_views_*).
-- ==========================================================================

BEGIN;

DROP POLICY IF EXISTS "Admin all media_assets" ON public.media_assets;
CREATE POLICY "Admin all media_assets" ON public.media_assets
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor((SELECT auth.uid())))
  WITH CHECK (public.is_admin_or_editor((SELECT auth.uid())));

COMMIT;
