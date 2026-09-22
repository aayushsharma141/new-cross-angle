-- ═══════════════════════════════════════════════════════════
-- Migration: Add decision_events table
-- Phase 17: Project Intelligence Workspace
-- ═══════════════════════════════════════════════════════════

CREATE TABLE decision_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('Meeting', 'Call', 'Proposal', 'Revision', 'SiteVisit', 'Approval', 'Handover')),
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE decision_events IS 'Stores the outcome of human validation (designer or client) of AI recommendations to feed back into the Decision Intelligence flywheel.';

-- Set up RLS
ALTER TABLE decision_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert decision_events"
  ON decision_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can select decision_events"
  ON decision_events FOR SELECT
  TO authenticated
  USING (true);

-- Index for querying by lead
CREATE INDEX idx_decision_events_lead_id ON decision_events(lead_id);
