-- ═══════════════════════════════════════════════════════════
-- Migration: Add Discovery Intelligence columns to leads
-- Phase 13: Discovery → Estimator → CRM pipeline
-- ═══════════════════════════════════════════════════════════
--
-- When a user completes the Discovery quiz before the Estimator,
-- the submit-estimate edge function now forwards the DiscoveryHandoff
-- payload. These columns capture the full psychological profile so
-- designers can see archetype + signals on the CRM record during
-- the sales call \u2014 no need to ask "what kind of space do you want?".
--
-- All columns are nullable. Leads captured without a prior Discovery
-- session (direct Estimator users) will have these set to null.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE leads
  -- Archetype classification (e.g. "The Warm Modernist")
  ADD COLUMN IF NOT EXISTS discovery_archetype text,

  -- ALCS confidence score 0.0\u20131.0 (e.g. 0.92 = 92%)
  ADD COLUMN IF NOT EXISTS discovery_confidence numeric(5,4),

  -- Resolved emotional goal sentence from ALCS
  ADD COLUMN IF NOT EXISTS discovery_emotional_goal text,

  -- Full lifestyle signals: members, familyType, hostingFreq,
  -- cookingRole, workFromHome, children, petsPresent, hobbies
  ADD COLUMN IF NOT EXISTS discovery_lifestyle jsonb,

  -- Room priorities: mustHave[], niceToHave[], emotionalWeights{}
  ADD COLUMN IF NOT EXISTS discovery_priorities jsonb,

  -- Sensory profile: lighting, textures, luxuryResolvedAs, scalePreference
  ADD COLUMN IF NOT EXISTS discovery_sensory jsonb,

  -- Contradiction signals detected by ALCS (e.g. intent vs visual conflict)
  ADD COLUMN IF NOT EXISTS discovery_contradictions jsonb;

-- Index for admin CRM filtering by archetype
CREATE INDEX IF NOT EXISTS idx_leads_discovery_archetype
  ON leads (discovery_archetype)
  WHERE discovery_archetype IS NOT NULL;

-- Partial index for "all discovery-linked leads"
CREATE INDEX IF NOT EXISTS idx_leads_has_discovery
  ON leads (id)
  WHERE discovery_archetype IS NOT NULL;

-- Comment columns for documentation
COMMENT ON COLUMN leads.discovery_archetype IS 'Aesthetic archetype from Discovery quiz (e.g. "The Warm Modernist"). Null if user skipped Discovery.';
COMMENT ON COLUMN leads.discovery_confidence IS 'ALCS engine confidence score 0\u20131 for archetype classification. Null if no Discovery session.';
COMMENT ON COLUMN leads.discovery_emotional_goal IS 'Plain-language emotional goal resolved by ALCS (e.g. "Layered warmth in structured modern design").';
COMMENT ON COLUMN leads.discovery_lifestyle IS 'UserSignals.lifestyle sub-object: family size, hosting frequency, cooking role, WFH, children, pets.';
COMMENT ON COLUMN leads.discovery_priorities IS 'UserSignals.priorities: mustHave[], niceToHave[], emotionalWeights per room.';
COMMENT ON COLUMN leads.discovery_sensory IS 'UserSignals.sensory: lighting preference, texture preferences, luxury resolution mode.';
COMMENT ON COLUMN leads.discovery_contradictions IS 'ALCS-detected conflicts between stated intent and visual/sensory signals.';
