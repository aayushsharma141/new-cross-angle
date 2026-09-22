-- Performance indexes for portfolio queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='slug') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='tags') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
  END IF;
END $$;