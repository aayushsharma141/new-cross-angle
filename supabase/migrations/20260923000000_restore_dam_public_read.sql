-- ==========================================================================
-- Restore public SELECT on the DAM read path
--
-- Symptom: every CMS-managed image silently disappeared from the public site.
-- Pages did not error and nothing was logged — they quietly fell through to the
-- static fallbacks in src/config/services/* and src/lib/api/portfolio/static-data.ts,
-- so the CMS appeared to have no effect on what visitors saw.
--
-- Cause: anonymous SELECT on assets / asset_versions / asset_usages returns
-- HTTP 200 with an empty array. The public site resolves images through
-- lib/api/_shared/dam-stitcher.ts, which queries asset_usages with the browser
-- client. A logged-out visitor carries only the anon key, so RLS filtered every
-- row away and `icon_url` / `hero_image` came back undefined.
--
-- 20260622000000_dam_v3_schema.sql created these policies as
-- `FOR SELECT USING (true)` with the comment "so the website can fetch images".
-- No migration drops them, so they were altered directly in production — the
-- drift ADR 0003 describes. This restores them idempotently.
--
-- Scope change vs. the original: public read is limited to assets whose status
-- is 'ready'. All 22 current assets are 'ready', so nothing visible changes
-- today, but in-flight 'uploading' rows are no longer world-readable.
--
-- Deliberately NOT restored: media_files / media_folders. Those are read only by
-- admin surfaces (AdminMedia, AssetSidebar, MediaRepository, useHubStats) — no
-- public page touches them, so they stay authenticated-only.
-- ==========================================================================

-- ── assets ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Read Access for Assets" ON public.assets;
CREATE POLICY "Public Read Access for Assets"
  ON public.assets
  FOR SELECT
  USING (status = 'ready'::public.asset_status_enum);

-- ── asset_versions ────────────────────────────────────────────────────────
-- The payload rows. Readable when their parent asset is readable.
DROP POLICY IF EXISTS "Public Read Access for Asset Versions" ON public.asset_versions;
CREATE POLICY "Public Read Access for Asset Versions"
  ON public.asset_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.assets a
      WHERE a.id = asset_versions.asset_id
        AND a.status = 'ready'::public.asset_status_enum
    )
  );

-- ── asset_usages ──────────────────────────────────────────────────────────
-- The entity link the stitcher actually queries. PostgREST needs SELECT on
-- every table in the embed chain (asset_usages -> assets -> asset_versions),
-- so all three policies are required for the nested select to return rows.
DROP POLICY IF EXISTS "Public Read Access for Asset Usages" ON public.asset_usages;
CREATE POLICY "Public Read Access for Asset Usages"
  ON public.asset_usages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.assets a
      WHERE a.id = asset_usages.asset_id
        AND a.status = 'ready'::public.asset_status_enum
    )
  );

-- ── Verification ──────────────────────────────────────────────────────────
-- After applying, confirm an anonymous read returns rows:
--
--   curl -s -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
--     "https://<ref>.supabase.co/rest/v1/asset_usages?select=id&limit=1"
--
-- Expect a non-empty array. An empty array [] means the policies did not take.
