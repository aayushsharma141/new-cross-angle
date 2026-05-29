# Comprehensive UI/UX & Accessibility Audit — End-User Perspective

**Project:** CrossAngle Interior (crossangleinterior.com)  
**Date:** 2026-05-12  
**Auditor:** Kiro CLI  
**Scope:** Public-facing pages, forms, navigation, responsive design, accessibility, performance UX

---

## Executive Summary

CrossAngle Interior is a well-crafted, premium dark-themed interior design website with strong visual identity. The codebase demonstrates thoughtful performance optimization (lazy loading, code splitting, IntersectionObserver-triggered sections) and a solid accessibility foundation. However, several UX friction points and accessibility gaps exist that would impact real users — particularly on mobile, with keyboard navigation, and for screen reader users.

**Overall Score: 7.2/10**

| Category | Score | Status |
|----------|-------|--------|
| Visual Design & Hierarchy | 8.5/10 | ✅ Strong |
| Navigation & Wayfinding | 7/10 | ⚠️ Good with gaps |
| Forms & Interactions | 7/10 | ⚠️ Good with gaps |
| Mobile Experience | 7.5/10 | ⚠️ Good |
| Accessibility (WCAG 2.1) | 6/10 | ❌ Needs work |
| Performance UX | 8.5/10 | ✅ Strong |
| Error Handling & Recovery | 7.5/10 | ⚠️ Good |

---

## 1. Navigation & Wayfinding

### What Works Well
- **Transparent-to-solid navbar** on homepage creates an immersive hero experience
- **Pill-style spotlight navigation** on desktop is visually distinctive
- **Mobile hamburger menu** with staggered animation is smooth
- **ScrollToTop** resets position on route change
- **Breadcrumbs** available on inner pages
- **"Get Estimate"** is not in the nav links array — this is a missed conversion opportunity

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| N1 | 🔴 High | **No "Get Estimate" link in main nav** — `navLinks` array only has Home, Services, Portfolio, About, Blog, Contact. The Estimator is a key conversion tool but requires users to find it elsewhere. | Lost conversions |
| N2 | 🟡 Medium | **Mobile menu lacks focus trap** — When the hamburger menu opens, focus is not trapped inside. Keyboard users can tab behind the overlay. | A11y violation |
| N3 | 🟡 Medium | **No mega-menu despite `hasMegaMenu` flag** — `servicesMenu` config exists with residential/commercial/specialized categories but `hasMegaMenu` is set to `false` on Services link. Users must navigate to /services first to discover sub-categories. | Discoverability |
| N4 | 🟡 Medium | **Footer social links may point to "#"** — If `settings?.social_links` is empty, links render as `href="#"` which is confusing and a dead-end for users. | Dead links |
| N5 | 🟢 Low | **SectionNavDots** on homepage — no visible labels, only dots. Users don't know what section each dot represents without hovering. | Discoverability |

---

## 2. Homepage UX Flow

### What Works Well
- **Curtain scroll effect** (hero sticky behind content) is cinematic and on-brand
- **LazySection** with IntersectionObserver prevents loading off-screen content
- **Trust chips** ("500+ Projects", "15+ Years") provide immediate social proof
- **Clear CTA hierarchy** — primary "See Our Works" + secondary "More About Us"
- **Right-side info card** on desktop adds context without cluttering the hero
- **Scroll progress indicator** gives spatial awareness

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| H1 | 🔴 High | **WelcomePrompt popup at 50% scroll / 20s** — This interrupts the user's flow. No focus trap, no `role="dialog"`, no `aria-modal`. Backdrop click dismisses but Escape key is not handled. | UX interruption + A11y |
| H2 | 🟡 Medium | **Hero depends on Supabase fetch** — If the CMS has no active hero_media, `mediaItems` is empty and the hero shows a black screen with no fallback image rendered. | Blank hero possible |
| H3 | 🟡 Medium | **Hero slide indicators** have no text labels — only `aria-label="Go to slide N"` which is good, but the indicators are tiny (1.5px height, 12-16px width) and hard to tap on mobile. | Touch target too small |
| H4 | 🟢 Low | **Duplicate SchemaMarkup** — Both `App.tsx` and `Index.tsx` render `LocalBusiness` schema with slightly different data (different addresses, different social links). This confuses search engines. | SEO conflict |

---

## 3. Forms & Interactive Elements

### Contact Form (CTAContact)

**Strengths:**
- Multi-step form with animated transitions
- Real-time field validation with `useLeadValidation`
- Animated focus underline (GSAP) provides clear active state
- Error messages positioned inline with fields
- `aria-invalid` and `aria-describedby` properly connected
- Respects `prefers-reduced-motion`
- Auto-focuses first invalid field on submit failure
- Success/error status with scroll-to-status behavior

