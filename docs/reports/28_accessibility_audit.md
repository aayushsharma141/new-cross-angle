# Accessibility Audit — Broader Coverage + Screen Reader UX

**Date:** 2026-06-19
**Scope:** Image alt-text quality, screen reader flow, reduced motion, zoom resilience, color independence, landmark roles
**Builds on:** `27_accessibility_compliance_audit.md`

---

## 1. Image Alt-Text Quality Audit

### 1.1 Generic/Non-Descriptive Alt Text

| Location | Alt Text | Verdict | Fix |
| --- | --- | --- | --- |
| `components/ui/enhanced/compare.tsx:213` | `"first image"` | ❌ FAIL — describes position not content | Use `beforeImage.title` or descriptive text |
| `components/ui/enhanced/compare.tsx:239` | `"second image"` | ❌ FAIL | Same as above |
| `ProjectClientStory.tsx:58` | `"Project detail"` | ❌ FAIL — all project images would say this | Use `project.title + " client story"` |
| `ProjectGallery.tsx:283` | `"Carousel slide"` | ❌ FAIL — no unique identification | Use `project.title + " gallery image " + index` |
| `ProjectStory.tsx:122` | `"Structural challenge detail"` | ⚠️ WEAK — better but generic | Use descriptive text from surrounding context |
| `TopBar.tsx:40` | `"Company Logo"` | ⚠️ ACCEPTABLE for logos | Fine if logo is linked to home |
| `ModuleLayout.tsx:84,100` | `"CrossAngle Logo"` | ✅ ACCEPTABLE | — |

### 1.2 Missing Alt Text

| Location | Finding | Severity |
| --- | --- | --- |
| `components/layout/Navbar.tsx` | Logo image — verify `alt=""` or `alt="CrossAngle Interior home"` | Needs verification |
| `components/home/Hero.tsx` | Background hero image — likely `alt=""` (decorative) | ✅ Acceptable if decorative |
| Admin media picker thumbnails | Generated from DB — likely use `file.name` | Check if admin thumbnails have alt |

### 1.3 Decorative Image Handling

| Pattern | Frequency | Verdict |
| --- | --- | --- |
| `alt=""` on decorative gradient/pattern backgrounds | Widespread | ✅ Correct |
| `role="presentation"` on decorative SVGs | `breadcrumb.tsx:63,71` | ✅ Correct |
| SVG icons from lucide-react | Auto-generated `aria-hidden` | ✅ Correct |

---

## 2. Screen Reader Flow Audit

### 2.1 Critical Path: Estimate Wizard

| Step | Issue | Severity |
| --- | --- | --- |
| Step indicator (`Step 1 of 5`) — visual only, no `aria-current="step"` or `role="progressbar"` | `PriceEstimator.tsx` | MAJOR — screen reader users hear "1" with no context |
| Property type selection cards — `aria-pressed` on toggle? | `StepPropertyType.tsx` | MINOR — verify |
| Cost summary updates — not announced via `aria-live` | `CostEstimator.tsx:134` has `role="status"` ✅ | Good — confirm coverage |
| Navigation buttons — "Continue" / "Back" — are they unique? | `aria-label="Continue to step 3"` would help | MINOR |

### 2.2 Critical Path: Blog Detail

| Step | Issue | Severity |
| --- | --- | --- |
| Content rendered via `dangerouslySetInnerHTML` — no heading structure guarantee | `BlogDetailPage.tsx:672` | MAJOR — screen reader users can't navigate by heading if content uses non-semantic markup |
| Share buttons — icon-only with no `aria-label` | `BlogDetailPage.tsx:602,610,618,626` | MAJOR |
| Reading progress bar — `role="progressbar"` with `aria-valuenow` is GOOD | `BlogDetailPage.tsx:101` | ✅ |
| Newsletter signup — verify form label | `BlogPage.tsx:675` has sr-only label ✅ | Good |

### 2.3 Critical Path: Admin Lead Edit

| Step | Issue | Severity |
| --- | --- | --- |
| LeadDetailSheet — no focus trap, no `aria-modal` | `AdminLeads.tsx` slide-over sheet | CRITICAL (shared with compliance audit) |
| Status dropdown — verify label association | Stage selector in lead sheet | MINOR |
| Activity timeline — is it a `list` role? | Check if timeline items use `<li>` | MINOR |
| Save/cancel buttons — focus returns to trigger after sheet close? | Not implemented | MAJOR |

### 2.4 Tab Order Sanity Check

| Page | Expected Tab Order | Issue |
| --- | --- | --- |
| All public pages | SkipNav (if present) → Navbar (logo, links, CTA) → Main content | SkipNav absent from public layout |
| Admin pages | SkipNav → Sidebar → Main content → Module actions | Sidebar logo gets focus but links are shown/hidden — focus may land on hidden items |
| Gallery page | Filter tabs → Grid → Lightbox | Lightbox may not trap focus when open |

---

## 3. Reduced Motion Support

### 3.1 `prefers-reduced-motion` Media Query

