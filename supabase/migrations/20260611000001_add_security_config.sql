-- Add security_config JSONB column to site_settings for 2FA enforcement,
-- session timeout, and other access-control preferences.

DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'site_settings'
) THEN
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS security_config JSONB
  DEFAULT '{"enforce_2fa": false, "session_timeout_minutes": 30}'::jsonb;
EXECUTE 'COMMENT ON COLUMN site_settings.security_config IS ''Security preferences: enforce_2fa (boolean), session_timeout_minutes (number).''';
END IF;
END $$;
