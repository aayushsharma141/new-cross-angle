# Admin Panel Structural Fix Plan

> **Status**: Approved (v2)  
> **Scope**: `/admin/*` only — public site audit is a separate track  
> **Created**: 2026-05-13  
> **Author**: Engineering audit  

---

## Root Cause Summary

Four overlapping structural problems:

1. **Design tokens silently broken in 25+ files** — `-admin-primary` (no prefix) is not a valid Tailwind class. Tailwind drops it. All gold accents, hover tints, icon highlights, and link hover states are invisible. Plus 7 broken alpha-syntax instances in `admin-theme.css` (space before `/` in `] / 90%`).

2. **Three competing page-header components** — `AdminPageHeader` (tokens), `PageHeader` (legacy design-system), `ModuleHeader` (Framer Motion + tokens). Each uses different typography, spacing, and breadcrumb patterns. TopBar bypasses theme entirely with hardcoded `bg-black/60` + `from-yellow-400 to-yellow-600`.

3. **UI promises behavior the code doesn't deliver** — Dashboard masks failures as `0`, AdminServices hardcodes `status="published"`, AdminTeamMembers has a non-persisted Published toggle, CommandPalette is coded but never mounted.

4. **Accessibility and route integrity gaps** — Sub-11px text, stale route paths in QuickActions and build scripts, no focus traps on custom modals.

---

## Decisions

| Decision | Answer | Rationale |
| -------- | ------ | --------- |
| Phase 0 now? | **Yes** | Low risk, instant visual payoff |
| Published toggle | **Remove** | No backing column; add back via migration ticket |
| Breadcrumb location | **Page-header only** | Drop TopBar breadcrumb entirely |
| Focus-trap approach | **Radix Dialog** project-wide | Already in deps |
| Phase 4 transactions | **Postgres RPC** for AdminServices, **compensating delete** for AdminMedia | |
| Header architecture | **Two components** | `ModuleLayout` for 14 module-nested pages, `AdminPageHeader` for 7 standalone pages. No double-headers. |
| Action-slot mechanism | **React Router Outlet context** | Idiomatic for nested routes; avoids prop-drilling through route tree |

---

## Phase 0 — Hotfixes ✅ COMPLETE

> **Completed**: 2026-05-13
> **Build**: `npm run build` exit 0. CSS bundle 244.08 kB → 245.49 kB (+1.4 kB gzipped — dropped classes now compile).

### Phase 0: What shipped

| Change | Files | Count |
| ------ | ----- | ----- |
| CSS alpha-modifier space bugs (`] / 90%` → `]/0.9)`) | `admin-theme.css` | 7 lines |
| Malformed `-admin-*` classes → proper `text-`/`bg-`/`border-`/`ring-` prefixes | AdminBreadcrumb, TopBar, MediaPickerModal, MediaUploadZone, MediaPicker, MediaGrid, LeadDetailSheet, AuditLogTable | 30 occurrences |
| Sub-11px typography bumps (WCAG) | `TopBar.tsx` | 5 instances + zinc-600→zinc-400 contrast fix |
| Mojibake audit | `AdminDashboard.tsx` | No-op — `─` box-drawing + `₹` rupee symbols are intentional |
| Hook-rule extraction | `GeneralSettingsForm.tsx` | No-op — already fixed in prior session |

### Pattern B discovery (mid-sweep)

Found 44+ additional silent-fail occurrences using `bg-admin-card`, `text-admin-muted`, `border-admin-accent`, `hover:border-admin-gold/30` etc. — valid utility-class syntax but `admin-*` is not registered in `tailwind.config.ts`.

**Decision**: Pull `tailwind.config.ts` token registration forward from Phase 1 into Phase 0. Additive change, zero JSX edits, fixes all 44+ invisible styles instantly.

---

## Phase 1 — Design System Consolidation ✅ COMPLETE

> **Completed**: 2026-05-13
> **Build**: `npm run build` exit 0. CSS bundle 245.49 → 248.31 kB (+2.82 kB across Phase 1 + 1.5).

### Phase 1: What shipped

