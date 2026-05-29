-- Align lead_status_enum with CRM pipeline stages (single source of truth)
-- Old enum: new, contacted, qualified, proposal, won, lost
-- New stages: new, in_conversation, meeting_planned, quote_sent, closing, won, lost

BEGIN;

-- Drop the old enum type and recreate (safe because data was already migrated in 20260528140000)
ALTER TABLE leads ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS lead_status_enum;
CREATE TYPE lead_status_enum AS ENUM (
  'new', 'in_conversation', 'meeting_planned', 'quote_sent', 'closing', 'won', 'lost'
);
ALTER TABLE leads ALTER COLUMN status TYPE lead_status_enum USING status::lead_status_enum;
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new'::lead_status_enum;

COMMIT;
