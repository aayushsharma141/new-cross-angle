# Engineering Roadmap v1 (Archived)

This document is a historical archive representing the transition period before the project pivoted from building software features to running production learning operations and governance.

## Completed Milestones
- [v2.0 DAM V3 Architecture Redesign](../milestones/v2.0-ROADMAP.md)
- [v3.0 DAM V3 Workspace](../milestones/v3.0-ROADMAP.md) (shipped 2026-06-24)
- [v4.0 Discovery & Estimator Operating System](../milestones/v4.0-ROADMAP.md) (shipped 2026-06-25)

---

## Milestone: v5.0 Lead Intelligence & Recommendation Layer

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 18 | Workspace Skeleton (A1) | Implement 3-column responsive layout (Sidebar \| Workspace \| Dossier) and ultra-wide breakpoints. | UX-01 | Done |
| 19 | Project Dossier Framework (A2) | Mount placeholder cards into Dossier and connect to store state (no intelligence). | UX-01 | Done |
| 25 | Semantic Token Architecture | Establish three-layer token system (Foundation → Semantic → Lighting States) required by all UI phases. | DLS-01 | Done |
| 26 | Token Adoption Audit | Build and execute static analysis scripts to measure token adoption and audit code. | DLS-02 | Done |
| 27 | Design Decision Mining | Analyze and cluster hardcoded properties into a DESIGN_GENOME.md of canonical design intents. | DLS-03 | Done |
| 28 | Primitive System | Build Primitive system in 3 sub-phases: Foundation (28A), Interactive (28B), Composite (28C) with Genome IDs. | DLS-04 | Done |
| 29 | Global Foundation | Migrate global CSS (index.css, tailwind, layout, utilities) to the primitive system. | DLS-05 | Done |
| 30 | Room Migration | Migrate pages in order: Entrance, Gallery, Workspace (30A-30C Done, 30D Pending). | DLS-06 | Done |
| 30.5 | Production Readiness Audit | Validate end-to-end journey, CRM integration, Supabase persistence, and performance. | DLS-06.5 | Completed |
| 31 | Composition Optimization | Refine composed patterns from primitive components across rooms. | DLS-07 | Frozen |
| 32 | Motion Polish | Implement intent-centric motion (Reveal, Hover, Transition, Loading, Feedback, Scroll). | DLS-08 | Frozen |
| 33 | Visual QA | Final cross-browser/responsive visual quality assurance and regression checks. | DLS-09 | Frozen |
| 20 | Adaptive Step Layouts (B) | Refactor Estimator Steps 1-7 into distinct task-driven layouts obeying "One Primary Decision". | UX-02 | Retired |
| 21 | Workspace Intelligence (C) | Implement logic for Live Estimate, Confidence, Missing Information, and Project Health. | UX-03 | Done |
| 22 | Recommendation Explainability (D) | Build core reasoning engine explaining why packages are recommended. | INTEL-03, INTEL-04 | Done |
| 23 | Decision Impact Engine (E) | Expose reasoning as immediate live trade-offs (Financial, Operational, etc.) upon selection. | UX-04 | Done |
| 24 | Project Blueprint Generation (F) | Transition active workspace into final, printable/shareable result document. | UX-05 | Done |

---

## Phase Details

### Phase 18: Workspace Skeleton (Phase A1)
**Goal:** Build the strict 3-column responsive layout (Sidebar | Workspace | Dossier) and establish ultra-wide (1800px+) max-width bounds. No logic or widgets—just plumbing and structure.
**Status:** Done

### Phase 19: Project Dossier Framework (Phase A2)
**Goal:** Mount placeholder cards (`EstimateCard`, `ProjectHealthCard`, etc.) into the Dossier and connect them to the global state store without adding calculation logic.
**Status:** Done

### Phase 26: Token Adoption Audit
**Goal:** Build and execute static analysis scripts to measure token adoption and audit code.
**Status:** Done

### Phase 27: Design Decision Mining
**Goal:** Mine the codebase for existing design decisions (colors, typography, geometry, layouts, motion) and cluster them into canonical intent patterns.
**Status:** Done

### Phase 28: Primitive System
**Goal:** Build the Primitive visual layout block system strictly from the extracted Design Genome, phased in steps (Foundation, Validation, Interactive, Composite).
**Status:** Done

### Phase 29: Incremental Global Foundation Migration
**Goal:** Migrate infrastructure and UI incrementally to minimize blast radius and ensure measurable compliance gains.
**Status:** Done

### Phase 30: Room Migration
**Goal:** Migrate application pages ("Rooms") to strictly use the new Pattern/Primitive architecture in isolated, sequential steps.
**Status:** Done (30A, 30B, 30C Complete. 30D Material Library / Consultation Pending)

### Phase 30.5: Production Readiness Audit
**Goal:** The final gate between architecture completion and product hardening. Validate E2E journey, CRM, persistence, and performance.
**Status:** Completed

### Phase 31: Composition Optimization
**Goal:** Refine the composition library by composing primitives into recurring structures across the application.
**Status:** Frozen

### Phase 32: Motion Polish
**Goal:** Implement intent-centric motion defined in the Design Genome.
**Status:** Frozen

### Phase 33: Visual QA
**Goal:** Ensure the design system evolution has not degraded quality on any viewport or state.
**Status:** Frozen
