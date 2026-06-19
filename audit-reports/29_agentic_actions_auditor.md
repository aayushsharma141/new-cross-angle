# Agentic Actions Auditor — User-Triggered Async Actions

**Date:** 2026-06-19
**Scope:** All form submissions, mutations, CRUD operations, exports, and async user-triggered actions on admin + public surfaces.

---

## 1. Loading States Coverage

### 1.1 Admin Pages — Loading State Audit

| Page | Data Fetch Loading | Mutation Loading | Verdict |
|---|---|---|---|
| `AdminPortfolio.tsx` | React Query `isLoading` | `deleteMutation.isPending` via button disabling | ✅ Good |
| `AdminLeads.tsx` | React Query `isLoading` → `PageSkeleton` | `createMutation.isPending`, `updateMutation.isPending` | ✅ Good |
| `AdminGallery.tsx` | React Query `isLoading` | `createItemMutation.isPending`, etc. | ✅ Good |
| `AdminMilestones.tsx` | React Query `isLoading` | `createMutation.isPending`, etc. | ✅ Good |
| `AdminProcessSteps.tsx` | React Query `isLoading` | `createMutation.isPending`, etc. | ✅ Good |
| `AdminTeam.tsx` | React Query `isLoading` | `createMutation.isPending`, etc. | ✅ Good |
| `AdminTestimonials.tsx` | **No React Query** — manual `useState`/`useEffect` | `isSaving` boolean | ⚠️ Weak — no skeleton shown on initial load (line 51-52: just sets `setIsLoading(false)`) |
| `AdminHero.tsx` | **No React Query** — manual `useState`/`useEffect` | `isSaving` boolean | ⚠️ Weak — no page-level skeleton |
| `AdminBeforeAndAfter.tsx` | **No React Query** — manual fetch | `isSaving` boolean | ⚠️ Weak |
| `AdminServices.tsx` | **No React Query** — manual `useEffect` fetch | `isSaving` boolean | ⚠️ Weak |
| `AdminSiteAssets.tsx` | **No React Query** — manual `useEffect` fetch | No mutation | ❌ Fail — no loading state indicator at all |
| `AdminBlogPerformance.tsx` | Manual `useState` for loading | N/A (read-only) | ⚠️ Weak — manual loading flag |
| `AdminBlogEngagement.tsx` | Manual `useState` for loading | N/A (read-only) | ⚠️ Weak — manual loading flag |

### 1.2 Skeleton/Spinner Inconsistency

| Pattern | Used By | Verdict |
|---|---|---|
| `AdminSkeletonCard` (full page skeleton) | `AdminPortfolio`, `AdminServices`, `AdminTestimonials` | ✅ Good |
| `AdminSkeletonCard` + `DataLoadingBoundary` | `AdminPortfolio`, `AdminServices`, `AdminTestimonials` | ✅ Good |
| `PageSkeleton` (full page) | `AdminLeads`, `CrmAnalytics`, `CrmModule` | ✅ Good |
| `Skeleton` primitive | `AdminBlogOverview` | ✅ Good |
| `Loader2` spinner | `AdminTeam`, `AdminEstimateLeads` | ⚠️ Acceptable but less branded |
| **Nothing / blank content** | `AdminSiteAssets` | ❌ Fail |

---

## 2. Optimistic Updates

| Finding | Location | Severity |
|---|---|---|
| **Zero optimistic updates in codebase** | `grep -ri "useOptimistic\|setQueryData\|cancelQueries"` returned no results | **CRITICAL** — every mutation waits for server response + cache invalidation |
| AdminGallery: delete item → invalidate query → refetch | ~500ms-2s delay before item disappears | MAJOR — should remove from cache immediately |
| AdminLeads: stage change → update mutation → invalidate | Same delay pattern | MAJOR |
| AdminPortfolio: featured toggle → mutation → invalidate | No instant visual feedback on toggle | MAJOR |
| PriceEstimator: step navigation → no optimistic state | Already local state — OK | ✅ |

### Impact

Every mutable action on the site has a perceived delay of **200ms–2s** before the UI reflects the change. This is the single biggest interaction UX gap.

### Fix Priority

1. Toggle actions (publish/draft, featured, active/inactive) — highest ROI, instant feedback
2. Delete actions — remove item from local cache immediately, rollback on error
3. Create/update — insert into cache optimistically

---

## 3. Error Rollback

