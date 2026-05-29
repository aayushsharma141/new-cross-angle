-- Add report_recipients JSONB column to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS report_recipients jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN site_settings.report_recipients IS 'Array of email addresses that receive the weekly executive report. Format: ["email1@example.com", "email2@example.com"]';
