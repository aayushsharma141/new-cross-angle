-- Performance indexes for lead queries
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);