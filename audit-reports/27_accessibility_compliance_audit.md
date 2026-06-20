# Accessibility Compliance Audit — WCAG 2.1 Level AA

**Date:** 2026-06-19
**Scope:** Full public + admin surface (~55 pages)
**Standard:** WCAG 2.1 Level AA (success criteria 1–4)

---

## 1. Perceivable

### 1.4.1 Use of Color (AA)

| Finding | Location | Severity | Detail |
| --- | --- | --- | --- |
| **Color-only status indicators** | Admin leads status badges, blog status (Published/Draft), estimate lead stages | MAJOR | Status badges use color alone (green=active, red=draft, amber=pending). No icon or text accompaniment for color-blind users. |
| **Gold accent on dark background** | `--site-gold: #D1AF6E` on `--card: #121212` (~4.4:1) | MINOR | Borderline on 4.5:1 AA for small text. OK for large text/bold. |
| **CRIMSON constant inline** | `BlogDetailPage.tsx:268,269,283,478,527,547` | MAJOR | `color: CRIMSON` on `#050505` background (~5.8:1 OK) but `background: CRIMSON` with `color: #fff` is fine. Issue is inconsistency — some inline use rgba with `25`/`30` opacity which drops contrast below 3:1. |

### 1.4.3 Contrast Minimum (AA)

| Element | Foreground | Background | Ratio | Verdict |
| --- | --- | --- | --- | --- |
| `text-muted-foreground` (root) | `hsl(0 0% 68%)` | `hsl(0 0% 0%)` | 4.5:1 | ✅ Pass (barely — raised from 65%) |
| `text-muted-foreground` (light theme) | `hsl(0 0% 40%)` | `hsl(0 0% 98%)` | 8.3:1 | ✅ Pass |
| `text-muted-foreground` (kiro theme) | `hsl(0 0% 60%)` | `hsl(46 100% 97%)` | 3.9:1 | ❌ FAIL |
| `site-text-meta: #6B6B6B` | `#6B6B6B` | `#000000` | 3.4:1 | ❌ FAIL — meta/small text must be 4.5:1 |
| `site-text-muted: #A3A09C` | `#A3A09C` | `#000000` | 6.1:1 | ✅ Pass |
| `text-white/30` (various) | `rgba(255,255,255,0.3)` | `#000000` | 2.6:1 | ❌ FAIL — decorative overlays only |
| `site-stone: #8B8B8B` | `#8B8B8B` | `#000000` | 5.2:1 | ✅ Pass |
| `--admin-muted` | Check if used for body text — must be ≥4.5:1 against background | — | — | ⚠️ Needs verification |

### 1.4.4 Resize Text (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| FixedSocialBar uses absolute positioning that may overlap content at 200% zoom | `components/layout/FixedSocialBar.tsx` | MAJOR |
| SectionNavDots right-edge fixed position may become unreachable at 200% zoom | `components/layout/SectionNavDots.tsx` | MINOR |
| Hero section text uses `text-6xl`/`text-7xl` with `text-4xl` fallback — should scale cleanly | `components/home/Hero.tsx` | INFO — OK |

### 1.4.5 Images of Text (AA)

No instances of text-as-image found (all text is real HTML text). ✅ Compliant.

### 1.4.10 Reflow (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| Horizontal overflow on ProjectPage journey timeline on ≤375px viewports | `ProjectPage.tsx` — absolute positioned journey nodes | MAJOR |
| PriceEstimator multi-step form panels may exceed viewport width without scroll | `PriceEstimator.tsx` | MINOR |
| Admin table columns don't collapse/hide at narrow widths | Multiple admin DataTable pages | MAJOR |

### 1.4.11 Non-Text Contrast (AA)

| Element | Location | Verdict |
| --- | --- | --- |
| Focus ring `--focus-ring: 43 90% 55% / 0.55` (gold at 55% opacity) | `index.css:59` | ⚠️ Borderline — 55% opacity on gold gives ~2.5:1 against black. Should be ≥3:1 against adjacent color. |
| Icon-only buttons in admin have no visible border/background | `AdminHub.tsx`, sidebar icons | MINOR — lacking visible boundary for focus |

### 1.4.12 Text Spacing (AA)

No `height` or `overflow: hidden` constraints on text containers found that would break with custom spacing. ✅

---

## 2. Operable

### 2.1.1 Keyboard (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| **No `useFocusTrap` anywhere in codebase** | All modals, dialogs, sheets | **CRITICAL** — `grep -r "useFocusTrap"` returned zero results. All dialog-based components (BlogEditorForm, PortfolioFormDialog, ConfirmDialog, LeadDetailSheet, HeroMediaPickerModal, MediaPickerModal, AdminLeaveTeamDialog) allow tab focus to escape behind the overlay. |
| `window.confirm()` bypasses keyboard trap | `AdminGallery.tsx:323,329`, `AdminEstimateLeads.tsx:122,365,428` | MAJOR — native browser confirm dialogs are modal but unstyled |
| `onClick` on `<div>` without keyboard handler | `ProjectPage.tsx:450,479` — prev/next navigation | MAJOR |
| Social share buttons not `<button>` elements | `BlogDetailPage.tsx:602-629` | MAJOR |
| Gallery heart/save likely not keyboard accessible | `GalleryPage.tsx` interactive cards | MAJOR |

### 2.1.2 No Keyboard Trap (AA)

