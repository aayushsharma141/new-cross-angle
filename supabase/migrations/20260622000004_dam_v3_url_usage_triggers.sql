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
-- ==========================================

-- portfolio (image_url)
DROP TRIGGER IF EXISTS sync_portfolio_image_usage ON portfolio;
CREATE TRIGGER sync_portfolio_image_usage
AFTER INSERT OR UPDATE OF image_url ON portfolio
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('image_url', 'portfolio', 'hero', 'Portfolio');

-- portfolio (video_url)
DROP TRIGGER IF EXISTS sync_portfolio_video_usage ON portfolio;
CREATE TRIGGER sync_portfolio_video_usage
AFTER INSERT OR UPDATE OF video_url ON portfolio
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('video_url', 'portfolio', 'video', 'Portfolio');

-- blogs (cover_image)
DROP TRIGGER IF EXISTS sync_blogs_cover_usage ON blogs;
CREATE TRIGGER sync_blogs_cover_usage
AFTER INSERT OR UPDATE OF cover_image ON blogs
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('cover_image', 'blogs', 'hero', 'Marketing');

-- transformation_stories (before_media)
DROP TRIGGER IF EXISTS sync_transformation_before_usage ON transformation_stories;
CREATE TRIGGER sync_transformation_before_usage
AFTER INSERT OR UPDATE OF before_media ON transformation_stories
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('before_media', 'transformation_stories', 'before', 'Portfolio');

-- transformation_stories (after_media)
DROP TRIGGER IF EXISTS sync_transformation_after_usage ON transformation_stories;
CREATE TRIGGER sync_transformation_after_usage
AFTER INSERT OR UPDATE OF after_media ON transformation_stories
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('after_media', 'transformation_stories', 'after', 'Portfolio');
