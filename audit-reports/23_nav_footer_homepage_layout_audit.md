# Navigation, Footer, Homepage & Layout Audit (UI/UX, Responsiveness, Content Hierarchy)

**Scope:** `Navbar.tsx`, `Footer.tsx`, `FixedSocialBar.tsx`, `SectionNavDots.tsx`, `Index.tsx` + all 16 child components, `LazySection.tsx`, `ScrollManager.tsx`, `SmoothScroll.tsx`, `navigation.ts`, `tailwind.config.ts`, `index.css`
**Total Components Audited:** 22 files, ~3,100 lines
**Date:** 2026-06-17

---

## Executive Summary

- **[CRITICAL] `py-section-y` class is undefined in CSS/Config**: Used across 11 homepage section components but never defined in `index.css`, `tailwind.config.ts`, or any other stylesheet. All sections silently use `py-0`, with spacing only from internal padding. This means the homepage sections have zero vertical padding from the class — the entire spacing system is either missing or accidentally working through child element margins.

- **[HIGH] No shared public page layout shell**: Each page individually imports `Navbar`, `Footer`, `FixedSocialBar`, `ScrollToTop`. The admin side has `AdminLayout` with `<Outlet />` — the public side has zero layout abstraction. Adding a global element (e.g., cookie banner, announcement bar) requires touching every page.

- **[HIGH] Navbar — "Get Estimate" is a button, not a nav link**: `navigation.ts` has 7 links (Home, Services, Portfolio, Process, About, Blog, Contact). The "Get Free Estimate" CTA renders as a standalone button outside the spotlight nav. It's duplicated identically in mobile drawer (257 lines for ~8 links + 1 button). The `navLinks` array has `hasMegaMenu: false` on Services but the mega menu data exists in `servicesMenu` — never used.

- **[MEDIUM] Hero — all slides always in DOM**: `Hero.tsx` renders ALL hero slides simultaneously (line 232: `mediaItems.map(() => <div>`) with transforms hiding off-screen slides. If there are 10 hero images, all 10 are in the DOM tree at all times, each with a full-size `<img>` — unnecessary memory/parse cost.

- **[MEDIUM] Footer — 100 animated bubble particles on every page load**: `Particles` component generates 100 `motion.div` elements with individual `animate` configurations. These render on every page that uses Footer — not just the homepage. No `isInView` check limits particle generation.

- **[LOW] SectionNavDots.sync drift**: Uses `getBoundingClientRect` on each scroll event with no `requestAnimationFrame` throttling. Also iterates all sections in reverse on every scroll — no memoization.

---

## 1. Navigation: Navbar Audit

### Visual Layout & Behavior

| Aspect | Current State | Assessment |
|--------|--------------|------------|
| Logo | `AnimatedLogo` + `<img>`. Two logos side-by-side. | Branding clutter — two logos competing for attention. One should be background/fallback. |
| Desktop Nav | `SpotlightNavContainer` spotlight pill menu, 7 links across center. Active link highlighted gold. | Polished. Spotlight effect is premium. |
| Mobile Nav | Accordion drawer (`AnimatePresence`), full-width CTA button, staggered link animation. Focus trap + Escape key. | Well-implemented accessibility pattern. |
| Transparent Mode | `isHomePage && !isScrolled` switches to transparent bg, white text. | Clean transition. Duration `500ms` might feel slow for scroll-initiated change. |
| Scroll Detection | `window.scrollY > 50` — no debounce/throttle. | Fires every pixel. Should use `{ passive: true }` + RAF throttle. |
| "Get Estimate" CTA | Crimson gradient button with pulsing glow, shine sweep on hover. | Premium feel. However, this is the only CTA pointing to `/estimate` from nav. It's rendered once in desktop, once in mobile — fully duplicated code (lines 138–165 and 219–245). |
| Mega Menu | `servicesMenu` defined in `navigation.ts` with 8 sub-service links across 3 categories. `hasMegaMenu: false` on Services nav link. | Dead data — defined but never wired. Services page instead links to `/services` (hub page). |

