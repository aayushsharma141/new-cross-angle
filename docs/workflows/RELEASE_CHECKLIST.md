# CrossAngle Production Release Checklist

| Release Gate Metadata | Detail |
|:----------------------|:-------|
| **Scope**             | Production Deployment Candidate Gate |
| **Authority**         | [DESIGN_PLAYBOOK.md (v3.1)](file:///E:/main/DESIGN_PLAYBOOK.md) & [DEFINITION_OF_DONE.md](file:///E:/main/design/DEFINITION_OF_DONE.md) |
| **Status**            | **Active Pre-Ship Enforcement** |
| **Last Updated**      | 2026-08-06 |

---

## Pre-Release Verification Gates

Every item is certified complete with persistent evidence logs in the Design Knowledge Base.

### 1. Performance & Web Vitals (Evidence: [design/performance/](file:///E:/main/design/performance/))
- [x] **Lighthouse Performance Score ≥ 90** on mobile and desktop staging runs.
- [x] **Largest Contentful Paint (LCP) ≤ 1.2s** (Hero priority loading, zero render-blocking styles — [lcp-audit.md](file:///E:/main/design/performance/lcp-audit.md)).
- [x] **Cumulative Layout Shift (CLS) = 0.00** across all 5 core surfaces ([cls-audit.md](file:///E:/main/design/performance/cls-audit.md)).
- [x] **Interaction to Next Paint (INP) ≤ 50ms** under rapid interaction testing ([inp-audit.md](file:///E:/main/design/performance/inp-audit.md)).
- [x] **Asset Compression:** All static imagery served in next-gen formats (WebP/AVIF) with explicit dimensions.
- [x] **Bundle Analysis:** Zero duplicate packages, heavy vendor scripts split into async chunks ([bundle-audit.md](file:///E:/main/design/performance/bundle-audit.md)).

### 2. Accessibility (A11y) & Usability (Evidence: [design/accessibility/](file:///E:/main/design/accessibility/))
- [x] **Axe / Lighthouse Accessibility Score = 100** on all core public routes.
- [x] **WCAG AA Contrast Compliant (≥ 4.5:1)** verified across all text and UI states ([contrast-audit.md](file:///E:/main/design/accessibility/contrast-audit.md)).
- [x] **Touch Target Floor (≥ 48×48px)** confirmed on 375px/390px mobile viewports ([touch-target-audit.md](file:///E:/main/design/accessibility/touch-target-audit.md)).
- [x] **Keyboard Navigation:** Full tab traversal with visible `:focus-visible` rings, no trap anomalies ([keyboard-audit.md](file:///E:/main/design/accessibility/keyboard-audit.md)).
- [x] **Screen Reader Walkthrough:** Landmark navigation (`main`, `nav`, `header`, `footer`) and dynamic `aria-live` regions verified ([semantics-audit.md](file:///E:/main/design/accessibility/semantics-audit.md)).

### 3. Cross-Browser & Device Matrix QA (Evidence: [design/cross-browser/](file:///E:/main/design/cross-browser/))
- [x] **Desktop Browsers:** Chrome (Blink), Safari (WebKit), Firefox (Gecko), Edge ([browser-matrix-audit.md](file:///E:/main/design/cross-browser/browser-matrix-audit.md)).
- [x] **Mobile Environments:** iOS Safari (iPhone 13/14/15 viewport), Android Chrome (Pixel/Samsung) ([safari-webkit-audit.md](file:///E:/main/design/cross-browser/safari-webkit-audit.md)).
- [x] **Viewport Breakpoints:** 375px, 390px, 768px, 1024px, 1280px, 1440px+ verified for horizontal overflow jitter ([viewport-matrix-audit.md](file:///E:/main/design/cross-browser/viewport-matrix-audit.md)).
- [x] **Reduced Motion:** System `prefers-reduced-motion: reduce` replaces spring animations with instant opacity fades ([motion-audit.md](file:///E:/main/design/accessibility/motion-audit.md)).

### 4. SEO & Structured Data Integrity (Evidence: [design/seo/](file:///E:/main/design/seo/))
- [x] **Single `<h1>` Tag:** Exactly one semantic `<h1>` present per route matching primary search intent ([crawlability-audit.md](file:///E:/main/design/seo/crawlability-audit.md)).
- [x] **Heading Flow:** Strict sequential nesting (`h1` → `h2` → `h3`) with zero skipped levels.
- [x] **Schema.org Validation:** JSON-LD structured data validated via Google Rich Results Test (`BreadcrumbList`, `InteriorDesigner`, `LocalBusiness`, `Organization` — [schema-audit.md](file:///E:/main/design/seo/schema-audit.md)).
- [x] **Meta & Canonical:** Unique `<title>`, `<meta name="description">`, `og:image`, and `<link rel="canonical">` per page ([meta-audit.md](file:///E:/main/design/seo/meta-audit.md)).
- [x] **Crawling Assets:** `robots.txt` properly configured and `sitemap.xml` fully populated with live routes ([crawlability-audit.md](file:///E:/main/design/seo/crawlability-audit.md)).
- [x] **Link Integrity:** 0 broken internal links, 0 unresolved 404 routes.

### 5. Telemetry, Analytics & Observability
- [x] **PostHog / Analytics Event Parity:** Discovery and Estimator funnel events fire with valid payload contracts.
- [x] **Sentry Error Monitoring:** Initialized in production mode with release tagging and sourcemaps uploaded.
- [x] **Consent Gating:** Cookie banner and tracking permissions strictly respect user preferences.
- [x] **404 & Fallback Handling:** Custom branded 404 page and root ErrorBoundary tested with recovery action.

### 6. Design Governance Sign-Off
- [x] **Surface Certifications:** Master ledger in [SURFACE_CERTIFICATIONS.md](file:///E:/main/design/reviews/SURFACE_CERTIFICATIONS.md) shows all active surfaces as `✓ Certified`.
- [x] **ADR Archival:** Any deliberate design token exceptions documented in `design/adr/`.
- [x] **Release Gate Approval:** Phase 2 Production Hardening fully verified and signed off.
