# CROSSANGLE DEFINITION OF DONE (RELEASE GATE SPECIFICATION)

Every feature, pull request, or build iteration MUST pass this exact release checklist before code can be deployed or merged into production.

---

## 1. Governance Review Gates
- [ ] **Design Governance Gate Passed:** Zero hardcoded hex colors, zero glassmorphism overlays on content cards, strict 0px/2px radii respected.
- [ ] **Engineering Architecture Gate Passed:** `npm run build` and `tsc --noEmit` execute with 0 type errors. Zero `any` types in public component interfaces.
- [ ] **Accessibility (WCAG 2.1 AA) Gate Passed:** Minimum 4.5:1 text contrast ratio across all lighting states. Visible 2px focus rings (`focus-visible:ring-2`). Skip to main content link functional.
- [ ] **Performance Gate Passed:** Lighthouse score > 95, Cumulative Layout Shift (`CLS < 0.01`), Largest Contentful Paint (`LCP < 1.2s`).
- [ ] **Security Gate Passed:** Zero private API credentials leaked in client bundles. Inputs sanitized against OWASP Top 10 vulnerabilities.
- [ ] **Analytics & Telemetry Gate Passed:** All new user interaction paths emit typed events registered in `apps/web/src/analytics/events.ts`.
- [ ] **Documentation & ADR Gate Passed:** Active ADR updated or new ADR registered in `docs/adr/`. `CHANGELOG.md` updated.

---

## 2. Component State Completeness Checklist
- [ ] **Loading State:** Component implements `PageSkeleton` variant or Skeleton frame matching exact layout dimensions.
- [ ] **Empty State:** Handles empty data collections gracefully with quiet architectural copy ("Room under curation").
- [ ] **Error State:** Wrapped in `ErrorBoundary` with fallback recovery triggers.
- [ ] **Responsive Verification:** Tested and verified at 390px (Mobile), 768px (Tablet), 1440px (Desktop), and 1920px (Ultra-wide).

---

## Release Approval Verdict
If all checkboxes are verified: **APPROVED FOR PRODUCTION DEPLOYMENT**  
If any gate fails: **DEPLOYMENT BLOCKED (Return to Engineering Pipeline)**
