-- ==========================================
-- DAM V3: More Sync Triggers for Asset Usages
--
-- Guarded on table + column existence, same as
-- 20260622000004_dam_v3_url_usage_triggers.
--
-- hero_media, site_settings and team_members all exist in production but are
-- created by no migration in this repo, so a fresh database has none of them
-- and the bare DDL below used to abort the replay with 42P01. (`DROP TRIGGER
-- IF EXISTS ... ON <table>` guards the trigger, not the table, so it aborts
-- too.) Wherever the tables are present this creates exactly the same five
-- triggers it always did.
-- ==========================================

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('sync_hero_media_usage',         'hero_media',    'media_url',        'hero',    'Marketing'),
      ('sync_settings_logo_usage',      'site_settings', 'company_logo_url', 'logo',    'System'),
      ('sync_settings_favicon_usage',   'site_settings', 'favicon_url',      'favicon', 'System'),
      ('sync_settings_og_usage',        'site_settings', 'og_image_url',     'og_image','System'),
      ('sync_team_members_image_usage', 'team_members',  'image_url',        'avatar',  'Marketing')
    ) AS v(trigger_name, table_name, column_name, usage_role, usage_domain)
  LOOP
    IF to_regclass('public.' || t.table_name) IS NULL THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — table public.% does not exist',
        t.trigger_name, t.table_name;
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t.table_name
        AND column_name = t.column_name
    ) THEN
      RAISE NOTICE 'dam_v3 triggers: skipping % — public.%.% does not exist',
        t.trigger_name, t.table_name, t.column_name;
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t.trigger_name, t.table_name);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OF %I ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION sync_asset_usage_from_url(%L, %L, %L, %L)',
      t.trigger_name, t.column_name, t.table_name,
      t.column_name, t.table_name, t.usage_role, t.usage_domain
    );
  END LOOP;
END $$;