| Stage | Files | Detail |
| ----- | ----- | ------ |
| Token registration | `tailwind.config.ts` | All `admin-*` CSS vars registered as Tailwind colors (pulled forward from Phase 1 into Phase 0) |
| TopBar rewrite | `TopBar.tsx` | Deleted `getDynamicBreadcrumbs()`, migrated to design tokens, WCAG contrast fixes |
| QuickActions migration | `QuickActions.tsx` | Stale routes → `ADMIN_ROUTES` constants |
| Route constants | `src/lib/admin-routes.ts` | Single source of truth for all admin nav |
| AdminPageHeader upgrade | `AdminPageHeader.tsx` | Composes `AdminBreadcrumb` internally, auto-derives breadcrumbs from URL |
| ModuleLayout refactor | `ModuleLayout.tsx` | Canonical module header with breadcrumb + action portal slot (`ModuleActions`) |
| Module children simplified (5) | Portfolio, Blogs, Services, Media, EstimateLeads | Removed `AdminPageHeader`, actions via `ModuleActions` portal |
| Module children stripped (6) | Testimonials, Team, Hero, Gallery, BlogOverview, EstimateRates | Removed inline h1, actions via `ModuleActions` portal |
| Standalone pages migrated (6) | Dashboard, Users, Settings, TeamMembers, AuditLogs, Analytics | Migrated to `AdminPageHeader` |
| Deleted | `ModuleHeader.tsx`, `PageHeader.tsx` | Legacy header components removed |

### Architecture

Two header components, one per context. Zero double-headers on any page.

| Category | Header | Pages | Provides |
| -------- | ------ | ----- | -------- |
| Module-nested (14) | `ModuleLayout` | All CMS/CRM/Blog/Estimator children | Breadcrumb → title → tabs → action slot |
| Standalone (7) | `AdminPageHeader` | Dashboard, Hub, Users, Settings, TeamMembers, AuditLogs, Analytics | Breadcrumb → title → description → action slot |

### CSS bundle progression

| Stage | Bundle | Delta |
| ----- | ------ | ----- |
| Start of Phase 0 | 244.08 kB | — |
| End of Phase 0 | 245.49 kB | +1.41 kB |
| Token registration | 247.36 kB | +1.87 kB |
| Phase 1 (TopBar/QuickActions) | 248.01 kB | +0.65 kB |
| Phase 1.5 (Option 3) | 248.31 kB | +0.30 kB |
| **Total new CSS** | | **+4.23 kB** |

> **Status**: Awaiting visual review before proceeding to Phase 2.

---

## Phase 2 — UI-Behavior Fixes ✅ COMPLETE

> **Completed**: 2026-05-13
> **Build**: `npm run build` exit 0. CSS bundle 248.31 → 248.96 kB (+0.65 kB for degraded-state UI + admin-foreground token).

### Phase 2: What shipped

| Task | Outcome |
| ---- | ------- |
| Expand StatusBadge to support `review` | No-op — already supports `draft`, `published`, `archived`, `review` |
| Fix hardcoded published status in AdminServices | No-op — already reads `service.active !== false` (April audit was stale) |
| Remove fake Published toggle in AdminTeamMembers | Done — dropped hardcoded "Active" column + header + colSpan adjustments |
| Dashboard degraded-state | Done — per-source error map (7 keys), `⚠ —` on affected KPI, banner with Retry + Dismiss, lists affected metrics by name |
| Mount CommandPalette with Ctrl+K | Done — mounted in AdminLayout, routes wired through `ADMIN_ROUTES` |
| Bonus: admin-foreground token | Added alias to `tailwind.config.ts` — AdminKPI was using it but it was silently broken |

### Files modified (6)

- `tailwind.config.ts` — admin-foreground alias
- `AdminKPI.tsx` — `isError` + `errorLabel` props
- `AdminDashboard.tsx` — sourceErrors map, banner upgrade, refetch
- `AdminTeamMembers.tsx` — remove hardcoded Active column
- `CommandPalette.tsx` — `ADMIN_ROUTES` instead of string literals
- `AdminLayout.tsx` — mount CommandPalette

> **Status**: Awaiting verification (Ctrl+K navigation, degraded-state banner, team members table) before Phase 3.

---

## Phase 3 — Accessibility & Interaction ✅ COMPLETE

> **Completed**: 2026-05-13
> **Build**: `npm run build` exit 0. CSS bundle 248.96 → 249.08 kB (+0.12 kB).

### Phase 3: What shipped

