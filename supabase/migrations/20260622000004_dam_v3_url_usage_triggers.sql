-- ==========================================
-- DAM V3: Sync Triggers for Asset Usages
-- ==========================================

-- Function for singular text URL columns
CREATE OR REPLACE FUNCTION sync_asset_usage_from_url()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id uuid;
  v_old_url text;
  v_new_url text;
  v_entity_type text;
  v_role text;
  v_domain text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_url USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_url USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  -- If URL changed or is new
  IF TG_OP = 'INSERT' OR v_old_url IS DISTINCT FROM v_new_url THEN
    -- Remove old usage if exists
    IF v_old_url IS NOT NULL AND v_old_url != '' THEN
      DELETE FROM asset_usages 
      WHERE entity_id = NEW.id 
      AND entity_type = v_entity_type 
      AND role = v_role;
    END IF;

    -- Add new usage
    IF v_new_url IS NOT NULL AND v_new_url != '' THEN
      SELECT asset_id INTO v_asset_id 
      FROM asset_versions 
      WHERE url = v_new_url 
      ORDER BY created_at DESC 
      LIMIT 1;

      IF v_asset_id IS NOT NULL THEN
        -- Check if it already exists to avoid duplicates
        SELECT id INTO v_existing_usage_id 
        FROM asset_usages 
        WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
        
        IF v_existing_usage_id IS NULL THEN
          INSERT INTO asset_usages (
            asset_id,
            domain,
            entity_type,
            entity_id,
            role,
            is_primary
          ) VALUES (
            v_asset_id,
            v_domain,
            v_entity_type,
            NEW.id,
            v_role,
            true
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function for text array URL columns
CREATE OR REPLACE FUNCTION sync_asset_usage_from_url_array()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id uuid;
  v_old_urls text[];
  v_new_urls text[];
  v_entity_type text;
  v_role text;
  v_domain text;
  v_url text;
  v_existing_usage_id uuid;
BEGIN
  -- TG_ARGV: [0] = url_column, [1] = entity_type, [2] = role, [3] = domain
  
  EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_new_urls USING NEW;
  
  IF TG_OP = 'UPDATE' THEN
    EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_old_urls USING OLD;
  END IF;

  v_entity_type := TG_ARGV[1];
  v_role := TG_ARGV[2];
  v_domain := TG_ARGV[3];

  IF TG_OP = 'INSERT' OR v_old_urls IS DISTINCT FROM v_new_urls THEN
    -- Delete all existing usages for this array role
    DELETE FROM asset_usages 
    WHERE entity_id = NEW.id 
    AND entity_type = v_entity_type 
    AND role = v_role;

    -- Add new usages
    IF v_new_urls IS NOT NULL THEN
      FOREACH v_url IN ARRAY v_new_urls
      LOOP
        IF v_url IS NOT NULL AND v_url != '' THEN
          SELECT asset_id INTO v_asset_id 
          FROM asset_versions 
          WHERE url = v_url 
          ORDER BY created_at DESC 
          LIMIT 1;

          IF v_asset_id IS NOT NULL THEN
            SELECT id INTO v_existing_usage_id 
            FROM asset_usages 
            WHERE asset_id = v_asset_id AND entity_id = NEW.id AND entity_type = v_entity_type AND role = v_role;
            
            IF v_existing_usage_id IS NULL THEN
              INSERT INTO asset_usages (
                asset_id,
                domain,
                entity_type,
                entity_id,
                role,
                is_primary
              ) VALUES (
                v_asset_id,
                v_domain,
                v_entity_type,
                NEW.id,
                v_role,
                false
              );
            END IF;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- Attach Triggers
--
-- Guarded on table + column existence rather than issuing bare DDL.
--
-- `blogs` is renamed to _blogs_deprecated by
-- 20260529180300_consolidate_duplicate_tables, whose only guard is
-- IF EXISTS (blogs) — so on a fresh database that rename always fires and this
-- migration used to abort here with 42P01 ("relation \"blogs\" does not
-- exist"), leaving the whole chain unreplayable. Note that `DROP TRIGGER IF
-- EXISTS ... ON blogs` guards the trigger, not the table, so it aborts too.
--
-- Production still has `blogs` (that rename never fired there), so this creates
-- exactly the same five triggers it always did wherever the tables are present,
-- and simply skips the ones whose table is absent.
-- ==========================================

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('sync_portfolio_image_usage',       'portfolio',              'image_url',    'hero',   'Portfolio'),
      ('sync_portfolio_video_usage',       'portfolio',              'video_url',    'video',  'Portfolio'),
      ('sync_blogs_cover_usage',           'blogs',                  'cover_image',  'hero',   'Marketing'),
      ('sync_transformation_before_usage', 'transformation_stories', 'before_media', 'before', 'Portfolio'),
      ('sync_transformation_after_usage',  'transformation_stories', 'after_media',  'after',  'Portfolio')
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