| Finding | Location | Severity |
|---|---|---|
| **No error rollback patterns exist** | All mutations | CRITICAL — if a mutation fails, UI remains in the "optimistic" state (if optimistic updates added) |
| Current pattern: all mutations use passive `invalidateQueries` on error → refetching replaces broken state | Adequate for now since no optimistic updates exist | ✅ Acceptable at current state |
| If optimistic updates are added (recommended), error rollback must also be added | All mutation sites | ⚠️ Future requirement |

---

## 4. Confirmation Dialog Consistency

| Pattern | Used By | Count of Usages |
|---|---|---|
| `ConfirmDialog` component (custom) | `AdminPortfolio`, `AdminLeads`, `AdminTestimonials`, `AdminBeforeAndAfter`, `AdminTeam`, `AdminMilestones`, `AdminEstimateRates`, `AdminHero` | 8 pages ✅ |
| `AlertDialog` (Radix primitive) | `AdminUserAccessUsers`, `AdminSettings`, `AdminUserAccessSecurity` | 3 pages ✅ |
| `window.confirm()` (native) | `AdminGallery` (lines 323, 329), `AdminEstimateLeads` (lines 122, 365, 428) | 2 pages ❌ |
| No confirmation (immediate delete) | Some inline delete buttons with no prior dialog | ⚠️ Check pending |

### Verdict: FAIL — 3 different confirmation patterns for the same action type

| Issue | Severity |
|---|---|
| `window.confirm()` is unstyled, non-branded, and provides no context about the item being deleted | MAJOR |
| `ConfirmDialog` and `AlertDialog` have different visual appearance and API | MAJOR |
| No standardized `confirmOrThrow` utility function | MAJOR |

### Fix
Create a single `useConfirmDialog()` hook with both modal styles (destructive/warning) and use it uniformly.

---

## 5. Idempotency & Double-Submit Protection

| Pattern | Coverage | Verdict |
|---|---|---|
| `disabled={isSaving}` on submit buttons | All admin forms with mutations | ✅ Good |
| `disabled={isPending}` on React Query mutations | Most React Query pages | ✅ Good |
| **No debounce on submit handlers** | Any rapid double-click on non-button elements | ⚠️ Weak — if a card/dropdown triggers an action, no guard |
| **No request deduplication** | Multiple rapid clicks on publish/toggle actions → multiple mutation calls | MINOR — React Query deduplicates but only for queries, not mutations |
| **Form submission with Enter key** — no guard against accidental double-submit | All `<form onSubmit>` handlers | MINOR |

---

## 6. Toast Notification System

### 6.1 System Fragmentation

| System | Import | Used By | Count |
|---|---|---|---|
| Custom `useToast` hook | `@/hooks/useToast` | 33+ admin pages | Primary system ✅ |
| `sonner` library | `import { toast } from "sonner"` | `AdminSiteAssets.tsx` only | 1 page ❌ |

### 6.2 Toast Pattern Coverage

| Action Type | Success Toast | Error Toast | Missing? |
|---|---|---|---|
| Create | ✅ Yes | ✅ Yes | — |
| Update | ✅ Yes | ✅ Yes | — |
| Delete | ✅ Yes | ✅ Yes | — |
| Bulk actions | ⚠️ No bulk actions exist yet | — | N/A |
| Form submission error | ✅ Yes | ✅ Yes | — |
| Auto-save | — | — | No auto-save exists |
| File upload | ✅ Yes | ✅ Yes | `AdminMedia.tsx` ✅ |

### 6.3 Toast UX Issues

| Issue | Severity |
|---|---|
| Success toasts may not auto-dismiss — verify toast config | MINOR |
| Error toasts stack — multiple errors shown simultaneously | MINOR — could be overwhelming |
| No undo action in toasts (e.g., "Post deleted. Undo?") | MAJOR — no way to recover from accidental deletes |
| `sonner` and `useToast` have different visual appearance | MAJOR — `AdminSiteAssets.tsx` toast looks different from all others |

---

## 7. Network Resilience

