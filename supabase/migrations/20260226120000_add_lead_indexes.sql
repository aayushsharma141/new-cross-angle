-- Performance indexes for lead queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='lead_source') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='city') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='status') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
  END IF;
END $$;