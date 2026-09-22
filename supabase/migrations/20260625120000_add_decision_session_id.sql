-- ═══════════════════════════════════════════════════════════
-- Migration: Add session_id to decision_events
-- ═══════════════════════════════════════════════════════════

ALTER TABLE decision_events 
ADD COLUMN session_id uuid;

CREATE INDEX idx_decision_events_session_id ON decision_events(session_id);

COMMENT ON COLUMN decision_events.session_id IS 'Groups multiple decision events (e.g., Acceptances, Debriefs) into a single logical meeting session for chronolgical reconstruction.';
