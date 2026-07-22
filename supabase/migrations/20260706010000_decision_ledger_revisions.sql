-- ═══════════════════════════════════════════════════════════
-- Migration: Decision Ledger (Commitment Revisions)
-- Phase 30.5.1: Learning Engine Data Structure
-- ═══════════════════════════════════════════════════════════

-- Rename existing table to act as the revisions (ledger)
ALTER TABLE workspace_project_commitments RENAME TO workspace_commitment_revisions;

-- Add versioning and ledger tracking columns
ALTER TABLE workspace_commitment_revisions
  ADD COLUMN commitment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN previous_revision_id uuid REFERENCES workspace_commitment_revisions(id) ON DELETE SET NULL,
  ADD COLUMN is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN locked_at timestamptz,
  ADD COLUMN recommendation_id uuid, -- Link back to AI recommendation if applied
  ADD COLUMN divergence_score numeric(5, 2); -- 0-100 similarity score when locked

-- Update comments
COMMENT ON TABLE workspace_commitment_revisions IS 'Append-only Decision Ledger storing every revision of a workspace commitment. Analogous to git commits.';
COMMENT ON COLUMN workspace_commitment_revisions.commitment_id IS 'Logical grouping ID for a single thread of decisions (the "branch").';
COMMENT ON COLUMN workspace_commitment_revisions.is_locked IS 'True when the designer formally locks the commitment and presents it to the client.';
COMMENT ON COLUMN workspace_commitment_revisions.divergence_score IS 'Computed similarity between the final locked state and the original AI recommendation.';

-- Add index on commitment_id
CREATE INDEX idx_workspace_revisions_commitment ON workspace_commitment_revisions(commitment_id);