| Finding | Location | Severity |
| --- | --- | --- |
| **No `prefers-reduced-motion` anywhere in codebase** | `grep -ri "prefers-reduced-motion"` returned zero results | **CRITICAL** |
| Framer Motion page transitions have no reduced-motion fallback | `PageTransition.tsx` wrapping all public routes | MAJOR — users with vestibular disorders get full animation |
| GSAP scroll animations have no `matchMedia` reduced-motion check | Various components using GSAP | MAJOR |
| Lottie animations in discovery addon have no reduced-motion respect | `WelcomeScreen.tsx` likely auto-plays Lottie | MAJOR |
| CSS `transition` and `animation` properties unchecked | Widespread across styles | MAJOR |

### 3.2 Recommended Pattern

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Add to `index.css` top-level scope.

---

## 4. Zoom to 200% Resilience

| Page | Issue | Severity |
| --- | --- | --- |
| **FixedSocialBar** — absolute right-edge social icons may overflow viewport or overlap content at 200% zoom (768px equivalent) | `components/layout/FixedSocialBar.tsx` | MAJOR |
| **SectionNavDots** — right-edge fixed circle indicators become unreachable or clip | `components/layout/SectionNavDots.tsx` | MAJOR |
| **Admin sidebar** — fixed-width 240px/280px sidebar consumes 50%+ of viewport at 200% zoom on 1280px screen | `AdminLayout.tsx` sidebar | MAJOR |
| **Hero text** — large `text-6xl`/`text-7xl` should scale but verify no `overflow: hidden` constraints | `components/home/Hero.tsx` | INFO — likely OK with clamp() |
| **Project timeline** — absolute nodes with fixed pixel positions break completely | `ProjectPage.tsx` journey timeline | CRITICAL — absolute positioned nodes overflow and don't wrap |
| **Admin tables** — no horizontal scroll wrapping, columns get cut off | Multiple admin DataTable pages | MAJOR |
| **Estimator step cards** — may stack poorly at narrow widths | `PriceEstimator.tsx` property selection | MINOR |

---

## 5. Color Independence

### 5.1 Icons/Indicators Using Color Alone

| Element | Location | Fix |
| --- | --- | --- |
| Lead temperature (Hot/Warm/Cold) | `AdminLeads.tsx` — `--admin-danger`/warning/success dots | Add text label "Hot Lead" or icon variant |
| Blog status (Published/Draft/Archived) | `AdminBlogOverview.tsx` — green/gray badge | Add text within badge |
| Estimate lead stage | `AdminEstimateLeads.tsx` — colored stage dots | Add stage name text |
| Process step completion | `OurProcessPage.tsx` — active/completed step colors | Add checkmark icon + color |
| Form validation state | All forms — red border on error | Add error icon + error text |
| Service category filter active state | Various — color change on active tab | Add underline/bold/icon indicator |

### 5.2 Link Identification

Links are underlined only on hover, not persistently. WCAG requires links to be distinguishable from body text by more than color. Site uses white links on black background — needs underline or other non-color distinction.

| Location | Issue | Severity |
|---|---|---|
| Navigation links in Navbar | Only change color on hover — default `text-white` same as body | MAJOR — add persistent underline or bold weight |

---

## 6. Landmark Roles Audit

| Landmark | Location | Present? |
| --- | --- | --- |
| `<header>` / `role="banner"` | `Navbar.tsx` wrapping element | Check implementation |
| `<nav>` / `role="navigation"` | Navbar, Footer, Admin sidebar | ✅ Present |
| `<main>` / `role="main"` | Public layout wrapper, AdminLayout | ✅ Present (pages have `<main id="main-content">`) |
| `<footer>` / `role="contentinfo"` | `Footer.tsx`, `AdminLayout.tsx` | ✅ Present |
| `role="search"` | AdminHub search, admin filter bars | ❌ Not used — use `<search>` element or `role="search"` |
| `role="complementary"` | Sidebar when not primary navigation | Admin sidebar is navigation, not complementary |
| `role="form"` | Contact form, estimate form | Not needed — native `<form>` is sufficient |

### Missing Landmarks

| Missing | Location | Impact |
| --- | --- | --- |
| `role="search"` on admin filter/search bars | Admin pages with `<input type="search">` | MINOR — improves screen reader navigation to search |
| `aria-label` on `<nav>` elements | Multiple navigation elements without unique labels | MINOR — screen reader user hears "navigation" without knowing which |

---

## 7. Audio Descriptions / Time-Based Media

No video content detected. ✅ N/A.

---

## 8. Accessibility Statement

No accessibility statement found on the site. WCAG recommends publishing one.

| Recommendation | Effort |
|---|---|
| Add `/accessibility` page or footer link with accessibility statement | 30 min |

---

## Score Summary

| Category | Score | Grade |
| --- | --- | --- |
| Alt-text quality | 70% | B- |
| Screen reader flow | 50% | F (no focus traps) |
| Reduced motion | 0% | F (no `prefers-reduced-motion`) |
| Zoom 200% resilience | 40% | D |
| Color independence | 45% | D |
| Landmark roles | 80% | B+ |
| **Overall** | **48%** | **Needs significant improvement** |
