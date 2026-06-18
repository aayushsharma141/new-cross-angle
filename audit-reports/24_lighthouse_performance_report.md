# Lighthouse Performance Audit Report

**Date:** 2026-06-17
**Tool:** Playwright 1.59.1 + PerformanceObserver (Chrome Headless)
**Viewport:** 1440×900 desktop
**Network:** Localhost (no throttling)

## Summary

| Page | FCP | LCP | CLS | Transfer Size | DOM | Scripts | H1/H2/H3 |
|------|-----|-----|-----|-------------|-----|---------|----------|
| Homepage (`/`) | 1.5s | 2.3s | 0.020 | **17,867 KB** | 567 | 163 | 1/2/3 |
| Services Hub (`/services`) | 0.4s | 1.6s | 0.000 | 7,563 KB | 999 | 163 | 1/10/3 |
| Service Category (`/services/residential`) | 0.4s | 1.6s | 0.000 | 156 KB | 471 | 154 | 1/3/3 |
| Service Detail (`/services/residential/living-room`) | 0.4s | 1.9s | 0.000 | 1,025 KB | 538 | 162 | 1/7/6 |

**What's good:**
- Web Vitals pass "Good" thresholds on every page
- FCP sub-0.5s on all non-homepage pages
- CLS is excellent (0.000 on 3 of 4 pages)
- Every H1 is exactly 1 per page
- Zero images missing `alt` text

## Critical Findings

### 1. Homepage Transfer Size: 17.8 MB (P0)

The homepage loads **17.8 MB** of resources — an order of magnitude above the 1–3 MB benchmark. The services hub is also heavy at 7.6 MB.

**Root cause:** This is a dev-mode Vite build (unbundled). 163 separate script requests on the homepage confirm full treeshaking bypass. All modules load individually.

**Fix:** Validate production build (`npm run build`, then test against the built output). The production build should collapse these into <10 chunks.

### 2. 150+ Script Requests Per Page (P1)

Every page fetches 154–163 individual script modules. This is the dev server's hot module replacement system serving each module independently.

- Category page: 154 scripts (156 KB total — scripts are tiny individually)
- Detail page: 162 scripts (1,025 KB total)
- Services hub: 163 scripts (7,563 KB)

**Severity is low in production** — this Vite dev behavior disappears in the built output. Still notable.

### 3. JS Heap: 37–48 MB (P2)

All pages maintain 37–48 MB of JS heap:
- Homepage: 48.1 MB (highest — all module code loaded)
- Category: 45.2 MB
- Detail: 40.1 MB
- Services Hub: 37.8 MB

**Suspected causes:**
- Framer Motion (layout animations, AnimatePresence state)
- GSAP (ScrollTrigger with all pin/spacer calculations)
- React Router + React Query client state
- Hero carousel preloading all slides

**Fix opportunities:**
- Lazy load Framer/GSAP on scroll intersection, not at mount
- Hero: render only visible slide (currently renders all 6+ in DOM — ref: `apps/web/src/components/home/Hero.tsx:232`)
- Code-split heavy libraries per-route instead of global import

### 4. Services Hub DOM Depth: 18 Levels (P1)

The services hub has a max DOM depth of 18 (vs 14–15 on other pages) and 999 elements (vs 471–567).

**Root cause:** The hub page stacks multiple complex sections: `ServicesHero`, `ServicesMarquee`, `ServicesWhyUs`, `ServicesEngines`, `ProcessTeaser`, `ServicesCTA`. Each wraps content in nested React components (section > container > grid > card > ...).

**Fix:** Flatten component trees where possible. `ServicesEngines` likely has the deepest nesting (cards in grids in containers in sections).

### 5. Homepage Has Only 2 H2s — Missing Sections (P1)

The homepage renders only 2 H2 elements from a page that should include About, Services, Portfolio, Testimonials, Blog, and Trust sections. This confirms the earlier finding: **5 orphaned components** (`About.tsx`, `Services.tsx`, `TrustSection.tsx`, `ServiceLocations.tsx`, `HomeBlog.tsx`) are imported but not wired into `Index.tsx`.

## Recommendations by Priority

### P0 — Must Fix
- [ ] Validate production build resolves the 17.8 MB homepage transfer size (dev-mode artifact)
- [ ] Define `py-section-y` in Tailwind config (0 components currently have section padding)

### P1 — Should Fix
- [ ] Wire orphaned homepage components into Index.tsx to restore heading hierarchy and content
- [ ] Reduce DOM depth on services hub (flatten ServicesEngines nesting)
- [ ] Lazy-load Hero non-visible slides (avoid all-in-DOM rendering)
- [ ] Code-split Framer Motion per-route

### P2 — Nice to Fix
- [ ] Investigate JS heap after production build (48 MB may drop naturally)
- [ ] Defer GSAP ScrollTrigger initialization until after LCP
- [ ] Remove 150+ dev-script pattern concern from audit (it's Vite dev behavior)

## Technical Details

### Metric Definitions (Source: web.dev/vitals)
| Metric | Good | Needs Improve | Poor |
|--------|------|--------------|------|
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### Resources Breakdown by Page
| Page | Total KB | Scripts | Images | Stylesheets | Fonts | Other |
|------|----------|---------|--------|-------------|-------|-------|
| Homepage | 17,867 | ~163 | 9 | ~3 | ~5 | ~2 |
| Services Hub | 7,563 | ~163 | 8 | ~3 | ~5 | ~2 |
| Service Category | 156 | ~154 | 4 | ~3 | ~5 | ~1 |
| Service Detail | 1,025 | ~162 | 7 | ~3 | ~5 | ~2 |

*Note: Production build will drastically reduce script count and transfer size.*

### Screenshots
- `audit-reports/lighthouse/homepage.png`
- `audit-reports/lighthouse/services-hub.png`
- `audit-reports/lighthouse/service-category.png`
- `audit-reports/lighthouse/service-detail.png`
