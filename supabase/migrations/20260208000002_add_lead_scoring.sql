-- ============================================================================
-- LEAD SCORING ENHANCEMENTS
-- ============================================================================
-- Add columns for lead scoring and engagement tracking

-- Add scoring columns if they don't exist
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'cold' CHECK (priority IN ('hot', 'warm', 'cold')),
ADD COLUMN IF NOT EXISTS project_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downloaded_brochure BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
ADD COLUMN IF NOT EXISTS landing_page TEXT,
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);

-- Create function to increment project views for a lead
CREATE OR REPLACE FUNCTION increment_lead_project_views(lead_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.leads
  SET project_views_count = project_views_count + 1
  WHERE id = lead_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment visit count
CREATE OR REPLACE FUNCTION increment_lead_visits(lead_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.leads
  SET visit_count = visit_count + 1
  WHERE id = lead_id_param;
END;
$$ LANGUAGE plpgsql;
