-- Migration to add advanced lead scoring columns
-- This builds upon 20240523000001_ai_features.sql which added 'score'

ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_views_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS downloaded_brochure BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(50);

-- Add index for faster sorting/filtering
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
