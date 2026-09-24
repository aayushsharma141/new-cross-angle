-- ═══════════════════════════════════════════════════════════
-- Migration: Add workspace_studio to lead_source_enum
-- OI-001 Resolution: schema mismatch in submit-workspace-commitment
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source_enum') THEN
    ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'workspace_studio';
  END IF;
END $$;
