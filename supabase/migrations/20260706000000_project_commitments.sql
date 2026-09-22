-- ═══════════════════════════════════════════════════════════
-- Migration: Create workspace project commitments
-- Phase 30C.4: Project Commitment
-- ═══════════════════════════════════════════════════════════

CREATE TABLE workspace_project_commitments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- The 4 core artifacts
    decision_genome jsonb NOT NULL,
    project_snapshot jsonb NOT NULL,
    narrative_brief text NOT NULL,
    workspace_state jsonb NOT NULL,

    -- Versioning for backwards compatibility during re-evaluation
    decision_schema_version text NOT NULL DEFAULT '1.0.0',
    genome_version text NOT NULL DEFAULT '1.0.0',
    recommendation_engine_version text NOT NULL DEFAULT '1.0.0',
    design_system_version text NOT NULL DEFAULT '2.0.0',
    
    -- Identifiers
    session_id uuid,
    lead_id uuid REFERENCES leads(id) ON DELETE SET NULL
);

-- Indexing for lookups
CREATE INDEX idx_workspace_commitments_session ON workspace_project_commitments(session_id);
CREATE INDEX idx_workspace_commitments_lead ON workspace_project_commitments(lead_id);

-- Add comments for documentation
COMMENT ON TABLE workspace_project_commitments IS 'Stores immutable user decisions from the Workspace Digital Studio experience. Derived values (estimates, scores) should be regenerated from the genome rather than treated as authoritative, though a snapshot is kept for reference.';
COMMENT ON COLUMN workspace_project_commitments.decision_genome IS 'The canonical source of truth containing all 13 decision commitments.';
COMMENT ON COLUMN workspace_project_commitments.project_snapshot IS 'Point-in-time snapshot of budget, estimate, confidence, project health, and missing info.';
COMMENT ON COLUMN workspace_project_commitments.narrative_brief IS 'Human-readable summary generated from decision sentences, serving as the design brief.';
COMMENT ON COLUMN workspace_project_commitments.workspace_state IS 'Resume position, AI reasoning, recommendation evidence, and environment state.';
