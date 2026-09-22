# Vibe Code Auditor — Code Smell, Duplication & Technical Debt

**Date:** 2026-06-19
**Scope:** Dead code, unused imports, duplicated patterns, import path drift, naming inconsistencies, orphaned files, phantom dependencies

---

## 1. Dead / Orphaned Files

### [CRITICAL] 1.1 `AdminMediaOld.tsx` — Full Duplicate

```
apps/web/src/pages/admin/AdminMedia.tsx       (633 lines, active)
apps/web/src/pages/admin/AdminMediaOld.tsx     (633 lines, orphaned — "Old" suffix)
```

Both files export a default function. Both are nearly identical in structure. The `Old` variant likely survives from a refactor and remains importable — if any route still references it, the old version could load.

**Risk:** Dual maintenance surface. If routes point to the old version, fixes applied to `AdminMedia.tsx` don't take effect.

**Fix:** Delete `AdminMediaOld.tsx` after confirming no imports reference it.

### [CRITICAL] 1.2 `@sentry/react` — Phantom Dependency

`apps/web/src/components/shared/ErrorBoundary.tsx:28`:

```typescript
const Sentry = await import("@sentry/react");
```

**But** `@sentry/react` is **not listed** in `apps/web/package.json` dependencies.

**Risk:** The dynamic import will fail silently at runtime. `ErrorBoundary.tsx` catches its own errors, so the failure is swallowed. Sentry error reporting is non-functional.

**Fix:** Either add `@sentry/react` to `package.json` or remove the dynamic import block.

### [MAJOR] 1.3 `AdminButton.tsx` — Unused Component

`apps/web/src/components/admin/ui/AdminButton.tsx` — 81 lines, exports `AdminButton` + `AdminButtonGroup`.

**Used by:** Only `AdminEmptyState.tsx` (internally).
**Directly imported by:** **Zero admin pages.**

An entire component variant that no page chooses to use. Either delete it (dead code) or promote it as the standard admin button.

### [MAJOR] 1.4 `recovered_AdminMedia.tsx` — Stale Recovery Artifact

Found at workspace root: `C:\Users\aayus\Desktop\main\recovered_AdminMedia.tsx`

**Fix:** Delete — not in any source directory, not tracked meaningfully.

### [MAJOR] 1.5 `cms_module_finding.md` — Markdown in Source Directory

`apps/web/src/pages/admin/modules/cms_module_finding.md` — a markdown documentation file inside a TypeScript source directory.

**Fix:** Move to `docs/` or `audit-reports/`, not inside `pages/`.

### [MINOR] 1.6 `BlueprintPage.v1-archive.tsx` — Archived Component

Referenced in `docsRegistry.ts` but may still exist in source directory. Verify if it's in `pages/` or properly archived.

---

## 2. Duplicate Query Keys

### [MAJOR] 2.1 AdminMilestones — Dual Invalidation

`apps/web/src/pages/admin/AdminMilestones.tsx`:

- Line 65-66: `queryClient.invalidateQueries({ queryKey: ["studio-milestones"] })`
- Lines 99-100, 124-125: `queryClient.invalidateQueries({ queryKey: ["studioMilestones"] })`

Two different query keys for the same data. The second one (camelCase) likely never matches, meaning invalidations at lines 99 and 124 have no effect — the table doesn't refresh after create/delete.

### [MAJOR] 2.2 AdminProcessSteps — Same Bug

`apps/web/src/pages/admin/AdminProcessSteps.tsx`:

- Lines 72-73: `["design-process-steps"]`
- Lines 112-113, 137-138: `["designProcessSteps"]`

Same. Invalidations after update/delete are silently no-ops.

---

## 3. Import Path Drift

### [MAJOR] 3.1 Button Import Inconsistency

| Page | Import Path | Status |
| --- | --- | --- |
| **`AdminServices.tsx`** | `@/design-system/components/Button` | Outlier ❌ |
| All other 30+ admin pages | `@/components/ui/primitives/button` | Standard ✅ |

Two versions of the Button component may have different styling, behavior, or props.

### [MAJOR] 3.2 Input Import Inconsistency

| Page | Import Path | Status |
| --- | --- | --- |
| **`AdminServices.tsx`** | `@/design-system/components/Input` | Outlier ❌ |
| All other admin pages | `@/components/ui/primitives/input` | Standard ✅ |

Same risk — different Input implementations.

### [MINOR] 3.3 `icons` Token Import — Good Practice But Isolated

`@/design-system/tokens/icons` is imported by 7 admin pages. This is good abstraction but creates a dependency on the design-system tokens barrel. Verify that icons token is used uniformly.

---

## 4. CRUD Pattern Fragmentation (4 Patterns)

