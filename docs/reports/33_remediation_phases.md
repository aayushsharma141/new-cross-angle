# Remediation Phases — Prioritized by Impact & Intelligence Required

**Derived from:** `mentor_crosscheck_report.md` (27 findings, 3-expert verified)
**Framework:** Each phase groups related fixes by agent-type affinity (Fullstack, UI/UX, Backend, DevOps) so you can switch agents optimally.

---

## Phase 0: Quick Confidence Restorers (< 1 hour, any agent)

Low cognitive load, no architectural decisions needed. Pick any.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 3 | ServicesHero uses `#FF2A2A` (not brand crimson) | `ServicesHero.tsx` | 10min | 🎨 UI/UX |
| 7 | ServicesHero word-swap `minWidth` too narrow for "Forgettable" (10ch vs 6ch) | `ServicesHero.tsx` | 5min | 🎨 UI/UX |
| 14 | Timeline Gantt Week 8 out-of-bounds (`weeks[8]` → `undefined`) | `TimelineGantt.tsx` | 15min | 🏗️ Fullstack |
| 6 | Mixed toast libraries: `sonner` vs `useToast` in admin | `AdminSiteAssets.tsx` | 10min | 🏗️ Fullstack |
| 25 | Phantom `@sentry/react` dependency (imported but not in package.json) | `ErrorBoundary.tsx` | 10min | 🏗️ Fullstack |
| 23 | Zero `prefers-reduced-motion` support — add global CSS override | `index.css` | 15min | 🎨 UI/UX + 🏗️ Fullstack |

**Total effort:** ~1hr

---

## Phase 1: Frontend Trust & Credibility (Critical UX, 2–3hr)

**Theme:** Visitors see contradictory data. Fix this before anything else.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 1 | **Metrics drift** — 4 contradictory stat sets across Hero, CredibilityStrip, Home About, and AboutPage | `Hero.tsx:348-354`, `CredibilityStrip.tsx:10-14`, `About.tsx:51-60`, `AboutStats.tsx:63-66` | 1.5hr | 🏗️ Fullstack |
| 4 | Missing `FixedSocialBar` on 3 slug pages (ServiceCategory, ServiceDetail, BlogDetail) — or move to PublicLayout | `ServiceCategoryPage.tsx`, `ServiceDetailPage.tsx`, `BlogDetailPage.tsx`, `PublicLayout.tsx` | 15min | 🏗️ Fullstack |
| 2 | **BlogDetailPage** — 20+ inline `style={{ color: CRIMSON }}` using JS constant instead of Tailwind `text-site-crimson` | `BlogDetailPage.tsx` | 2hr | 🎨 UI/UX + 🏗️ Fullstack |

**Total effort:** ~3.5hr

**Agent handoff note:** #1 requires understanding both the `useSiteSettings()` hook and the admin stats backend. Start with #4 (trivial layout fix), then #2 (styling), then #1 (data layer).

---

## Phase 2: Keyboard & Screen Reader Gate (Critical Accessibility, 3–4hr)

**Theme:** These are WCAG 2.1 AA violations that block keyboard-only and screen reader users entirely.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 22 | **No focus traps on any modal/dialog** — GalleryLightbox, LeadDetailSheet, ConfirmDialog, PortfolioFormDialog, HeroMediaPickerModal, BlogEditorForm | `GalleryLightbox.tsx`, `AdminLeads.tsx`, `ConfirmDialog.tsx`, `PortfolioFormDialog.tsx`, `HeroMediaPickerModal.tsx` | 2hr | 🏗️ Fullstack |
| 17 | **Lightbox modal focus trapping** — GalleryLightbox allows tab focus behind backdrop | `GalleryLightbox.tsx` | 20min | 🏗️ Fullstack |
| — | SkipNav missing from public layout | `PublicLayout.tsx` | 15min | 🏗️ Fullstack |

**Total effort:** ~2.5hr

**Agent handoff note:** The focus trap fix requires either wrapping every modal in `<FocusTrap>` (from `react-focus-lock`) or migrating to Radix UI Dialog primitives which handle it natively. These are architecturally-dependent decisions — Fullstack agent required.

---

