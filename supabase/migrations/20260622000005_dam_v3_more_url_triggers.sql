-- ==========================================
-- DAM V3: More Sync Triggers for Asset Usages
-- ==========================================

-- hero_media (media_url)
DROP TRIGGER IF EXISTS sync_hero_media_usage ON hero_media;
CREATE TRIGGER sync_hero_media_usage
AFTER INSERT OR UPDATE OF media_url ON hero_media
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('media_url', 'hero_media', 'hero', 'Marketing');

-- site_settings (company_logo_url)
DROP TRIGGER IF EXISTS sync_settings_logo_usage ON site_settings;
CREATE TRIGGER sync_settings_logo_usage
AFTER INSERT OR UPDATE OF company_logo_url ON site_settings
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('company_logo_url', 'site_settings', 'logo', 'System');

-- site_settings (favicon_url)
DROP TRIGGER IF EXISTS sync_settings_favicon_usage ON site_settings;
CREATE TRIGGER sync_settings_favicon_usage
AFTER INSERT OR UPDATE OF favicon_url ON site_settings
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('favicon_url', 'site_settings', 'favicon', 'System');

-- site_settings (og_image_url)
DROP TRIGGER IF EXISTS sync_settings_og_usage ON site_settings;
CREATE TRIGGER sync_settings_og_usage
AFTER INSERT OR UPDATE OF og_image_url ON site_settings
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('og_image_url', 'site_settings', 'og_image', 'System');

-- team_members (image_url)
DROP TRIGGER IF EXISTS sync_team_members_image_usage ON team_members;
CREATE TRIGGER sync_team_members_image_usage
AFTER INSERT OR UPDATE OF image_url ON team_members
FOR EACH ROW
EXECUTE FUNCTION sync_asset_usage_from_url('image_url', 'team_members', 'avatar', 'Marketing');
