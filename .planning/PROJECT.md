# Cross Angle Interior Web Application

## Current State

**Shipped Version:** v3.0 (DAM V3 Workspace)

**Recent Accomplishments:**
- Replaced the restrictive `MediaDetailsSheet` with a full-page Asset Workspace mapping versions, usages, metadata, and replacements.
- Redesigned the contextual media selection flow into a Universal Asset Picker prioritizing asset reuse over re-uploading.
- Integrated the DAM into the Discovery Engine to resolve Archetype Hero, Moodboard, Reflection, and Visual Prompt media dynamically.
- Implemented the Collection Workspace supporting bulk uploads and collection-level management.
- Implemented Archive & Governance workflows using soft deletion and usage checks to protect integrity of the usage graph.
- Delivered Search & Intelligence workflows including client-side duplicate grouping, tags index, and faceted search UI.

## Current Milestone: v5.0 Lead Intelligence & Recommendation Layer

**Goal:** Maximize the value flowing through the Discovery → Estimator → CRM pipeline by making recommendations signal-weighted, explainable, and actionable for the sales and design team.

**Target features:**
- **Semantic Token Architecture & Adoption Audit**: Complete primitive style system and migrate global CSS.
- **Room Migration**: Port Entrance, Gallery, and Workspace to the primitive layout block system.
- **Workspace Intelligence & Recommendation Engine**: Signal-weighted paths, confidence scoring, explainability evidence ledger, and real-time decision trade-off impact.
- **Production Readiness Audit**: Final visual and structural quality check.

<details>
<summary>Archive: v4.0 Discovery & Estimator Operating System</summary>

**Goal:** Connect Discovery and Estimator systems into a single configurable visual operating system and lead-qualification funnel.

**Target features:**
- **Discovery Workspace V2**: Full admin configuration system for Archetypes, Visual Prompts, Reflections, Moodboards, Lifestyle Scenarios, Result Pages, and CTA Assets.
- **Estimator Workspace**: Configuration engine for Property Types, Packages, Addons, Pricing Logic, Visual Assets, and Result Templates.
- **Discovery → Estimator Handoff**: Automated transfer of user style archetype, budget indicators, and design preferences to pre-fill the Estimator questionnaire.

</details>

<details>
<summary>Archive: v3.0 DAM V3 Workspace</summary>

**Goal:** Transition the CMS Media Library from an "FTP Client" (Upload, Grid, Delete) to a true "Asset Workspace" (Assets, Collections, Usage, Versions, Relationships) acting as the visual operating system for editors.

**Target features:**
- Asset Workspace (Usage Panel, Versions Panel, Replace Operations).
- Universal Asset Picker (prioritize reuse over re-uploading).
- Discovery Integration (DAM powers Discovery visuals).
- Collection Workspace (first-class collections view, bulk uploads).
- Archive & Governance (soft deletion, usage protection).
- Search & Intelligence (faceted search, intelligence dashboards).

</details>

<details>
<summary>Archive: v2.0 DAM V3 Architecture Redesign</summary>

**Goal:** Transition from a legacy URL-string media storage system to a robust, identity-based Asset → Usage → Entity Digital Asset Management architecture.

**Target features:**
- Centralized `Asset` tracking (prevent orphan files).
- Role-based `AssetUsage` references (no more hardcoded `project_hero` columns).
- Future-proof lineage via `parent_asset_id` for AI derivations.
- Zero-downtime Strangler Fig migration protocol.

</details>

## What This Is

The "Cross Angle Interior" platform has evolved from a simple visual CMS into a **Design Intelligence Flywheel**. 

**North Star Vision:**
> *The platform exists to help professionals make better decisions today while ensuring every validated decision makes the organization better tomorrow.*

**The Seven Verbs (every module fits one):** `Capture → Understand → Recommend → Execute → Measure → Learn → Improve`

> See [CONSTITUTION.md](./.planning/CONSTITUTION.md) for the ten immutable laws that all future features, models, and workflows must obey. That document does not change with roadmap iterations.

## The Architecture (Four Types of Intelligence)

The platform separates cleanly into four layers of intelligence:

1. **Operational Intelligence ("What is happening?")**
   - DAM, CRM, Projects, Tasks
2. **Decision Intelligence ("What should we do?")**
   - ALCS, Recommendations, Designer Workspace
3. **Institutional Intelligence ("What have we learned?")**
   - Insights, Patterns, Benchmarks, Playbooks
4. **Strategic Intelligence ("What should we become?")**
   - Business strategy, Pricing models, Service packages, Market positioning