## Phase 3: Admin Consistency & Data Fetching Unification (Major Backend/Fullstack, 4–6hr)

**Theme:** 4 different CRUD patterns, 2 toast systems, 3 confirmation dialog patterns.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 27 | **Universal Admin CRUD Unification** — Standardize on React Query + `useToast` + `ConfirmDialog` across all admin modules | `AdminServices.tsx`, `AdminTestimonials.tsx`, `AdminHero.tsx`, `AdminBeforeAndAfter.tsx`, `AdminSiteAssets.tsx`, `AdminGallery.tsx` | 4hr | 🏗️ Fullstack + 🔧 Backend |
| 5 | AdminSiteAssets uses `useState+useEffect` instead of React Query | `AdminSiteAssets.tsx` | 30min | 🏗️ Fullstack |
| 20 | Inconsistent CMS CRUD form and fetching patterns | All admin CMS modules | 3hr | 🏗️ Fullstack |
| 13 | Admin component import fragmentation (`@/design-system` vs `@/components/ui/primitives`) | `AdminServices.tsx`, `AdminUsers.tsx`, `AdminUserAccessUsers.tsx`, `AdminQuizAnalytics.tsx` | 2hr | 🏗️ Fullstack |

**Total effort:** ~5-6hr (can parallelize)

**Agent handoff note:** This is the largest phase. Break into sub-phases:

- 3a. Migrate 5 remaining pages to React Query (AdminServices, AdminHero, AdminTestimonials, AdminBeforeAndAfter, AdminSiteAssets)
- 3b. Standardize confirmation dialogs (`window.confirm()` → `ConfirmDialog`)
- 3c. Unify button/input imports across all admin pages

---

## Phase 4: Instant UI Feedback Loop (Optimistic Updates, 2–3hr)

**Theme:** Every toggle/mutation feels slow because nothing updates optimistically.

| # | Finding | File(s) | Effort | Agent Type |
|---|---------|---------|--------|------------|
| 24 | **Zero optimistic updates** — All mutations wait for server + cache invalidation | All admin mutation pages (AdminGallery, AdminLeads, AdminPortfolio, AdminMilestones, etc.) | 3hr | 🏗️ Fullstack + 🔧 Backend |
| 19 | CRM Leads search debounce has no loading indicator + search query not synced to URL | `AdminLeads.tsx` | 30min | 🏗️ Fullstack + 🎨 UI/UX |

**Total effort:** ~3.5hr

**Agent handoff note:** Optimistic updates require React Query's `onMutate`/`onError` pattern. Start with the highest-user-facing mutations: lead stage changes (AdminLeads) and featured toggles (AdminPortfolio).

---

## Phase 5: Long-Tail Bug Fixes (Major/Minor, 2–3hr)

**Theme:** Individually small but collectively impactful.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 15 | Category filter URL parameter persistence (Portfolio/Services) | `ProjectArchive.tsx`, `ServicesPage.tsx` | 30min | 🏗️ Fullstack |
| 18 | Admin Layout deep route breadcrumbs/TopBar missing | `AdminLayout.tsx` | 45min | 🏗️ Fullstack |
| 10 | BlueprintPage.css monolithic — 1000+ lines redefining brand colors | `BlueprintPage.css` | 3hr | 🎨 UI/UX + 🏗️ Fullstack |
| — | Gallery toast feedback on save (later confirmed working, but verify consistency) | `GalleryPage.tsx` | 10min | 🎨 UI/UX |

**Total effort:** ~4hr

**Agent handoff note:** BlueprintPage.css is the largest effort here. The CSS file defines its own `--accent: #D1AF6E` duplicating `--site-gold`. Migrate to Tailwind utility classes.

---

## Phase 6: Developer Infrastructure & Quality Gates (DevOps, 2–3hr)

**Theme:** Without these, code quality will keep degrading. Do this after urgent UX fixes.

