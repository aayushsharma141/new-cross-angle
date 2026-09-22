# Definition of Done (DoD)

| Document Metadata | Detail |
|:------------------|:-------|
| **Scope**         | All CrossAngle Public Surfaces, Applications, & Components |
| **Authority**     | [DESIGN_PLAYBOOK.md (v3.1)](file:///E:/main/DESIGN_PLAYBOOK.md) |
| **Status**        | **Active Governance Gate** |
| **Last Updated**  | 2026-08-06 |

---

## Purpose

This checklist is the non-negotiable exit gate for any page, surface, or feature in the CrossAngle codebase. No surface is declared finished or merged to production without satisfying every verification criterion below.

---

## Surface Completion Checklist

### 1. Architecture & Token Compliance
- [ ] Consumes semantic tokens only; zero raw/hardcoded color values or ad-hoc margins.
- [ ] No fake or premature tokens created without passing the 3x promotion threshold.
- [ ] Clean separation of concerns preserved (Tokens vs. Taste).
- [ ] Layer hierarchy respected (`ART_DIRECTION_BIBLE` → `DESIGN_PLAYBOOK` → `AI_REVIEW_WORKFLOW` → Production).

### 2. Accessibility (A11y) & Semantics
- [ ] **Touch Target Floor:** All interactive elements (buttons, links, chips, inputs) are ≥ 48×48px on touch viewports (`min-h-[48px]`, `min-w-[48px]`, or 48px hit area).
- [ ] **Focus Rings:** Distinct `:focus-visible` styling (`ring-[#7a5c30]` with 2px offset) visible on all keyboard interactive controls.
- [ ] **Color Contrast:** All text meets or exceeds WCAG AA (≥ 4.5:1 for body copy, ≥ 3.0:1 for large display text).
- [ ] **Screen Reader Support:** Semantic HTML5 (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`), complete `aria-label` on icon-only buttons, and `aria-live` regions on dynamic states.
- [ ] **Motion Accommodation:** Every animation wrapped or respecting `prefers-reduced-motion` with instantaneous opacity fallback.

### 3. Responsive & Viewport Ergonomics
- [ ] Viewport container locked to `min-h-[100dvh]` with zero whole-page horizontal overflow jitter (`overflow-x-hidden`).
- [ ] Form layout, action bars, and sticky controls verified at standard breakpoints:
  - Mobile (375px & 390px)
  - Phablet / Tablet Portrait (768px)
  - Tablet Landscape / Small Laptop (1024px)
  - Desktop Wide (1440px+)
- [ ] Paragraph measures strictly constrained to `max-w-[65ch]` (60–70 characters).

### 4. Motion & Tactility
- [ ] Micro-animations duration ≤ 300ms.
- [ ] Only GPU-accelerated properties animated (`transform`, `opacity`).
- [ ] Standard `--ease-gallery` or `--ease-out` curves applied; zero linear or generic browser ease.
- [ ] Tactile feedback implemented: buttons compress to `scale(0.97)` on active press.

### 5. Performance & Web Vitals
- [ ] **LCP (Largest Contentful Paint):** Priority preloading (`fetchpriority="high"`) applied to hero visual assets.
- [ ] **CLS (Cumulative Layout Shift):** All images and video containers define explicit aspect ratios / dimensions; CLS = 0.
- [ ] **INP (Interaction to Next Paint):** No synchronous layout thrashing or long tasks (>50ms) blocking the main thread.
- [ ] Image assets compressed with modern formats (WebP/AVIF) and appropriate responsive `sizes`.

### 6. SEO & Structured Data
- [ ] Single `<h1>` per page reflecting the core search intent and spatial narrative.
- [ ] Heading hierarchy (`h1` → `h2` → `h3`) strictly sequential with no skipped levels.
- [ ] Page `<title>` and `<meta name="description">` populated and unique.
- [ ] Schema.org JSON-LD structured data embedded (`BreadcrumbList`, `Organization`, `LocalBusiness`, or `Article`).
- [ ] Canonical URL tag declared.

### 7. Governance, Review & Certification
- [ ] Surface reviewed against the 100-Point Objective Audit Rubric in `design/reviews/`.
- [ ] Official review log archived in `design/reviews/[surface]-review-[ID].md`.
- [ ] Certified status recorded in [SURFACE_CERTIFICATIONS.md](file:///E:/main/design/reviews/SURFACE_CERTIFICATIONS.md) (`✓ Certified`, `✓ Premium`, or `✓ Production Ready`).
- [ ] Any intentional rule deviations approved and logged in `design/adr/ADR-[ID].md`.
