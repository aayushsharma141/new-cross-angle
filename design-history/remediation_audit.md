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
