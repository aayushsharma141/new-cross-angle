# Project Roadmap

## Completed Milestones
- [v2.0 DAM V3 Architecture Redesign](./milestones/v2.0-ROADMAP.md)
- [v3.0 DAM V3 Workspace](./milestones/v3.0-ROADMAP.md) (shipped 2026-06-24)

## Current Milestone: v4.0 Discovery & Estimator Operating System

**3 phases** | **6 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 11 | Discovery Workspace V2 | Establish a unified CMS control panel for configuring all Discovery Archetypes, questions, and assets. | DISC-CONFIG-01, DISC-CONFIG-02 | 2 |
| 12 | Estimator Workspace | Create an admin workspace for managing estimator formulas, property types, pricing coefficients, and design packages. | EST-CONFIG-01, EST-CONFIG-02 | 2 |
| 13 | Connected Handoff Pipeline | Bind Discovery style results directly to the Estimator pre-fills, delivering a seamless client funnel. | HANDOFF-01, HANDOFF-02 | 2 |

---

## Phase Details

### Phase 11: Discovery Workspace V2
**Goal:** Establish a unified CMS control panel for configuring all Discovery Archetypes, questions, and assets.
**Requirements:** DISC-CONFIG-01, DISC-CONFIG-02
**Success criteria:**
1. Administrator can edit Discovery quiz questions and choices without code modification.
2. Administrator can map new DAM assets to Archetypes directly in the admin dashboard.

### Phase 12: Estimator Workspace
**Goal:** Create an admin workspace for managing estimator formulas, property types, pricing coefficients, and design packages.
**Requirements:** EST-CONFIG-01, EST-CONFIG-02
**Success criteria:**
1. Administrator can adjust property type size bounds and package price multipliers from the UI.
2. Pricing logic updates dynamically in the customer estimator upon saving changes in the admin panel.

### Phase 13: Connected Handoff Pipeline
**Goal:** Bind Discovery style results directly to the Estimator pre-fills, delivering a seamless client funnel.
**Requirements:** HANDOFF-01, HANDOFF-02
**Success criteria:**
1. Completing the Discovery quiz pre-populates the customer's style archetype and default options in the Estimator.
2. The unified lead profile is saved to the CRM showing matched style preferences alongside custom quote requirements.
