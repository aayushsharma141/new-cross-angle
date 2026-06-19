# Phase 8: UI/UX Audit Remediation

## Goal
Fix structural, visual, and architectural issues uncovered during the 10-dimensional Elite Audit, starting with quick confidence restorers.

## Execution Steps (Phase 0: Quick Confidence Restorers)

### 1. Fix ServicesHero colors and layout
- **Target Files**: `apps/web/src/components/services/ServicesHero.tsx`
- **Action**: Update the hardcoded `#FF2A2A` to the brand's crimson and widen the `minWidth` to properly fit the "Forgettable" word-swap.

### 2. Fix TimelineGantt out-of-bounds error
- **Target Files**: `apps/web/src/components/process/TimelineGantt.tsx`
- **Action**: Patch the out-of-bounds array access for Week 8 (`weeks[8]`).

### 3. Standardize Admin Toasts
- **Target Files**: `apps/web/src/pages/admin/AdminSiteAssets.tsx`
- **Action**: Standardize the toast notifications by swapping out the rogue `sonner` usage for the standard `useToast`.

### 4. Remove Phantom Dependency
- **Target Files**: `apps/web/src/components/shared/ErrorBoundary.tsx` (or wherever it is used)
- **Action**: Remove the phantom `@sentry/react` import that is missing from `package.json`.

### 5. Add Reduced Motion Support
- **Target Files**: `apps/web/src/index.css`
- **Action**: Add a global CSS override for `prefers-reduced-motion` to improve baseline accessibility.

## Verification
- Confirm that the `ServicesHero` displays the correct brand color.
- Verify that `TimelineGantt` renders without errors on Week 8.
- Verify `AdminSiteAssets` uses standard toasts.
- Verify the app builds without the `sentry` dependency.
- Verify `prefers-reduced-motion` exists in `index.css`.