**Issues:**

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| F1 | 🔴 High | **No visible required field indicators** — Labels don't show asterisks or "(required)" text. Users don't know which fields are mandatory until they try to submit. | Form abandonment |
| F2 | 🟡 Medium | **Phone field has no input mask or format hint** — Users don't know if they should include +91, spaces, or dashes. The hint text exists but only shows when field is NOT invalid. | User confusion |
| F3 | 🟡 Medium | **Custom select dropdowns use `tabIndex={-1}`** — Two select-like elements are removed from tab order, making them unreachable by keyboard. | A11y violation |
| F4 | 🟡 Medium | **No character count on message textarea** — Users don't know the expected length. | UX clarity |
| F5 | 🟢 Low | **Form auto-focuses first name field on step 2** with 500ms delay — This can be disorienting on mobile where it triggers the keyboard unexpectedly. | Mobile UX |

### Welcome Prompt (Popup Form)

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| W1 | 🔴 High | **No focus trap** — Users can tab behind the modal to page content. | A11y violation |
| W2 | 🔴 High | **No Escape key handler** — Modal can only be closed by clicking X or backdrop. | A11y violation |
| W3 | 🟡 Medium | **No `role="dialog"` or `aria-modal="true"`** — Screen readers don't announce this as a modal. | Screen reader UX |
| W4 | 🟡 Medium | **Aggressive trigger timing** — 20 seconds OR 50% scroll is too early for a first-time visitor still exploring. Industry best practice is exit-intent or 60+ seconds. | User annoyance |
| W5 | 🟢 Low | **"Welcome Popup Lead" as name** — The lead name is hardcoded rather than asking for the user's name. | Data quality |

### Price Estimator

**Strengths:**
- Clear path selection (Residential/Commercial/Renovation/Custom)
- Full-screen immersive experience once path is selected
- Animated card selection with hover states

**Issues:**

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| E1 | 🟡 Medium | **No back button from CostEstimator** — Once a path is selected, the entire page becomes `<CostEstimator />` with no visible way to go back to path selection without browser back. | Navigation trap |
| E2 | 🟡 Medium | **No Navbar/Footer in estimator mode** — When `selectedPath` is set, the page renders only `<CostEstimator />` in a full-screen div with no navigation chrome. Users lose all wayfinding. | Disorientation |

---

## 4. Responsive Design & Mobile Experience

### What Works Well
- **MobileStickyCTA** — WhatsApp + Get Estimate floating bar is well-designed with hide-on-scroll-down, show-on-scroll-up behavior
- **Safe area inset** padding for notched devices
- **Responsive typography** using `clamp()` throughout
- **Mobile menu** is full-width with proper touch targets
- **Hero** has stronger mobile overlay (`bg-black/60`) for text contrast

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| M1 | 🟡 Medium | **MobileStickyCTA only shows after cookie consent** (`hasChoice` check) — First-time visitors see no CTA bar until they interact with the cookie banner. If they scroll past it, they miss both. | Lost mobile conversions |
| M2 | 🟡 Medium | **Footer is extremely tall on mobile** — `min-h-[100vh]` + large typography + 3-column grid stacked = users must scroll extensively through the footer. The CTA headline at `clamp(3.5rem,10vw,8.5rem)` is massive on mobile. | Scroll fatigue |
| M3 | 🟡 Medium | **Cookie consent banner + MobileStickyCTA overlap zone** — Both are fixed at the bottom. Cookie banner is `z-[120]`, MobileStickyCTA is `z-[100]`. When both show, the CTA is hidden behind the cookie banner. | Blocked interaction |
| M4 | 🟢 Low | **Hero side panel hidden on mobile** (`hidden lg:flex`) — The "Why Clients Choose Us" card with stats is desktop-only. Mobile users miss this trust-building content. | Reduced trust signals |

---

## 5. Accessibility (WCAG 2.1 Compliance)

### What Works Well
- ✅ **Skip to main content** link on homepage (`sr-only focus:not-sr-only`)
- ✅ **`lang="en"`** on HTML element
- ✅ **Focus-visible styles** globally defined with ring color
- ✅ **`prefers-reduced-motion`** respected — hero animations, GSAP effects, and marquee all disabled
- ✅ **`useReducedMotion` hook** defaults to `true` (safe default) until media query is checked
- ✅ **Semantic nav landmark** with `aria-label="Main navigation"`
- ✅ **Cookie banner** uses `aria-live="polite"`
- ✅ **128 ARIA attributes** across 63 components — good coverage
- ✅ **Decorative images** properly use `alt=""` with `aria-hidden="true"`

### Critical Issues

