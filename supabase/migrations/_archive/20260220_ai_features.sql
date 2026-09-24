-- Add score columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_details JSONB DEFAULT '{}'::jsonb;

-- Add views column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create RPC function to increment project views atomically
CREATE OR REPLACE FUNCTION increment_project_view(project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET views = views + 1
  WHERE id = project_id;
END;
$$;
