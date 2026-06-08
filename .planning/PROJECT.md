# Cross Angle Interior SEO & Content Hierarchy Restructure

## What This Is

An architectural and content-level restructuring of the "Cross Angle Interior" web application. The focus is to enhance information architecture (IA), create clear topic clusters (silos), deepen service and project descriptions, and apply modern SEO best practices (schema, header hierarchy, internal contextual linking) to drive more organic discovery and improve conversion funnels. 

## Core Value

Bridge the gap between stunning visual design and high-performance SEO by treating Service Categories as authoritative Pillar Pages and Past Projects as detailed Case Studies, creating a seamless user journey from discovery to lead generation.

## Requirements

### Validated

- ✓ Basic UI and component architecture exists in the `apps/web` React monorepo.
- ✓ Primary navigation structure (Home > Services > Projects > Contact) is functional.

### Active

- [ ] Audit and fix all H1/H2 tags across the 14 core pages.
- [ ] Inject `relatedServices` links contextually into the `longDescription` text of service pages instead of just listing them at the bottom.
- [ ] Add JSON-LD FAQ schema to all Service Detail pages utilizing existing FAQ data.
- [ ] Build out comprehensive "Project Detail" pages (300+ words of text explaining the challenge, solution, and services rendered, linked to service pages).
- [ ] Restructure the URL routing to strictly follow the nested Silo framework (e.g., `/services/residential/living-room`).
- [ ] Add a dedicated "Our Process" page to enhance trust.
- [ ] Launch localized landing pages targeting specific neighborhoods or cities.
- [ ] Develop deep-dive blog content clustered around high-margin services.
- [ ] Implement advanced filtering on the Project Hub (filter by Residential, Commercial, Style, etc.).
- [ ] Add sticky, high-contrast "Consult with us" CTAs on every Service and Project page.

### Out of Scope

- [Full Website Redesign] — The current visual UI style is modern and premium; the focus is primarily on underlying content structure, routing, and SEO semantics.

## Context

The site's current IA follows a standard shallow hierarchy which is missing depth required for competitive SEO. Galleries without contextual text offer zero SEO value. Users might see a beautiful kitchen but not know how to request that specific design. Fixing the interconnectedness of content (linking a beautiful photo directly to "Custom Furniture") will improve both the user journey and search engine crawling efficiency.

## Constraints

- **Routing Framework**: Must use the existing router in `apps/web` (React Router) but adapt paths to the new silo structures.
- **Visual Design**: The premium, image-forward aesthetic must be preserved while adding necessary text blocks for context.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adopt Silo URL Structure | Enforces strict `/services/category/sub-category` paths to signal topical authority to search engines. | — Pending |
| Project Pages as Case Studies | Galleries need descriptive text and service cross-linking to rank and convert effectively. | — Pending |

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
*Last updated: 2026-06-08 after initialization*
