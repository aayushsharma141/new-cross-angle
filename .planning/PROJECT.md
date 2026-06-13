# Cross Angle Interior SEO & Content Hierarchy Restructure

## What This Is

An architectural and content-level restructuring of the "Cross Angle Interior" web application. The focus is to enhance information architecture (IA), create clear topic clusters (silos), deepen service and project descriptions, and apply modern SEO best practices (schema, header hierarchy, internal contextual linking) to drive more organic discovery and improve conversion funnels. 

## Core Value

Bridge the gap between stunning visual design and high-performance SEO by treating Service Categories as authoritative Pillar Pages and Past Projects as detailed Case Studies, creating a seamless user journey from discovery to lead generation.

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
| Adopt Silo URL Structure | Enforces strict `/services/category/sub-category` paths to signal topical authority to search engines. | — Completed (Phase 2) |
| Project Pages as Case Studies | Galleries need descriptive text and service cross-linking to rank and convert effectively. | — Completed (Phase 3) |
| Unified 5-Stage Process Framework | Standardise on the 5-stage process across the site to avoid confusing premium leads with conflicting models. | — Pending |
| De-duplicate Services and Process Pages | Make `/our-process` the sole detailed home for the methodology. Replace with a teaser banner on `/services`. | — Pending |

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
*Last updated: 2026-06-09 after content audit*
