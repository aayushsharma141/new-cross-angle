-- Migration: Lock down public.site_settings (Admin Audit P0-1)
--
-- Before: the table carried a permissive anon SELECT policy and the browser
--         read it with select("*"), so every anonymous visitor could pull
--         provider API keys, security_config, report_recipients,
--         telegram_chat_ids and rbac_permissions straight off the REST API.
--
-- After:
--   1. Third-party secrets no longer live in this table at all. Edge functions
--      already read RESEND_API_KEY / TELEGRAM_BOT_TOKEN / POSTHOG_* from
--      Supabase secrets (Deno.env), so the columns were a dead-end store.
--   2. anon can only SELECT an explicit allow-list of public columns
--      (column-level GRANT). `select("*")` on the base table as anon now fails;
--      the browser hook selects the same allow-list explicitly.
--   3. Any authenticated staff user can read the full row (needed for the admin
--      dashboard); writes remain admin/editor only via is_admin_or_editor().
--
-- Adding a new PUBLIC column later means adding it in two places: the GRANT
-- below and PUBLIC_COLUMNS in apps/web/src/hooks/useSiteSettings.ts.

-- ── 1. Remove secret storage ──────────────────────────────────────────────
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS resend_api_key;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS supabase_api_key;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS vercel_api_key;

-- Strip any tokens the old Credentials tab wrote into the integrations JSON.
-- The email_templates sub-object is kept — it is the only legitimate content.
UPDATE public.site_settings
SET integrations = integrations - 'whisper_api_key' - 'checkly_api_key' - 'telegram_bot_token'
WHERE integrations IS NOT NULL
  AND jsonb_typeof(integrations) = 'object';

-- ── 2. Reset RLS to a known state ─────────────────────────────────────────
-- Production has policies that no migration created (see ADR 0003), so drop
-- everything on the table dynamically rather than guessing names.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_settings', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors: row access allowed, columns restricted by GRANT below.
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT TO anon
  USING (true);

-- Any signed-in staff member may read the full configuration row.
CREATE POLICY "Staff read site_settings"
  ON public.site_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin insert site_settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update site_settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete site_settings"
  ON public.site_settings FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- ── 3. Column-level grant for anon ────────────────────────────────────────
-- posthog_api_key is a PostHog *project* token (phc_…): it is shipped in the
-- browser bundle by design and is write-only on PostHog's side, so it is not
-- a secret. ga_measurement_id / fb_pixel_id are likewise public identifiers.
REVOKE ALL ON public.site_settings FROM anon;
GRANT SELECT (
  id,
  studio_name,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  map_embed_url,
  business_hours,
  logo_light_url,
  logo_dark_url,
  company_logo_url,
  favicon_url,
  og_image_url,
  about_video_url,
  seo_title_template,
  seo_description,
  ga_measurement_id,
  fb_pixel_id,
  posthog_api_key,
  posthog_host,
  maintenance_mode_active,
  nav_links,
  footer_columns,
  social_links,
  studio_stats,
  hero_title,
  hero_subtitle,
  about_text,
  footer_text,
  contact_intro,
  updated_at
) ON public.site_settings TO anon;