*Note: In V7 and beyond, modules (DAM, CRM, Estimator) cease to be separate apps and instead become "Sensors" that capture specific evidence for the intelligence graph.*

## Core Value

The core value proposition is not artificial intelligence, but **Evidence**. The ultimate asset is the compounding flywheel of: `Observation → Hypothesis → Recommendation → Decision → Outcome → Insight`. 

When ALCS makes a recommendation, it will provide complete explainability (e.g., *"Based on Insight #42, derived from 184 validated projects, supported by 3,926 observations"*). This traceability builds trust that a black-box AI never can.

## Long-Term Evolution

The platform's lifecycle follows four primary epochs. The ultimate competitive moat is the closed learning loop.

- **V1–V3 (The Operating System):** CMS, DAM, and Discovery. Building the infrastructure to capture data cleanly.
- **V4–V5 (Decision Intelligence):** ALCS, CRM, and the Project Intelligence Workspace. Delivering real-time insights to improve the designer's workflow.
- **V6 (Institutional Intelligence):** Building organizational memory. Curating insights from project outcomes.
- **V7+ (Strategic Intelligence):** Business-level optimization. Using the intelligence graph to refine pricing, hiring, and market positioning.

**Critical Rule for V6+:** *The platform must never automatically learn from every completed project.* Learning must be curated by designers validating that a recommendation genuinely worked.

## The Decisive Filter

For the next decade of development, every proposed feature must pass this test:

> **Every feature must either capture evidence, generate insight, support a decision, or measure an outcome. If it does none of those four things, it doesn't belong in the platform.**

## Requirements

### Validated

- ✓ Basic UI and component architecture exists in the `apps/web` React monorepo.
- ✓ Primary navigation structure (Home > Services > Projects > Contact) is functional.
- ✓ H1/H2 semantic tags audited and fixed across 14 pages (Phase 1).
- ✓ Contextual related services internal links injected (Phase 2).
- ✓ FAQ JSON-LD schema added to service detail pages (Phase 1).
- ✓ Project detail pages converted to fully structured case studies (Phase 3).
- ✓ URL routing structure updated to Silo framework (Phase 2).
- ✓ Dedicated "Our Process" page created (Phase 3).
- ✓ Localised landing pages launched (Phase 4).
- ✓ Blog content clusters developed (Phase 4).
- ✓ Project Hub advanced filtering implemented (Phase 4).
- ✓ Sticky, high-contrast CTAs added (Phase 1).

### Active

- [ ] **Unify Process Page to 5-Stage Framework.**
  - Re-write/update `OurProcessPage.tsx` to use the 5-stage timeline from `Process.tsx` instead of the redundant 4-phase setup.
- [ ] **De-duplicate Services Page.**
  - Remove `<ServicesProcess />` and `<OurApproach />` from `ServicesPage.tsx`. Add a high-end teaser banner directing users to `/our-process`.
- [ ] **Implement safe JSON-LD Schema escaping.**
  - Modify the `SchemaMarkup` components to run a safe JSON serialization helper to prevent script injection or parsing issues.

### Out of Scope

- [Full Website Redesign] — The current visual UI style is modern and premium; the focus is primarily on underlying content structure, routing, and SEO semantics.

## Context

The site's current IA follows a standard shallow hierarchy which is missing depth required for competitive SEO. Galleries without contextual text offer zero SEO value. Users might see a beautiful kitchen but not know how to request that specific design. Fixing the interconnectedness of content (linking a beautiful photo directly to "Custom Furniture") will improve both the user journey and search engine crawling efficiency.

We are now aligning the process pages and eliminating duplicate content widgets across secondary routes.

## Constraints

- **Routing Framework**: Must use the existing router in `apps/web` (React Router) but adapt paths to the new silo structures.
- **Visual Design**: The premium, image-forward aesthetic must be preserved while adding necessary text blocks for context.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adopt Silo URL Structure | Enforces strict `/services/category/sub-category` paths to signal topical authority to search engines. | - Completed (Phase 2) |
| Project Pages as Case Studies | Galleries need descriptive text and service cross-linking to rank and convert effectively. | - Completed (Phase 3) |
| Unified 5-Stage Process Framework | Standardise on the 5-stage process across the site to avoid confusing premium leads with conflicting models. | - Pending |
| De-duplicate Services and Process Pages | Make `/our-process` the sole detailed home for the methodology. Replace with a teaser banner on `/services`. | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-25 after v4.0 milestone start*
