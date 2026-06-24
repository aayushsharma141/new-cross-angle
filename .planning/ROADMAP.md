# Project Roadmap

## Completed Milestones
- [v2.0 DAM V3 Architecture Redesign](./milestones/v2.0-ROADMAP.md)
- [v3.0 DAM V3 Workspace](./milestones/v3.0-ROADMAP.md) (shipped 2026-06-24)
- [v4.0 Discovery & Estimator Operating System](./milestones/v4.0-ROADMAP.md) (shipped 2026-06-25)

---

## Current Milestone: v5.0 Lead Intelligence & Recommendation Layer

**Goal:** Maximize the value flowing through the Discovery → Estimator → CRM pipeline by making recommendations signal-weighted, explainable, and actionable for the sales and design team.

**5 phases** | **8 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 14 | Signal-Weighted ALCS | Wire `sensory.*` + `priorities.emotionalWeights` into ALCS path scoring and reasoning — two users with same archetype but different sensory profiles receive different strategy and reasoning | INTEL-01, INTEL-02 | Done |
| 15 | Recommendation Explainability | Attach a structured `evidence[]` array to every recommendation, expose it in the CRM lead detail panel | INTEL-03, INTEL-04 | Pending |
| 16 | Designer Briefing Card | Auto-generate a pre-call brief from the CRM lead record with archetype context, hero rooms, sensory language, and conversation starters | INTEL-05 | Pending |
| 17 | Project Intelligence Workspace | Evolve the CRM to actively prepare the designer: Conversation Strategy, Objection Predictions, Presentation Sequence, and Proposal Generation. Building paused pending Phase 16 user validation sprint. | INTEL-06, INTEL-07 | Paused for Validation |

---

## Phase Details

### Phase 14: Signal-Weighted ALCS
**Goal:** Wire `sensory.*` and `priorities.emotionalWeights` into the ALCS recommendation engine so that two users with the same archetype but different sensory profiles receive meaningfully different path scores and reasoning text.
**Requirements:** INTEL-01, INTEL-02
**Success criteria:**
1. User A (Natural Light + Organic Textures + Quiet Retreat) and User B (Statement Lighting + Luxury Hosting), same archetype and budget, produce different top-ranked execution paths in `scorePaths()`.
2. `generateReasoning()` output includes at least one archetype-specific sensory signal (e.g. lighting preference or luxury language).
3. All existing ALCS engine outputs (`computeLifestyleDensity`, `computePropertySuitability`, etc.) produce identical results to pre-change (no regression).

### Phase 15: Recommendation Explainability
**Goal:** Attach a structured `evidence[]` array to every `AIRecommendationResult` and display it in the CRM Lead Detail drawer so designers can answer "Why did the system recommend this?" without guessing.
**Requirements:** INTEL-03, INTEL-04
**Success criteria:**
1. Every `AIRecommendationResult` object contains an `evidence` array with at least 3 `RecommendationEvidence` entries (signal, score, influence, source, rationale).
2. The CRM Lead Detail drawer shows a collapsible "Why this recommendation?" section listing each evidence item.
3. Evidence entries are sourced from sensory, lifestyle, property, and archetype dimensions — not generic.

### Phase 16: Designer Briefing Card
**Goal:** Auto-generate a pre-call design brief from the CRM lead record that a designer can read in 5 minutes before calling the lead.
**Requirements:** INTEL-05
**Success criteria:**
1. Any lead with `discovery_archetype` populated shows a "Generate Brief" button in the CRM Lead Detail drawer.
2. The brief renders: identity (name, archetype, confidence), lifestyle (family, hosting, WFH), spatial intent (hero rooms with weights), sensory language (lighting, textures, luxury mode), sales conversation starters, and watch-for signals.
3. Brief is printable (or downloadable as text) from the admin panel.

### Phase 17: Project Intelligence Workspace
**Goal:** Evolve the CRM into a complete workspace where the designer opens one screen before every client meeting, and everything needed to prepare is there. Features include: Conversation Strategy, Objection Predictions, Presentation Sequence, and Proposal Generator.
**Requirements:** INTEL-06, INTEL-07
**Status:** ⏸️ **Paused.** Awaiting real-world user feedback from the Phase 16 Designer Brief Product Validation Sprint (recorded in `VALIDATION-SPRINT.md`). This feedback will shape the implementation of the Workspace.