| Task | Outcome |
| ---- | ------- |
| Audit admin modals for focus traps | No-op — every modal already uses Radix Dialog/AlertDialog/Sheet + cmdk Command.Dialog. All have focus trap + Esc + aria-modal. |
| Migrate hand-rolled modals to Radix | No-op — none to migrate |
| Keyboard shortcuts overlay | New `KeyboardShortcutsOverlay` component + `useKeyboardShortcutsHelp()` hook. `?` key toggles. Suppressed when typing in inputs. Mounted in AdminLayout. |
| Touch-target audit | TopBar Avatar trigger + Logout button bumped from h-8 (32px) to h-10 (40px). WCAG 2.1 AA passes. |

### Files changed (3)

- `KeyboardShortcutsOverlay.tsx` — new, 132 lines
- `AdminLayout.tsx` — mount overlay + bind `?` key
- `TopBar.tsx` — h-8 → h-10 on 2 buttons

---

## Phase 4 — Data Integrity

### Phase 4a — Static route emission ✅ COMPLETE

> **Completed**: 2026-05-13
> **Build**: exit 0. 42 routes emitted (12 public + 30 admin).

**Approach**: Created a plain-JS sidecar `scripts/admin-route-paths.js` (mirrors `ADMIN_ROUTES` paths) since `copy-indexes.js` runs under plain `node` with no `tsx`. Rewrote `copy-indexes.js` to import from the sidecar instead of hardcoded strings. Added a `⚠️ STATIC ROUTE SIDECAR` warning in `admin-routes.ts` telling devs to keep both in sync.

**Bonus**: 6 module-index routes were missing from the old hardcoded list and are now emitted:
`/admin/cms`, `/admin/crm`, `/admin/discovery`, `/admin/estimator`, `/admin/blog`, `/admin/system`

**Files changed (3)**:

- `scripts/admin-route-paths.js` — new, plain-JS sidecar (30 admin paths)
- `scripts/copy-indexes.js` — rewritten, imports from sidecar
- `src/lib/admin-routes.ts` — header comment updated with sidecar cross-reference

### Phase 4b — Transactional writes ✅ COMPLETE

> **Completed**: 2026-05-13
> **Goal**: Make Admin data operations robust against partial failures.

1. **AdminServices Postgres RPC**: Created `upsert_service` RPC to wrap service + steps + faqs into an atomic transaction. Replaced manual multi-step `INSERT`/`UPDATE` logic in `AdminServices.tsx` with a single call to `supabase.rpc('upsert_service', ...)`.
2. **AdminMedia & MediaPickerModal compensating delete**: Maintained manual compensatory logic in `AdminMedia.tsx` and **added missing DB insertion and compensating delete to `MediaPickerModal.tsx`** so files uploaded from the modal aren't orphaned in storage.

---

## Session summary — 2026-05-13

### Final status

| Phase | Status | CSS Delta |
| ----- | ------ | --------- |
| 0 — Hotfixes + token registration | ✅ Complete | +3.28 kB |
| 1 — Header architecture (Option 3) | ✅ Complete | +0.95 kB |
| 2 — UI behavior | ✅ Complete | +0.65 kB |
| 3 — Accessibility | ✅ Complete | +0.12 kB |
| 4a — Static route emission | ✅ Complete | — |
| 4b — Transactional writes | ✅ Complete | — |
| **Total recovered CSS** | | **+5.00 kB** |

### What this session delivered

- +5.00 kB of previously-invisible CSS now renders (gold accent system, foreground tokens, alpha modifiers)
- 21 admin pages unified on two header archetypes — zero double-headers
- `Ctrl+K` command palette and `?` shortcut overlay wired globally
- Dashboard honestly reports degraded data state instead of silent zeros
- 6 missing static routes fixed (module-index 404 on hard-refresh in production)
- Data consistency restored via transactional atomic DB writes for services and DB entry/compensation for media uploads.

---

## Phase 5 — Audit Fix Sweep ✅ COMPLETE

> **Completed**: 2026-05-14  
> **Trigger**: Cross-audit of two validation reports (Report 1: test-suite pass; Report 2: code-level audit with 33 findings).  
> **Build**: exit 0 (42 routes). ESLint: 0 warnings.

### Phase 5A — Data Integrity & Broken Features (12 fixes)