### Accessibility Issues

- **Desktop spotlight nav**: No focus-visible ring on link focus. The `SpotlightNavContainer` may obscure keyboard focus indicators.
- **Hamburger button**: Uses `aria-label` toggling between "Open menu" / "Close menu". Correct pattern.
- **Mobile focus trap**: Properly implemented with Tab/Shift+Tab wrapping and Escape close.
- **Skip-to-content**: Renders as first child, visible on focus. Correct.

### Content Hierarchy

- **7 links**: Home → Services → Portfolio → Process → About → Blog → Contact
- **Missing "Get Estimate"**: The CTA is a visual button, not a nav link. It has no active state, no keyboard shortcut hint.
- **No dropdown indicators**: `ChevronDown` renders on `link.hasMegaMenu` which is `false` for all links — the icon JSX is dead code.

---

## 2. Footer Audit

### Section Structure

```
┌──────────────────────────────────────────────────────────┐
│  [The Next Step] badge                                   │
│  "Ready to <crimson>get started?</crimson>"              │
│  Contextual subtext (varies by page)                     │
│  [Animated bubble particles background]                  │
├──────────────────────────────────────────────────────────┤
│  STUDIO │ LOCATIONS │ NAVIGATE │ CONNECT                 │
│  (4-column grid, mobile accordion)                       │
│  - Live IST clock        - 11 linked cities  - 9 links   │
│  - Email + Phone         - Address                       │
├──────────────────────────────────────────────────────────┤
│  © Cross Angle Interior          Privacy | Terms         │
└──────────────────────────────────────────────────────────┘
```

### Strengths
- **Contextual CTA**: `getFooterCopy()` tailors headline/sub per page path — 13 distinct variations defined.
- **Live clock**: Small delight element, shows IST in `Space Mono` font.
- **Mobile accordion**: 4 columns collapse into accordion on mobile with `max-h` transitions. Proper ARIA (`aria-expanded`, `aria-controls`, `role="region"`).
- **11 linked city routes**: Grid of 3 with pipe separators — functional local SEO footer.
- **Social links from settings**: `renderSocialLink()` reads from `settings.social_links` — respects CMS integration.

### Weaknesses

- **[HIGH] 100 bubble particles unconditionally**: `Particles` generates 100 animated `motion.div` elements with individual `animate` configs. Each bubble has `repeat: Infinity` on y-translation of up to 3000px. These run on every page (Footer is on every public page). No `will-change`, no `content-visibility: auto` — this is 100 concurrent GPU-composited layers animating perpetually.

- **[MEDIUM] Duplicated scroll-to-top logic**: Every footer link calls `window.scrollTo({ top: 0, behavior: 'smooth' })` — inline in 20+ links. The `ScrollToTop` component also handles this. Double-triggering can conflict with Lenis smooth scroll.

- **[MEDIUM] Giant watermark forces layout**: `<div>CROSSANGLE</div>` at `20vw` (up to 300px) renders as a real DOM element with `font-family: serif`. This is a visual-only element that could be a `::before` pseudo-element or absolutely positioned without affecting document flow.

- **[LOW] `footer-cta` CSS `<style>` tag injected**: Raw `<style>` tag in JSX at line 265-286. This bypasses Tailwind/CSS modules and injects global CSS on every Footer mount.

---

## 3. Homepage Audit

### Section Assembly (`Index.tsx`)

| # | Section | Loading | Section ID | Container Width |
|---|---------|---------|------------|-----------------|
| 1 | Hero | **Eager** | `#home` | `container-wide` |
| 2 | StyleDiscoveryTeaser | Lazy (300px margin) | `#discovery` | `max-w-7xl` |
| 3 | Portfolio | Lazy (300px margin) | `#portfolio` | Section-internal |
| 4 | BeforeAfterShowcase | Lazy (300px margin) | `#before-after` | `container mx-auto` |
| 5 | Process | Lazy (300px margin) | `#process` | Section-internal |
| 6 | Testimonials | Lazy (300px margin) | `#testimonials` | Section-internal |
| 7 | EstimatorPromo | Lazy (300px margin) | `#estimator` | `container mx-auto` |
| 8 | HomeFinalCTA | Lazy (300px margin) | `#final-cta` | `max-w-7xl` |

