# Visual Design History Backup - UI/UX Remediation (Phase 0)

## Date: 2026-06-19
**Checkpoint:** Pre-Remediation Backup

This file logs the state of specific pages before executing Phase 0 of the UI/UX Audit Remediation.

### 1. ServicesHero.tsx
**Issue:** Hardcoded `#FF2A2A` red gradient instead of the brand crimson (`#C41230`). Word swap `minWidth` is too narrow (6ch) for "Forgettable" (10ch).
**Target Modification:** We are replacing the hardcoded hex code with `text-site-crimson` and expanding `minWidth` to properly fit larger words to prevent layout shift or text wrapping.

### 2. TimelineGantt.tsx
**Issue:** `weeks[8]` results in an out-of-bounds `undefined` error since the array might not have 9 elements.
**Target Modification:** Adding a boundary check or explicitly supporting the 8th index.

### 3. index.css
**Issue:** No support for users who prefer reduced motion.
**Target Modification:** Appending a global `@media (prefers-reduced-motion: reduce)` block to disable or tone down GSAP/Framer Motion animations.

### 4. AdminSiteAssets.tsx
**Issue:** Mixed toast libraries (uses `sonner` while the rest of the app uses `useToast`).
**Target Modification:** Standardizing to the project's native `useToast` hook.

### 5. ErrorBoundary.tsx
**Issue:** Phantom `@sentry/react` dependency.
**Target Modification:** Removing the unused import to clear the codebase pre-push error.

*Changes committed to git on 2026-06-19.*

## Date: 2026-06-19
**Checkpoint:** Phase 1 - High-Friction Form Overhauls & Component Hoisting

This file logs the state of specific pages after executing Phase 1 of the UI/UX Audit Remediation.

### 1. App.tsx
**Issue:** `FixedSocialBar` was duplicated across all pages leading to layout bugs.
**Modification:** Hoisted `FixedSocialBar` into `App.tsx` and removed it from individual pages. Verified `SkipNav` implementation.

### 2. Layout Hooks & Contexts
**Issue:** Scattered metrics stats in `Hero`, `About`, `CredibilityStrip` and `AboutPage`.
**Modification:** Replaced duplicate static objects with global variables from `useSiteSettings`.

### 3. BlogDetailPage.tsx
**Issue:** Hardcoded style mappings instead of Tailwind classes.
**Modification:** Converted inline text color constants to `text-site-crimson` Tailwind class.

## Date: 2026-06-19
**Checkpoint:** Phase 2 - Keyboard & Screen Reader Gate

This file logs the state of specific pages after executing Phase 2 of the UI/UX Audit Remediation.

### 1. FocusLock implementation across Modals
**Issue:** No focus traps on modals/dialogs (GalleryLightbox, AdminLeads, ConfirmDialog, PortfolioFormDialog, HeroMediaPickerModal) breaking WCAG 2.1 AA accessibility guidelines.
**Modification:** Installed `react-focus-lock` and explicitly wrapped the contents of `GalleryLightbox`, `ConfirmDialog`, `PortfolioFormDialog`, `HeroMediaPickerModal`, and `LeadDetailSheet` (in AdminLeads) inside `<FocusLock returnFocus>` components to guarantee focus is trapped within the dialog context while open.

*Checkpoint tag created: `checkpoint/v5-phase2-remediation` on 2026-06-19.*