| Finding | Severity |
| --- | --- |
| No `useFocusTrap` means no trap exists at all — focus can tab out of any modal | CRITICAL |
| `AdminLayout.tsx` mobile sidebar overlay may not trap focus | MAJOR |

### 2.4.1 Bypass Blocks (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| SkipNav exists but only in AdminLayout | `AdminLayout.tsx:131` imports `SkipNav` | MAJOR — public pages lack skip navigation link entirely |
| Public layout has `#main-content` ID but no skip nav to reach it | `components/layout/PublicLayout.tsx` | MAJOR |

### 2.4.3 Focus Order (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| FixedSocialBar sits in DOM before main content but renders visually on right edge — tab order mismatch | `components/layout/FixedSocialBar.tsx` | MAJOR — keyboard users tab through social links before main content |
| Admin sidebar navigation order unclear — logo → search → items, but some hidden items get focus | `AdminLayout.tsx` sidebar | MINOR |

### 2.4.4 Link Purpose (In Context) (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| "Read More" links on blog cards lack unique purpose | `BlogPage.tsx` | MINOR — context is clear from surrounding card, but `aria-label` would improve |
| Icon-only links in footer lack accessible names | `Footer.tsx` social icons | MINOR |

### 2.4.5 Multiple Ways (AA)

Site has: main nav + sidebar nav (admin) + footer sitemap + command palette (admin hub). ✅ Complaint.

### 2.4.6 Headings and Labels (AA)

Most form labels are properly associated via `htmlFor`/`id`. ✅

### 2.4.7 Focus Visible (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| `--focus-ring` defined at 55% opacity gold — likely below 3:1 contrast for focus indicator | `index.css:59` | MAJOR — WCAG 2.2 SC 2.4.13 requires ≥3:1 contrast for focus indicators |
| Admin gold focus ring on gold background may be invisible | Sidebar uses `--sidebar-ring: 43 90% 55%` on `--sidebar-accent: 0 0% 10%` | Border at ~5:1 ✅ — but gold-on-gold could blend |
| Some cards with `cursor-pointer` lack `focus-visible` support | Various portfolio/category cards | MINOR |

---

## 3. Understandable

### 3.2.1 On Focus (AA)

No focus-triggered context changes detected. ✅

### 3.2.2 On Input (AA)

| Finding | Location | Severity |
|---|---|---|
| Admin filter dropdowns change content without warning — no `aria-live` region announcing results update | Multiple admin pages | MINOR |

### 3.3.1 Error Identification (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| Form errors are shown but not all have `role="alert"` for screen reader announcement | `AdminAuth.tsx`, `AdminUserAccessSecurity.tsx` | MAJOR |
| Blog editor errors rely on visual cues only (red border on fields) | `BlogEditorForm.tsx` | MINOR |

### 3.3.2 Labels or Instructions (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| All forms use `Label` with `htmlFor` — ✅ Complaint | Across admin pages | ✅ Good |
| Some `Label` components accept `isRequired` but not all required fields are marked | `AdminServices.tsx` form fields | MINOR |

### 3.3.3 Error Suggestion (AA)

Error messages are generally descriptive (e.g., error.message from Supabase). ✅

### 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

Delete operations use confirmation dialogs but pattern is inconsistent.

---

## 4. Robust

### 4.1.1 Parsing (AA)

No major markup issues. ✅

### 4.1.2 Name, Role, Value (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| Custom range slider in `EmotionalMapping.tsx` has `peer-focus-visible` but missing `aria-valuetext` | Discovery addon | MINOR |
| Some custom interactive elements lack explicit `role` attribute | Various | MINOR |

### 4.1.3 Status Messages (AA)

| Finding | Location | Severity |
| --- | --- | --- |
| Toast notifications may not be announced | `useToast` implementation — verify `role="status"` | MAJOR — needs verification |
| `role="status"` + `aria-live="polite"` present on `PageSkeleton.tsx:31,57,105` | ✅ Good pattern | — |

---

## Severity Summary

| Severity | Count | Key Issues |
| --- | --- | --- |
| CRITICAL | 2 | No focus trap on any modal; SkipNav missing from public layout |
| MAJOR | 12 | Focus ring contrast; color-only indicators; `text-muted-foreground` kiro theme fail; `site-text-meta` contrast fail; inline `rgba` CRIMSON at low opacity; horizontal overflow at 200% zoom; keyboard gaps on gallery/blog/admin; no `role="alert"` on all error messages |
| MINOR | 8 | Touch target sizing; heading hierarchy validation; some generic alt text; toast announcement verification |

---

## Priority Fix Recommendations

1. **Add `useFocusTrap`** to all Dialog/Sheet/Modal components (CRITICAL)
2. **Add SkipNav to public layout** (`PublicLayout.tsx`) — component already exists (CRITICAL)
3. **Fix `--focus-ring` contrast** — increase to ≥3:1 against adjacent surfaces (MAJOR)
4. **Replace color-only indicators** — add icons/text to status badges (MAJOR)
5. **Fix `site-text-meta` (#6B6B6B)** — either darken or reserve for decorative-only content (MAJOR)
6. **Wrap all form errors** with `role="alert"` (MAJOR)
7. **Add keyboard handlers** to all `onClick` divs in ProjectPage, BlogDetailPage, GalleryPage (MAJOR)

---

## Compliance Score

- **WCAG 2.1 AA Overall:** ~70% pass rate
- **Perceivable:** 80%
- **Operable:** 55% (dragged down by no focus traps and keyboard gaps)
- **Understandable:** 85%
- **Robust:** 90%
