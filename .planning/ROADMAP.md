# Project Roadmap

This document outlines the phased execution plan for the project.

## Phases

### Phase 1: Quick Wins & Semantic SEO Foundation

**Status**: Complete

**Goals**:

- Ensure all basic semantic HTML tags (H1/H2) are correctly applied and nested.
- Implement immediate UX improvements with high-contrast sticky CTAs.
- Implement immediate SEO wins with FAQ Schema.

**Features**:

- [x] **Fix `<h1>` / `<h2>` / `<h3>` hierarchy.**
  - Audit and fix all H1/H2 tags across the 14 core pages. Ensure every page has exactly one `<h1>` tag containing the primary keyword/title.
  - Correct the heading nesting (e.g., `<h3>` without a preceding `<h2>`) on `ServiceDetailPage.tsx` and `ProjectPage.tsx`.
- [x] **Add missing Schema.org JSON-LD.**
  - Inject FAQ Schema on all service pages utilizing existing content (`service.faq`).
  - (Optional, stretch) Add basic LocalBusiness schema to the footer or contact page.
- [x] **Implement Sticky CTAs.**
  - Add a floating/sticky high-contrast "Consult with us" CTA on mobile and desktop for `ServiceDetailPage.tsx` and `ProjectPage.tsx`.

### Phase 2: URL Restructure & Internal Linking

**Status**: Complete

**Goals**:

- Enforce a strict Hub-and-Spoke (Silo) URL structure for services.
- Improve contextual cross-linking to drive users deeper into the funnels.

**Features**:

- [x] Restructure the URL routing to strictly follow the nested Silo framework (e.g., `/services/residential/living-room`).
- [x] Update all existing internal links to point to the new URL patterns.
- [x] Inject `relatedServices` links contextually into the `longDescription` text of service pages, replacing plain list links with descriptive anchor text.

### Phase 3: Case Studies & Process Pages

**Status**: Complete

**Goals**:

- Upgrade Project pages into fully fleshed-out Case Studies.
- Enhance trust by creating a dedicated process overview.

**Features**:

- [x] Build out comprehensive "Project Detail" pages featuring 300+ words explaining the challenge, solution, and services rendered.
- [x] Interlink Project Detail pages back to relevant Service Detail pages.
- [x] Add a dedicated "Our Process" page describing "How We Work".

### Phase 4: Advanced Features & Local SEO Expansion

**Status**: Complete

**Goals**:

- Capture top-of-funnel and local search traffic.
- Enhance discovery within the Project Hub.

**Features**:

- [x] Implement advanced filtering on the Project Hub (filter by Residential, Commercial, Style, etc.).
- [x] Launch localized landing pages targeting specific geographic service areas.
- [x] Develop deep-dive blog content clustered around the high-margin services.