| Scenario | Current Behavior | Severity |
|---|---|---|
| **React Query pages (offline)** | React Query has built-in retry; stale data from cache is shown | ✅ Good |
| **Manual fetch pages (offline)** (`AdminServices`, `AdminHero`, `AdminTestimonials`, `AdminBeforeAndAfter`, `AdminSiteAssets`) | `supabase.from(...)` call fails → error toast shown, data appears as empty | ❌ CRITICAL — no offline fallback |
| **Mutation fails mid-flight** | Error toast shown, data may be inconsistent | ⚠️ Acceptable |
| **Auth session expires during action** | Supabase returns 401 → likely unhandled redirect | MAJOR — no proactive session check on mutation |
| **Slow network (3G)** | No timeout on fetch calls | MAJOR — requests can hang indefinitely |

### Pages at Risk (no React Query = no retry, no cache)

- `AdminServices.tsx`
- `AdminHero.tsx`
- `AdminTestimonials.tsx`
- `AdminBeforeAndAfter.tsx`
- `AdminSiteAssets.tsx`

---

## 8. Mutation Inventory (Complete)

| Page | Create | Read | Update | Delete | Bulk | Export |
|---|---|---|---|---|---|---|
| `AdminPortfolio` | ✅ Dialog form | ✅ React Query | ✅ Dialog form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminLeads` | ✅ Sheet form | ✅ React Query | ✅ Sheet form | ✅ ConfirmDialog | ❌ | ✅ (Download) |
| `AdminGallery` | ✅ Dialog form | ✅ React Query | ✅ Dialog form | ✅ `window.confirm()` | ❌ | ❌ |
| `AdminServices` | ✅ Dialog form | ✅ `useEffect` | ✅ Dialog form | ✅ AlertDialog | ❌ | ❌ |
| `AdminBlogs` | ✅ Editor tab | ✅ BlogList | ✅ Editor form | ✅ Permissions check | ❌ | ❌ |
| `AdminHero` | ✅ Inline form | ✅ `useEffect` | ✅ Inline form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminTeam` | ✅ Dialog form | ✅ React Query | ✅ Dialog form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminMilestones` | ✅ Dialog form | ✅ React Query | ✅ Dialog form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminProcessSteps` | ✅ Dialog form | ✅ React Query | ✅ Dialog form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminTestimonials` | ✅ Dialog form | ✅ `useEffect` | ✅ Dialog form | ✅ ConfirmDialog | ❌ | ❌ |
| `AdminMedia` | ✅ Upload modal | ✅ React Query | ❌ (rename?) | ✅ ConfirmDialog | ✅ Bulk delete | ❌ |
| `AdminEmailTemplates` | ✅ Edit | ✅ `useEffect` | ✅ Save | ❌ | ❌ | ❌ |
| `AdminSettings` | ❌ | ✅ React Query | ✅ Save | ❌ | ❌ | ❌ |
| `AdminUserAccessUsers` | ❌ | ✅ React Query | ✅ Role change | ❌ | ❌ | ❌ |
| `AdminEstimateLeads` | ❌ | ✅ React Query | ✅ Status change | ✅ `window.confirm()` | ❌ | ❌ |
| `ContactPage` | ✅ Form submit | N/A | ❌ | ❌ | ❌ | ❌ |
| `PriceEstimator` | ✅ Lead capture | N/A | ❌ | ❌ | ❌ | ❌ |

---

## Severity Summary

| Severity | Count | Top Issues |
|---|---|---|
| CRITICAL | 3 | Zero optimistic updates; no focus traps on modals; 6 pages have no offline/retry |
| MAJOR | 8 | 3 confirmation dialog patterns; `sonner`/`useToast` fragmentation; no undo actions; no mutation timeout; no session expiry handling; A-Gallery/A-EstimateLeads use `window.confirm()`; 5 pages lack React Query resilience |
| MINOR | 5 | Auto-dismiss timing; toast stacking; Enter key double-submit; no mutation deduplication; some spinners instead of branded skeletons |

---

## Priority Fix Recommendations

1. **Add optimistic updates** — start with toggle/publish actions for highest UX impact
2. **Standardize confirmation dialogs** — replace `window.confirm()` with `ConfirmDialog` everywhere
3. **Consolidate toast system** — drop `sonner`, use `useToast` everywhere
4. **Add undo to destructive actions** — "X deleted. Undo?" toast with 5s timeout
5. **Refactor 5 pages to React Query** — `AdminServices`, `AdminHero`, `AdminTestimonials`, `AdminBeforeAndAfter`, `AdminSiteAssets`
6. **Add mutation timeout** — 15s timeout on all mutation calls with user-facing message
7. **Add session expiry handling** — intercept 401 responses and redirect to login with context-preserving message