| # | Finding | File(s) | Effort | Agent Type |
| --- | --------- | --------- | -------- | ------------ |
| 26 | **No pre-commit hooks** — No husky, no lint-staged, no CI | Root config | 1hr | 🛠️ DevOps |
| 26b | **TypeScript strictness** — `strictNullChecks: false`, `noImplicitAny: false` at app level | `apps/web/tsconfig.json` | 1hr | 🏗️ Fullstack + 🛠️ DevOps |
| 26c | **ESLint critical rules off** — `no-unused-vars: off`, no a11y plugin, no import ordering | `eslint.config.js` | 1hr | 🏗️ Fullstack + 🛠️ DevOps |

**Total effort:** ~3hr

**Agent handoff note:** Do NOT enable `strictNullChecks` until Phase 3 is done (manual `useState+useEffect` pages will fail type checks). Order: husky → ESLint rules (as warnings first) → type strictness.

---

## Orchestration Summary

| Phase | Focus | Total Effort | Agent Type | Dependency |
| --- | --- | --- | --- | --- |
| 0 | Quick confidence restorers | ~1hr | Any | None |
| 1 | Trust & credibility (metrics, social, colors) | ~3.5hr | 🏗️ Fullstack + 🎨 UI/UX | None |
| 2 | Keyboard & screen reader (focus traps, skipnav) | ~2.5hr | 🏗️ Fullstack | None |
| 3 | Admin CRUD unification + data fetching | ~5-6hr | 🏗️ Fullstack + 🔧 Backend | Phase 2 (can parallelize) |
| 4 | Instant UI feedback (optimistic updates) | ~3.5hr | 🏗️ Fullstack + 🔧 Backend | Phase 3 (needs React Query base) |
| 5 | Long-tail bug fixes | ~4hr | 🎨 UI/UX + 🏗️ Fullstack | None |
| 6 | Developer infrastructure (pre-commit, strict types) | ~3hr | 🛠️ DevOps + 🏗️ Fullstack | Phase 3 (strict types break non-React Query code) |

**Total estimated effort:** ~22-24hr across all 6 phases

### Can Parallelize

- Phase 0 + Phase 1 + Phase 2 + Phase 5 (independent, different files)
- Phase 3 + Phase 6 can start after Phase 2 (same agent type may conflict)

### Must Be Sequential

- Phase 4 depends on Phase 3 (optimistic updates need React Query base)
- Phase 6b (strictNullChecks) depends on Phase 3 (manual fetch pages would break)

---

## Slash Commands Available (from `10_improvement_roadmap.md`)

Each roadmap item is already mapped to a slash command ready for execution:

| Command | Phase | Effort | Agent |
| --------- | ------- | -------- | ------- |
| `/align_metrics` | 1 | 1.5hr | Fullstack |
| `/fix_services_hero` | 0 | 10min | UI/UX |
| `/align_estimator_accents` | 0 | 15min | UI/UX |
| `/add_social_rails` | 1 | 15min | Fullstack |
| `/add_gallery_toasts` | 5 | 10min | UI/UX |
| `/fix_contrast` | 5 | 30min | UI/UX |
| `/unify_loaders` | 3 | 1hr | Fullstack |
| `/css_variables` | 1 | 2hr | Fullstack + UI/UX |
| `/fix_auth_handshake` | 5 | 1hr | Backend |
| `/optimize_animations` | 5 | 2hr | UI/UX |
| `/fix_focus_traps` | 2 | 2hr | Fullstack |
| `/add_reduced_motion` | 0 | 15min | UI/UX |
| `/fix_gantt_week` | 0 | 15min | Fullstack |
| `/fix_phantom_sentry` | 0 | 10min | Fullstack |
| `/standardize_toasts` | 3 | 30min | Fullstack |
| `/unify_confirm_dialogs` | 3 | 1hr | Fullstack |
| `/migrate_to_react_query` | 3 | 3hr | Fullstack + Backend |
| `/add_optimistic_updates` | 4 | 3hr | Fullstack + Backend |
| `/enable_type_strictness` | 6 | 2hr | DevOps + Fullstack |
| `/add_precommit_hooks` | 6 | 1hr | DevOps |
| `/purge_blueprint_css` | 5 | 3hr | UI/UX + Fullstack |
| `/fix_url_filter_sync` | 5 | 30min | Fullstack |
| `/add_breadcrumbs` | 5 | 45min | Fullstack |