**Layout context switches**: Sections alternate between `container-wide` (1600px), `container mx-auto` (default 1280px-ish via Tailwind), and `max-w-7xl` (1280px). This creates inconsistent alignment — not all sections snap to the same horizontal grid.

### Content Narrative Flow (Mapped)

```
1. Hero       → "Who are you?" — Brand positioning, style quiz CTA, stats
2. Discovery  → "Not sure what you want?" — 3-archetype preview
3. Portfolio  → "Show me your work" — Project cards with lightbox
4. Before/After→ "Can you really transform spaces?" — Comparison slider
5. Process    → "How do you work?" — 5-stage scroll-pinned timeline
6. Testimonials→ "What do clients say?" — Star ratings, carousel
7. Estimator  → "What will it cost?" — Cost transparency promo
8. Final CTA  → "Ready?" — 3-card: Quiz / Estimate / Consult
```

**Narrative strength**: The sequence follows a logical "Who → What → Show me → Prove it → How → Social proof → Cost → Act" funnel.

**Narrative weaknesses**:
- **No About/Philosophy section in the main flow**: `About.tsx` and `Philosophy.tsx` exist but are NOT included in `Index.tsx`. Brand story is only in Hero stats + Footer.
- **No Services section in the main flow**: `Services.tsx` exists but is NOT included in `Index.tsx`. The hub page `/services` handles this, but the homepage has no explicit "what we do" service list.
- **No TrustSection in the main flow**: `TrustSection.tsx` (warranty, brand badges) exists but is NOT included.
- **No ServiceLocations in the main flow**: `ServiceLocations.tsx` exists but is NOT included.
- **No Blog in the main flow**: `HomeBlog.tsx` exists but is NOT included.

**This means**: 5 of the 16 available home section components are imported but never wired into `Index.tsx`. They're orphaned — compiled into the bundle if imported elsewhere, but dead weight for the homepage.

### Hero Specific Issues

- **[HIGH] All slides always in DOM**: Line 232: `mediaItems.map(...)` renders ALL slides. Each slide has a full `<img>` or `<video>` element. Only one slide is visible at a time via transform. With 5+ slides, 80%+ of hero media is hidden but loaded in DOM.
- **[MEDIUM] Preload promise ignores errors**: `preloadImage()` silently resolves on error (`img.onerror = () => resolve()`). Failed images don't surface.
- **[MEDIUM] Slide state race**: `setPrevIndex` closure captures `activeIndex` from callback closure (line 127: `return activeIndex`). With rapid dot clicks, the `prevIndex` can diverge from actual previous slide.
- **[LOW] CSS class animations on img**: Ken Burns effects use CSS `animation-duration` set from `item.duration_ms`. If duration changes mid-cycle, the animation restarts abruptly.

---

## 4. Layout & Responsiveness Audit

### Breakpoint System

| Breakpoint | Tailwind Width | Usage |
|-----------|---------------|-------|
| `xs` | 400px (custom) | Minor adjustments |
| `sm` | 640px | Default mobile-first |
| `md` | 768px | Tablet breakpoint — major layout switches |
| `lg` | 1024px | Desktop — nav pill, 4-column footer |
| `xl` | 1280px | Extra breathing room |
| `2xl` | 1536px | Max content width |

### Container Width Inconsistencies