| Pattern | Pages | Characteristic |
| --- | --- | --- |
| **A: React Query + Dialog form** | `AdminGallery`, `AdminMilestones`, `AdminProcessSteps`, `AdminTeam`, `AdminPortfolio`, `AdminLeads` | `useMutation` + `useQueryClient` + Dialog/Sheet form + `invalidateQueries()` |
| **B: Manual supabase + local state** | `AdminHero`, `AdminTestimonials`, `AdminBeforeAndAfter`, `AdminSiteAssets` | `useState` + `useEffect` + direct `supabase.from(...)` calls |
| **C: Direct supabase + custom handlers** | `AdminServices` | Uses `@/design-system/components/Button` instead of primitives |
| **D: Full module decomposition** | `AdminDiscoveryConfig`, `AdminPricingConfig` | Entirely composed of child editors, minimal page-level logic |

### Why This Matters

- Pattern B pages lack: cache, retry, stale-while-revalidate, deduplication
- Pattern A pages average **150-200 lines of boilerplate CRUD** each — this could be extracted
- Pattern D shows the ideal end state but is only used for 2 pages

---

## 5. Naming Convention Drift

| Convention | Example Locations | Issue |
| --- | --- | --- |
| kebab-case query keys | `["studio-milestones"]`, `["design-process-steps"]` | ✅ Good |
| camelCase query keys | `["studioMilestones"]`, `["designProcessSteps"]` | ❌ Inconsistent — mixed with kebab |
| PascalCase files | Most `.tsx` files | ✅ Consistent |
| snake_case DB columns | `display_order`, `author_name` | ✅ Consistent with Supabase |
| camelCase JS variables | `handleSubmit`, `fetchTestimonials` | ✅ Consistent |
| Mixed toast imports | `useToast` vs `sonner` | ❌ Inconsistent |

---

## 6. Unused / Dead Imports

| File | Unused Import | Evidence |
| --- | --- | --- |
| `AdminGallery.tsx` | `icons` from `@/design-system/tokens/icons` (line 4) | Imported but grep shows no usage of icons object in the file — used only as type |
| `AdminTeam.tsx` | `React` (line 1) | "import React from 'react'" unnecessary in React 17+ with jsx:react-jsx |
| `AdminMilestones.tsx` | `React` (line 1) | Same |
| `AdminProcessSteps.tsx` | `React` (line 1) | Same — but `import React from 'react'` is used at line 1 |
| Various admin pages | `React` import | ~30% of files have unnecessary React import (React 18 + Vite) |

---

## 7. Large File Hotspots

| File | Lines | Issue |
| --- | --- | --- |
| `BlueprintPage.tsx` | ~1200+ | Single file with all timeline + layout content. Should be decomposed into 3-4 components. |
| `AdminHero.tsx` | 592 | Inline editing state with 8 `useState` vars, all CRUD logic inline |
| `AdminGallery.tsx` | 670 | Two separate CRUD workflows (items + categories) in one file |
| `AdminLeads.tsx` | 530 | Complex filtering, sorting, URL sync, sheet management, all in one page |
| `AdminServices.tsx` | 591 | Form state management + CRUD + icon selection |
| `ProjectPage.tsx` | ~800+ | Multiple sections (hero, journey, gallery, prev/next) — high complexity |

---

## 8. Legacy / Outdated Patterns

| Pattern | Location | Modern Alternative |
| --- | --- | --- |
| `import React from 'react'` | Many files | Not needed in React 18 + Vite |
| `window.confirm()` | `AdminGallery.tsx:323,329`, `AdminEstimateLeads.tsx:122,365,428` | Custom `ConfirmDialog` component |
| `sonner` toast | `AdminSiteAssets.tsx` | Unified `useToast` hook |
| Manual `useState`+`useEffect` fetching | 5 admin pages + `AdminSiteAssets` | React Query `useQuery` |
| Dynamic `import("@sentry/react")` without package dep | `ErrorBoundary.tsx:28` | Proper package.json dependency |

---

## 9. Redundancy / Over-Abstraction

| Pattern | Assessment |
| --- | --- |
| `AdminFilterBar` shared component | ✅ Good — reused across `AdminPortfolio`, `AdminServices`, `AdminBeforeAndAfter`, `AdminTeam` |
| `AdminMetricsPanel` shared component | ✅ Good — reused across admin pages |
| `AdminSafeAction` wrapper | ⚠️ Minimal usage — only 2 pages use it |
| `AdminSkeletonCard` + `DataLoadingBoundary` | ⚠️ Two overlapping loading abstractions — `DataLoadingBoundary` renders `AdminSkeletonCard` inside it, creating nested abstraction |
| `AdminAddCard` as sub-export of `AdminEmptyState` | ⚠️ Odd import path — imported via `{ AdminAddCard } from "@/components/admin/shared/AdminEmptyState"` — should be a direct export |

---

## Score Summary

| Category | Score | Grade |
| --- | --- | --- |
| Dead/orphaned files | 30% | F |
| Import consistency | 40% | D |
| CRUD pattern consistency | 25% | F |
| Naming consistency | 60% | D |
| File size discipline | 35% | F |
| Legacy pattern cleanup | 40% | D |
| **Overall Code Health** | **38%** | **Significant technical debt accumulation** |