| # | Severity | Issue | WCAG Criterion |
|---|----------|-------|----------------|
| A1 | 🔴 High | **Lenis smooth scroll hijacks native scrolling** — Users who rely on keyboard scrolling (Page Up/Down, Space) or assistive technology scroll commands may experience unexpected behavior. `lerp: 0.08` makes scrolling feel sluggish for users who need precise control. | 2.1.1 Keyboard |
| A2 | 🔴 High | **Homepage has no `<h1>` in page source** — The `<h1>` is inside the Hero component which fetches data from Supabase. If the fetch fails or is slow, screen readers announce no heading structure. The `<h1>` text "Design Your Dream Home" is correct but depends on JS execution. | 1.3.1 Info & Relationships |
| A3 | 🔴 High | **Color contrast on muted text** — `--muted-foreground: 0 0% 68%` (#ADADAD) on `--background: 0 0% 0%` (#000) = 9.5:1 ✅. BUT `text-white/30` (used in footer labels, hints) = ~1.9:1 ❌. `text-white/42` in hero stats = ~2.7:1 ❌. Multiple instances of `text-white/60` = ~4.1:1 which barely passes AA for large text only. | 1.4.3 Contrast (Minimum) |
| A4 | 🔴 High | **WelcomePrompt modal has no focus management** — No focus trap, no return focus on close, no Escape key, no `role="dialog"`. | 2.4.3 Focus Order |
| A5 | 🟡 Medium | **Hero slide indicators are too small** — 1.5px height × 12-16px width. Touch target is well below the 44×44px WCAG recommendation. | 2.5.5 Target Size |
| A6 | 🟡 Medium | **Footer "BACK TO TOP" button** — Uses `type="button"` ✅ and has `focus-visible` ring ✅, but the text "BACK TO TOP ->" is not descriptive for screen readers. Should be `aria-label="Scroll back to top of page"`. | 2.4.4 Link Purpose |
| A7 | 🟡 Medium | **No skip link on non-homepage pages** — The skip-to-content link only exists in `Index.tsx`. Other pages (Contact, Services, Gallery, etc.) don't have it. | 2.4.1 Bypass Blocks |
| A8 | 🟡 Medium | **Heading hierarchy gaps** — Homepage Hero has `<h1>`, then sections jump to `<h2>`. But some components within sections use `<h3>` or `<h4>` without a parent `<h2>` in their section context. | 1.3.1 Info & Relationships |
| A9 | 🟢 Low | **Animated content has no pause mechanism** — The footer particles, marquee strip, and hero slide auto-rotation have no user control to pause. `prefers-reduced-motion` disables CSS animations but not JS-driven Framer Motion animations in the footer. | 2.2.2 Pause, Stop, Hide |

---

## 6. Performance UX (Perceived Speed)

### What Works Well
- ✅ **Code splitting** — Every page and most sections are `lazy()` loaded
- ✅ **LazySection** with configurable `rootMargin` pre-loads content before it's visible
- ✅ **PageSkeleton** provides layout-matched loading states for both public and admin
- ✅ **Font loading** — `display=optional` prevents FOUT entirely
- ✅ **Image optimization** — Custom `<Image>` component with CDN (ImageKit) integration
- ✅ **DeferredExperienceEnhancements** — ScrollManager loads only after idle callback
- ✅ **Hero image eager loading** — Above-fold content loads immediately
- ✅ **DNS prefetch** for ImageKit CDN
- ✅ **Shimmer placeholders** in LazySection match the dark theme

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| P1 | 🟡 Medium | **Large JS chunks** — `AdminBlogs` (419KB), `charts` (434KB), `index` (375KB), `radix` (308KB). While these are lazy-loaded, if a user navigates to admin or a chart-heavy page on slow connection, they'll wait. | Slow page transitions |
| P2 | 🟡 Medium | **Hero depends on Supabase API call** — No static fallback image is rendered while waiting. If Supabase is slow (cold start), users see a black screen for 1-3 seconds. | Poor first impression |
| P3 | 🟢 Low | **30 animated particles in Footer** — Each is a Framer Motion `<motion.div>` with infinite animation. On low-end mobile devices, this could cause jank during footer scroll. | Mobile performance |
| P4 | 🟢 Low | **Lenis smooth scroll adds overhead** — The library intercepts all scroll events and applies lerp interpolation. On pages with heavy content (Blog, Gallery), this adds CPU work on every frame. | Scroll performance |

---

## 7. Error Handling & Edge Cases

### What Works Well
- ✅ **ErrorBoundary** wraps the entire app with a friendly fallback UI
- ✅ **Form submission errors** show toast notifications
- ✅ **404 page** is styled and provides a clear "Return Home" action
- ✅ **Gallery/Blog** use React Query with loading states

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| ER1 | 🟡 Medium | **404 page references non-existent background image** — `url('/404-background.jpg')` is not in the public folder. The page renders with no background, making the glassmorphism effect show through to nothing (white/transparent). | Broken visual |
| ER2 | 🟡 Medium | **No offline/network error state** — If the user loses connection mid-browse, Supabase calls fail silently. No "You're offline" banner or retry mechanism for public pages. | Silent failures |
| ER3 | 🟢 Low | **ErrorBoundary exposes error message** — `this.state.error.message` is shown to users in a code block. In production, this could leak internal details. | Information disclosure |

---

## 8. Cookie Consent & Privacy UX

### What Works Well
- ✅ **Two clear options** — "Strict Only" vs "Accept All"
- ✅ **Non-blocking** — Doesn't prevent page interaction (no overlay)
- ✅ **`aria-live="polite"`** announces to screen readers
- ✅ **Persists choice** — Doesn't re-show after decision

### Issues Found

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| C1 | 🟡 Medium | **No "Manage Preferences" link after dismissal** — Once the user makes a choice, there's no way to change it without clearing localStorage. GDPR/DPDPA requires ability to withdraw consent. | Compliance risk |
| C2 | 🟢 Low | **Banner blocks MobileStickyCTA** — Both compete for bottom screen space on mobile. | Reduced conversions |

---

## 9. Content & Microcopy Issues

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| MC1 | 🟡 Medium | **Inconsistent business name** — "Cross Angle Interior", "Crossangle Interior", "CrossAngle Interior" used interchangeably across pages. | Sitewide |
| MC2 | 🟡 Medium | **Footer copyright says "2026"** — Hardcoded year. Should be dynamic. | Footer.tsx |
| MC3 | 🟢 Low | **"45 Day Delivery Promise"** in hero — No asterisk or qualifier. Could set unrealistic expectations for large projects. | Hero.tsx |
| MC4 | 🟢 Low | **Social links show all 6 platforms** (Facebook, Instagram, Twitter, LinkedIn, YouTube, Pinterest) even if most are "#" — Shows dead links. | Footer.tsx |

---

## Priority Recommendations

### Immediate (P0 — Fix This Week)

1. **Add focus trap to WelcomePrompt** — Use `@radix-ui/react-dialog` (already in deps) or a focus-trap library. Add Escape key handler and `role="dialog"`.
2. **Fix color contrast** — Replace all `text-white/30`, `text-white/42` instances with at least `text-white/60` for decorative text or `text-white/70` for readable text.
3. **Add skip-to-content link to all pages** — Move it to the layout level (inside `PageTransition` or a shared wrapper) instead of only `Index.tsx`.
4. **Add "Get Estimate" to main navigation** — This is a primary conversion path that's currently hidden.

### Short-term (P1 — This Sprint)

5. **Add hero fallback image** — Render a static poster image while Supabase data loads.
6. **Fix WelcomePrompt timing** — Change to exit-intent on desktop, 60+ seconds on mobile. Reduce aggressiveness.
7. **Add mobile focus trap to hamburger menu** — Trap focus within the open menu panel.
8. **Add "Manage Cookie Preferences" footer link** — Required for DPDPA compliance.
9. **Fix 404 page background** — Either add the image or remove the `backgroundImage` style.
10. **Add back navigation to PriceEstimator** — Show a back arrow or breadcrumb when inside the CostEstimator.

### Medium-term (P2 — Next Sprint)

11. **Audit Lenis smooth scroll for a11y** — Consider disabling it for users with `prefers-reduced-motion` or providing an opt-out.
12. **Reduce footer particle count on mobile** — Use 10 instead of 30, or disable entirely on low-end devices.
13. **Standardize business name** — Pick one canonical spelling and use it everywhere.
14. **Add offline detection** — Show a toast or banner when network is lost.
15. **Hide empty social links** — Only render social links that have actual URLs.

---

## Positive Highlights (What's Done Right)

1. **Performance-first architecture** — LazySection + code splitting + idle callbacks is textbook optimization
2. **Dark theme execution** — Consistent, premium feel with proper contrast on primary content
3. **Reduced motion support** — Both CSS and JS animations respect the preference
4. **Form validation UX** — Inline errors, focus management on invalid fields, animated feedback
5. **Mobile CTA bar** — Smart show/hide behavior based on scroll direction
6. **Dynamic footer copy** — Context-aware CTA text based on current page is excellent conversion optimization
7. **Cookie consent** — Clean, non-intrusive, with clear options
8. **SEO foundation** — Helmet meta tags, canonical URLs, structured data, sitemap generation
9. **Error boundary** — Graceful degradation with recovery options
10. **Page transition animations** — Smooth, consistent, and not overdone

---

*End of audit. Total issues identified: 38 (9 High, 19 Medium, 10 Low)*