| Component | Container Class | Max Width |
|-----------|---------------|-----------|
| Navbar | `container-wide` | 1600px |
| Footer | `container-wide` | 1600px |
| Hero | `container-wide` | 1600px |
| Home Services | `container mx-auto` | ~1280px |
| BeforeAfter | `container mx-auto` | ~1280px |
| Process | Section-internal | ~1280px |
| Testimonials | Section-internal | ~1280px |
| EstimatorPromo | `container mx-auto` | ~1280px |
| HomeFinalCTA | `max-w-7xl` | 1280px |
| StyleDiscovery | `max-w-7xl` | 1280px |
| ServiceLocations | `container-wide` | 1600px |

**Problem**: Hero and Navbar/Footer are at 1600px, but mid-page sections shift to 1280px (`max-w-7xl`). Content edges jump inward by ~160px per side at screen widths between 1280px and 1600px.

### Mobile Responsiveness Patterns

| Component | Mobile Behavior | Assessment |
|-----------|----------------|------------|
| Navbar | Hamburger → accordion drawer, full-width CTA | ✅ Well-executed |
| Footer | 4 columns → accordion stack | ✅ Responsive |
| FixedSocialBar | Hidden on mobile (removed per prior audit) | ✅ Correct |
| WhatsAppButton | Fixed bottom-right, mobile only | ✅ Good mobile conversion |
| Hero | Content wraps, carousel arrows still functional | ✅ Text stacks properly |
| Portfolio | Single-column, lightbox full-screen | ✅ |
| Process | Timeline collapses to vertical list | ✅ |
| Testimonials | Horizontal scroll carousel | ⚠️ On mobile, cards are 300px wide — uses `overflow-x-auto` but no touch-snap behavior |
| BeforeAfter | Compare slider adapts height | ✅ |

### `py-section-y` — Undefined Utility

**11 components** use `py-section-y` as a className (`Services.tsx:49`, `BeforeAfterShowcase.tsx:65`, etc.). This class is **not defined** in:
- `index.css`
- `tailwind.config.ts`
- Any `.css` or `.scss` file in the project

**Impact**: These sections have `py-0` for vertical padding. Any apparent spacing comes from internal padding on child elements (e.g., `p-8` on containers, or grid gaps). The `py-section-y` class has no effect. This was likely intended to be a custom utility (e.g., `padding-top: 5rem; padding-bottom: 5rem`) but was never registered.

### Reduced Motion

The global `@media (prefers-reduced-motion: reduce)` in `index.css:1064` correctly disables all CSS animations/transitions. However:

- **GSAP-driven animations in ServicesHero** are NOT affected by CSS media queries. GSAP reads `useReducedMotion` only in `ScrollManager.tsx` and `Process.tsx`.
- **Framer Motion `animate` props** are NOT affected by the CSS rule — they use the JS animation engine. The `useReducedMotion` hook exists but is only used in 2 of 22 animated components.
- **Hero slide transitions** (CSS `transform` transitions) ARE covered by the global rule.

---

## 5. Performance & Bundle Concerns

| Issue | Location | Impact | Suggested Fix |
|-------|----------|--------|---------------|
| All hero slides in DOM | `Hero.tsx:232` | Unnecessary DOM nodes | Virtualize or limit to 3 slides |
| 100 bubble particles | `Footer.tsx:22` | 100 animating elements on every page | Limit to 30, add `isInView` check |
| Duplicate logo render | `Navbar.tsx:90-104` | Two logo elements side-by-side | Use one or the other conditionally |
| GSAP loaded on every page | `ServicesHero.tsx` | Full GSAP lib + Draggable plugin on /services only | Route-level code split |
| `py-section-y` no-op | 11 components | CSS class with zero effect | Define in tailwind or index.css |
| Undefined horizontal grid | Mixed containers | Layout shifts at 1280-1600px | Unify all sections under `container-wide` |
| `footer-cta` inline style | `Footer.tsx:265-286` | Global CSS injection on mount | Convert to Tailwind classes |
| `SectionNavDots` unthrottled | `SectionNavDots.tsx:26` | Scroll handler fires per-pixel | Add `requestAnimationFrame` |
| Hero media eager load | `Hero.tsx:255` | `loading="eager"` on slides beyond first 2 | Only eager on first 2 |
| Lenis smooth scroll | `SmoothScroll.tsx` | `lerp: 0.08` is aggressive — can cause jank on low-end devices | Consider `lerp: 0.12` for mid-range |

