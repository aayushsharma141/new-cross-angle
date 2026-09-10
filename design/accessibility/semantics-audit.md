# Accessibility Audit: Screen Reader Semantics & ARIA (WCAG 1.3.1 / 4.1.2)

| Audit Metadata | Detail |
|:---------------|:-------|
| **Requirement**| Strict landmark hierarchy (`header`, `main`, `footer`), single `<h1>` per view, robust ARIA contracts |
| **Status**     | **PASS (Certified)** |
| **Audit Date** | 2026-08-06 |
| **Scope**      | Landmark structure, Accordions, Filter components, Social links, Image alt text |

---

## 1. Executive Summary

The DOM architecture delivers an unobstructed, semantically rich tree for assistive technologies (NVDA, VoiceOver, JAWS). All content is encased within HTML5 structural landmarks, every route renders exactly one primary `<h1>`, dynamic interactive disclosure widgets link controls to content via bidirectional ARIA IDs, and all imagery includes descriptive `alt` tags.

---

## 2. Evidence & ARIA Contracts

### 2.1 Landmark Hierarchy
- **Header:** `<header>` in `Navbar.tsx` containing skip navigation link and semantic nav list.
- **Main:** Every route encapsulates primary content in `<main id="main-content">`.
- **Footer:** Accessible `<footer>` with role-based accordion groupings and keyboard activation.

### 2.2 Accordions & Disclosures (WCAG 4.1.2)
- **Buttons:** Expose `aria-expanded={isOpen}`, `aria-controls="panel-id"`, and unique `id="btn-id"`.
- **Panels:** Expose `role="region"`, `aria-labelledby="btn-id"`, and matching `id="panel-id"`.
- **Audited Components:** `ServicesFAQ.tsx`, `ContactFAQ.tsx`, `ProcessFAQ.tsx`, `Footer.tsx`.

### 2.3 Icon Buttons & Social Links
- All icon-only interactive elements (`WhatsAppButton`, `FixedSocialBar`, Mobile Menu toggle) supply explicit `aria-label` descriptors and mark decorative SVG vectors with `aria-hidden="true"`.

### 2.4 Image Semantics (WCAG 1.1.1)
- Project cards, case study media, gallery imagery, and author avatars include meaningful, programmatic `alt` descriptions derived from database titles or descriptive fallbacks.

---

## 3. Verification Protocol

- **DOM Accessibility Tree Inspection:** Landmark regions map cleanly without orphaned controls.
- **Screen Reader Simulation:** VoiceOver reads headings, button state transitions ("collapsed" / "expanded"), and landmark boundaries seamlessly.
