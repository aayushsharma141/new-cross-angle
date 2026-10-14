-- Site content blocks — lets the super admin edit public-site copy without a deploy.
--
-- Model
--   site_content           published JSON per content key. World-readable: the public site reads it.
--   site_content_drafts    work-in-progress JSON per key. Super admin only; never reaches visitors.
--   site_content_versions  every previously published value, for rollback and "who changed what".
--
-- All writes go through the SECURITY DEFINER functions below, which check the caller is a
-- super_admin. The tables themselves grant no write access to any client role.
--
-- This file is NOT applied automatically. Review it, then apply it to the linked project
-- (production is the schema source of truth — see .decisions/0003).

BEGIN;

-- ─── Move the legacy table out of the way ─────────────────────────────────────
-- Production already has an unrelated `public.site_content` from the 2026-01 pg_dump
-- (section_key / title / content …, 0 rows, unused by the app). Without this step the
-- `CREATE TABLE IF NOT EXISTS` below would silently keep that table and every CMS save
-- would fail. Rename it (and its constraints, whose backing indexes are schema-scoped
-- and would collide with the new table's) instead of dropping it, so nothing is lost.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'section_key'
  ) THEN
    IF to_regclass('public.site_content_legacy') IS NOT NULL THEN
      RAISE EXCEPTION 'public.site_content_legacy already exists; resolve manually before applying';
    END IF;
    RAISE NOTICE 'Renaming legacy public.site_content (% rows) to site_content_legacy',
      (SELECT count(*) FROM public.site_content);
    ALTER TABLE public.site_content RENAME TO site_content_legacy;
    ALTER TABLE public.site_content_legacy RENAME CONSTRAINT site_content_pkey TO site_content_legacy_pkey;
    ALTER TABLE public.site_content_legacy RENAME CONSTRAINT site_content_section_key_key TO site_content_legacy_section_key_key;
    ALTER TABLE public.site_content_legacy RENAME CONSTRAINT site_content_updated_by_fkey TO site_content_legacy_updated_by_fkey;
  END IF;
END
$$;

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_content (
  key          text PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+(\.[a-z0-9_]+)*$'),
  value        jsonb NOT NULL CHECK (octet_length(value::text) <= 200000),
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.site_content_drafts (
  key        text PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+(\.[a-z0-9_]+)*$'),
  value      jsonb NOT NULL CHECK (octet_length(value::text) <= 200000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.site_content_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          text NOT NULL,
  value        jsonb NOT NULL,
  published_at timestamptz NOT NULL,          -- when this value went live
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  replaced_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_content_versions_key ON public.site_content_versions (key, replaced_at DESC);

-- Fail loudly if any table still has an unexpected shape (e.g. a different pre-existing
-- table the IF NOT EXISTS guards skipped), rather than "succeeding" with a broken CMS.
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(t || '.' || c, ', ') INTO missing
  FROM (VALUES
    ('site_content', 'key'), ('site_content', 'value'), ('site_content', 'published_at'),
    ('site_content_drafts', 'key'), ('site_content_drafts', 'value'),
    ('site_content_versions', 'key'), ('site_content_versions', 'replaced_at')
  ) AS expected(t, c)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = expected.t AND column_name = expected.c
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'site_content tables have an unexpected shape; missing columns: %', missing;
  END IF;
END
$$;

-- ─── Row level security ───────────────────────────────────────────────────────

ALTER TABLE public.site_content          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_drafts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_versions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.site_content, public.site_content_drafts, public.site_content_versions FROM anon, authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT ON public.site_content_drafts, public.site_content_versions TO authenticated;

DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "super_admin_read_site_content_drafts" ON public.site_content_drafts;
CREATE POLICY "super_admin_read_site_content_drafts" ON public.site_content_drafts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super_admin_read_site_content_versions" ON public.site_content_versions;
CREATE POLICY "super_admin_read_site_content_versions" ON public.site_content_versions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- ─── Write functions (super_admin only) ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.save_site_content_draft(p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can edit site content' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.site_content_drafts (key, value, updated_at, updated_by)
  VALUES (p_key, p_value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now(), updated_by = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.discard_site_content_draft(p_key text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can edit site content' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.site_content_drafts WHERE key = p_key;
END;
$$;

-- Publish the current draft. The value it replaces is kept in site_content_versions.
CREATE OR REPLACE FUNCTION public.publish_site_content(p_key text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_draft public.site_content_drafts%ROWTYPE;
  v_live  public.site_content%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can publish site content' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_draft FROM public.site_content_drafts WHERE key = p_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No draft to publish for %', p_key USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_live FROM public.site_content WHERE key = p_key;
  IF FOUND THEN
    INSERT INTO public.site_content_versions (key, value, published_at, published_by)
    VALUES (v_live.key, v_live.value, v_live.published_at, v_live.published_by);
  END IF;

  INSERT INTO public.site_content (key, value, published_at, published_by)
  VALUES (p_key, v_draft.value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, published_at = now(), published_by = auth.uid();

  DELETE FROM public.site_content_drafts WHERE key = p_key;
END;
$$;

-- Put an earlier version back live. The value being replaced is itself kept, so a revert can be undone.
CREATE OR REPLACE FUNCTION public.revert_site_content(p_key text, p_version_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_old  public.site_content_versions%ROWTYPE;
  v_live public.site_content%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can publish site content' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_old FROM public.site_content_versions WHERE id = p_version_id AND key = p_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found for %', p_key USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_live FROM public.site_content WHERE key = p_key;
  IF FOUND THEN
    INSERT INTO public.site_content_versions (key, value, published_at, published_by)
    VALUES (v_live.key, v_live.value, v_live.published_at, v_live.published_by);
  END IF;

  INSERT INTO public.site_content (key, value, published_at, published_by)
  VALUES (p_key, v_old.value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, published_at = now(), published_by = auth.uid();
END;
$$;

-- Go back to the built-in text: drop the published override so the site falls back to its defaults.
CREATE OR REPLACE FUNCTION public.reset_site_content(p_key text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_live public.site_content%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can publish site content' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_live FROM public.site_content WHERE key = p_key;
  IF FOUND THEN
    INSERT INTO public.site_content_versions (key, value, published_at, published_by)
    VALUES (v_live.key, v_live.value, v_live.published_at, v_live.published_by);
    DELETE FROM public.site_content WHERE key = p_key;
  END IF;
  DELETE FROM public.site_content_drafts WHERE key = p_key;
END;
$$;

REVOKE ALL ON FUNCTION public.save_site_content_draft(text, jsonb),
                       public.discard_site_content_draft(text),
                       public.publish_site_content(text),
                       public.revert_site_content(text, uuid),
                       public.reset_site_content(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_site_content_draft(text, jsonb),
                          public.discard_site_content_draft(text),
                          public.publish_site_content(text),
                          public.revert_site_content(text, uuid),
                          public.reset_site_content(text) TO authenticated;

COMMIT;