---

## 6. Prioritized Fix Roadmap

| Priority | Issue | Location | Effort | Impact |
|----------|-------|----------|--------|--------|
| **P0** | Define `py-section-y` in Tailwind config or CSS | `tailwind.config.ts` | S | Fixes invisible spacing across 11 sections |
| **P0** | Unify content containers to `container-wide` | All home sections | M | Fixes alignment jump at 1280-1600px |
| **P1** | Create `<PublicLayout>` shell wrapping Nav/Footer/FixedSocialBar/ScrollToTop | New component | M | Eliminates 5-line boilerplate from every page |
| **P1** | Virtualize hero slides (max 3 in DOM) | `Hero.tsx:232` | M | Reduces hidden DOM/image weight |
| **P1** | Limit footer particles + add viewport check | `Footer.tsx:22-62` | S | Stops 100 perpetual animations |
| **P2** | Wire `servicesMenu` mega menu data to navbar | `Navbar.tsx` | M | Uses existing data, improves nav depth |
| **P2** | Add `useReducedMotion` to all Framer Motion sections | 12 components | M | Accessibility compliance |
| **P2** | Throttle SectionNavDots scroll handler | `SectionNavDots.tsx:26` | S | Scroll performance |
| **P3** | Remove duplicate logo from navbar | `Navbar.tsx:90-104` | S | Cleaner nav |
| **P3** | Convert `footer-cta` inline style to Tailwind | `Footer.tsx:265-286` | S | Eliminates global CSS injection |
| **P3** | Add or remove orphaned home sections (About, Services, Trust, Locations, Blog) | `Index.tsx` | M | Completes narrative flow or purges dead code |
| **P4** | Replace `window.scrollTo` in footer links with Lenis instance | `Footer.tsx` | S | Prevents smooth scroll conflict |
| **P4** | Move footer watermark to pseudo-element | `Footer.tsx:488` | S | Reduces DOM weight |

---

## Proposed Homepage Section Order (Updated Narrative)

Based on the existing but-unused components, the ideal 8-section flow for `Index.tsx`:

```
Hero          → [Eager] Brand positioning, CTA
About         → [Lazy] Philosophy + stats (currently missing)
Services      → [Lazy] Interactive service cards (currently missing)
Portfolio     → [Lazy] Visual evidence
BeforeAfter   → [Lazy] Transformation proof
Process       → [Lazy] Methodology
TrustSection  → [Lazy] Guarantees, warranties (currently missing)
Testimonials  → [Lazy] Social proof
EstimatorPromo→ [Lazy] Cost transparency
HomeFinalCTA  → [Lazy] 3-path conversion
```

This fills the current gap: after Hero, the user has no "About" or "Services" context before hitting Discovery/Portfolio.

---

## ✅ Audit Completion

### Lighthouse Performance Audit (2026-06-17)
See full report: [`24_lighthouse_performance_report.md`](./24_lighthouse_performance_report.md)

**Results:**
| Page | FCP | LCP | CLS | Transfer Size | DOM |
|------|-----|-----|-----|---------------|-----|
| Homepage (`/`) | 1.5s | 2.3s | 0.020 | 17,867 KB | 567 |
| Services Hub (`/services`) | 0.4s | 1.6s | 0.000 | 7,563 KB | 999 |
| Service Category (`/services/residential`) | 0.4s | 1.6s | 0.000 | 156 KB | 471 |
| Service Detail (`/services/residential/living-room`) | 0.4s | 1.9s | 0.000 | 1,025 KB | 538 |

**Key takeaway:** Web Vitals all pass "Good" thresholds. Homepage 17.8 MB is dev-mode Vite artifact. No blocking performance issues.
