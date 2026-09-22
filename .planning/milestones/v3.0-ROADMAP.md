# Project Roadmap

## Completed Milestones
- [v2.0 DAM V3 Architecture Redesign](./milestones/v2.0-ROADMAP.md)

## Current Milestone: v3.0 DAM V3 Workspace

**6 phases** | **17 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 5 | Asset Workspace | Replace the restrictive `MediaDetailsSheet` with a full-page Asset Workspace that orbits around a single asset's lifecycle and context. | WS-01, WS-02, WS-03, WS-04 | 3 |
| 6 | Universal Asset Picker | Redesign the contextual media selection flow to prioritize reuse over re-uploading. | PICK-01, PICK-02 | 2 |
| 7 | Discovery Integration | Use the Discovery Engine as the primary consumer of the new DAM to prove its value, validate architecture, and eliminate hardcoded assets. | DISC-01, DISC-02, DISC-03 | 2 |
| 8 | Collection Workspace | Elevate collections to a first-class view in the sidebar, supporting bulk operational flows. | COLL-01, COLL-02, COLL-03 | 1 |
| 9 | Archive & Governance | Protect the integrity of the usage graph via soft deletion and usage checks. | GOV-01, GOV-02, GOV-03 | 2 |
| 10 | Search & Intelligence | Ensure the system scales elegantly from 100 assets to 5,000+ assets with faceted search and intelligence. | INT-01, INT-02 | 2 |

---

## Phase Details

### Phase 5: Asset Workspace
**Goal:** Replace the restrictive `MediaDetailsSheet` with a full-page Asset Workspace that orbits around a single asset's lifecycle and context.
**Requirements:** WS-01, WS-02, WS-03, WS-04
**Success criteria:**
1. Editor can answer "Where is this used?" within 2 clicks.
2. Editor can answer "Which version is live?" within 2 clicks.
3. Editor can replace asset without breaking references.

### Phase 6: Universal Asset Picker
**Goal:** Redesign the contextual media selection flow to prioritize reuse over re-uploading.
**Requirements:** PICK-01, PICK-02
**Success criteria:**
1. Editor workflow becomes "Choose Existing" before "Upload New" at every media selection point.
2. Reuse rate becomes possible and measurable.

### Phase 7: Discovery Integration
**Goal:** Use the Discovery Engine as the primary consumer of the new DAM to prove its value, validate architecture, and eliminate hardcoded assets.
**Requirements:** DISC-01, DISC-02, DISC-03
**Success criteria:**
1. Discovery uses DAM assets for Archetype Hero, Moodboard, Reflection, and Visual Prompt.
2. No hardcoded archetype images remain in the codebase.

### Phase 8: Collection Workspace
**Goal:** Elevate collections to a first-class view in the sidebar, supporting bulk operational flows.
**Requirements:** COLL-01, COLL-02, COLL-03
**Success criteria:**
1. Editor can upload "Luxury Villa Shoot" as one collection, not 50 individual uploads.

### Phase 9: Archive & Governance
**Goal:** Protect the integrity of the usage graph via soft deletion and usage checks.
**Requirements:** GOV-01, GOV-02, GOV-03
**Success criteria:**
1. No asset can be accidentally removed while still in use.
2. Archive becomes default. Delete becomes exceptional.

### Phase 10: Search & Intelligence
**Goal:** Ensure the system scales elegantly from 100 assets to 5,000+ assets with faceted search and intelligence.
**Requirements:** INT-01, INT-02
**Success criteria:**
1. System remains performant and navigable at 5,000+ assets.
2. Editor can instantly surface unused assets for cleanup or reuse.
