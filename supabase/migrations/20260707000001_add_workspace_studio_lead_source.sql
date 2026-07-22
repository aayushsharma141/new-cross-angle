-- ═══════════════════════════════════════════════════════════
-- Migration: Add workspace_studio to lead_source_enum
-- OI-001 Resolution: schema mismatch in submit-workspace-commitment
-- ═══════════════════════════════════════════════════════════

ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'workspace_studio';
