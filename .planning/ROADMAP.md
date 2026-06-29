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
| 18 | Workspace Skeleton (A1) | Implement 3-column responsive layout (Sidebar \| Workspace \| Dossier) and ultra-wide breakpoints. | UX-01 | Done |
| 19 | Project Dossier Framework (A2) | Mount placeholder cards into Dossier and connect to store state (no intelligence). | UX-01 | Done |
| 20 | Adaptive Step Layouts (B) | Refactor Estimator Steps 1-7 into distinct task-driven layouts obeying "One Primary Decision". | UX-02 | Pending |
| 21 | Workspace Intelligence (C) | Implement logic for Live Estimate, Confidence, Missing Information, and Project Health. | UX-03 | Pending |
| 22 | Recommendation Explainability (D) | Build core reasoning engine explaining why packages are recommended. | INTEL-03, INTEL-04 | Pending |
| 23 | Decision Impact Engine (E) | Expose reasoning as immediate live trade-offs (Financial, Operational, etc.) upon selection. | UX-04 | Pending |
| 24 | Project Blueprint Generation (F) | Transition active workspace into final, printable/shareable result document. | UX-05 | Pending |

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

### Phase 18: Workspace Skeleton (Phase A1)
**Goal:** Build the strict 3-column responsive layout (Sidebar | Workspace | Dossier) and establish ultra-wide (1800px+) max-width bounds. No logic or widgets—just plumbing and structure.
**Requirements:** UX-01
**Status:** Done

### Phase 19: Project Dossier Framework (Phase A2)
**Goal:** Mount placeholder cards (`EstimateCard`, `ProjectHealthCard`, etc.) into the Dossier and connect them to the global state store without adding calculation logic.
**Requirements:** UX-01
**Status:** Done

### Phase 20: Adaptive Step Layouts (Phase B)
**Goal:** Refactor Steps 1-7 into their specific, task-driven layouts (Grid, Dashboard, Comparison Matrix). Enforce the "One Primary Decision" rule.
**Requirements:** UX-02
**Status:** Planned

### Phase 21: Workspace Intelligence (Phase C)
**Goal:** Connect logic and store values to populate the Live Estimate, Confidence score, Missing Information prompts, and Project Health dashboard.
**Requirements:** UX-03
**Status:** Planned

### Phase 22: Recommendation Explainability (Phase D)
**Goal:** Build the core reasoning engine that determines *why* certain packages are recommended (this merges previous Phase 15 goals into the workspace).
**Requirements:** INTEL-03, INTEL-04
**Status:** Planned

### Phase 23: Decision Impact Engine (Phase E)
**Goal:** Expose the reasoning from Phase 22 as live trade-offs (Financial, Operational, Lifestyle, Investment) reflecting the immediate impact of user selections.
**Requirements:** UX-04
**Status:** Planned

### Phase 24: Project Blueprint Generation (Phase F)
**Goal:** Transition the active workspace into a final, printable/shareable project blueprint result document.
**Requirements:** UX-05
**Status:** Planned