| # | File | Fix |
| --- | ------ | ----- |
| 1 | `AdminHub.tsx` | Replaced `window.location.href` with `navigate()` — SPA state preserved on CTA clicks |
| 2 | `AdminHub.tsx` | Added `.error` guard on all 5 Supabase queries — null counts no longer crash the hub |
| 3 | `AdminAnalytics.tsx` | Added `onClick={() => setSelectedSession(session)}` + `cursor-pointer` to session `TableRow` — session detail dialog now reachable |
| 4 | `AdminBlogs.tsx` | Replaced `.upsert()` with `.update().in('id', ids)` — bulk status change no longer overwrites unrelated columns |
| 5 | `DataTable.tsx` | Wired `state.pagination` to table instance + rewrote all 4 pagination buttons with `onPaginationChange` and bounds checks |
| 6 | `AdminLeads.tsx` | Wrapped delete in `ConfirmDialog` (dropdown + sheet). Added `onError` to `deleteMutation` |
| 7 | `AdminTeamMembers.tsx` | Added `key={editingMember?.id ?? "new"}` to form — forces remount with fresh `defaultValues` (fixes stale form fields) |
| 8 | `PortfolioFormDialog.tsx` | Re-enabled hero image `MediaPicker` button with `mediaPickerTarget` state routing |
| 9 | `MediaDetailsSheet.tsx` | Replaced render-time `setState` with `useEffect` keyed on `file?.id` — fixes stale AI metadata on sheet re-open |
| 10 | `AdminServices.tsx` | Preserved existing `display_order` on edit instead of resetting to `0` |
| 11 | `AdminBlogPerformance.tsx` | Fixed `created_at` sort — compares as `Date` timestamps, not string-to-number coercion |
| 12 | `RichTextEditor.tsx` | Blocks `javascript:`, `data:`, `vbscript:` URLs in link insertion (XSS prevention) |

### Phase 5B — Security & Tooling (3 fixes)

| # | File | Fix |
| --- | ------ | ----- |
| 13 | `App.tsx` | Added `RoleGuard allowedRoles={["super_admin", "admin"]}` to `AdminEstimateLeads` route — was the only unguarded data route |
| 14 | `AdminAuth.tsx` | Wired "Keep me signed in" checkbox: registers `pagehide` → `signOut` listener when unchecked. Added `replace: true` to post-login navigation |
| 15 | `.gitignore` + `eslint.config.js` | Added `vite.config.ts.timestamp-*.mjs` and `*.tsbuildinfo` globs to both ignore lists. Deleted 21 stale timestamp artifacts from repo root |

---

## Follow-ups (not urgent — file for next route addition)

### FU-1 — Sidecar drift check (medium priority)

**Risk**: someone adds a route to `admin-routes.ts`, forgets `admin-route-paths.js`, static emission silently drops it.

**Fix option A** — regex parse (no new deps):

```js
// In copy-indexes.js, after importing sidecar:
const tsSource = fs.readFileSync('src/lib/admin-routes.ts', 'utf8');
const tsPaths = [...tsSource.matchAll(/path:\s*"(\/admin[^"]*)"/g)].map(m => m[1]);
const missing = tsPaths.filter(p => !ADMIN_STATIC_PATHS.includes(p));
if (missing.length) { console.error('Sidecar missing paths:', missing); process.exit(1); }
```

**Fix option B** — Vite plugin emits `admin-routes.json` post-build, eliminating the sidecar entirely. `copy-indexes.js` reads the JSON. Single source of truth restored.

→ **Trigger**: implement when someone adds a route and forgets the sidecar.

### FU-2 — TS circularity fix (low priority, clean-up)

`admin-routes.ts` has a pre-existing circular type error (`parent` references `AdminRouteKey` which references `typeof ADMIN_ROUTES` which contains `parent`). Doesn't block Vite/esbuild but will surface in `tsc --noEmit` CI steps.

**Fix**: break the cycle by typing `ADMIN_ROUTES` explicitly:

```ts
// Replace:
} as const satisfies Record<string, AdminRoute>;

// With:
} satisfies Record<string, { path: string; label: string; parent?: string }>;
```

Then derive `AdminRouteKey` from `keyof typeof ADMIN_ROUTES` as before — circularity gone.

→ **Trigger**: implement when CI type-check step is added, or at start of Phase 4b.

### FU-3 — Phase 4b resume checklist

Bring to next session:

- [ ] `supabase/migrations/` directory listing (check for any existing `*service*` or `*upsert*` RPCs)
- [ ] `supabase/functions/` listing (check for existing edge functions handling media upload)
- [ ] Confirm actual table name: `media_items` or `media`?
- [ ] RLS policies for: `services`, `service_steps`, `service_faqs`, and the media table
- [ ] Confirm whether Supabase project is on free tier (affects edge function cold start strategy)
