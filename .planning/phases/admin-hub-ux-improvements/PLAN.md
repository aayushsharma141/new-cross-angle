# Admin Hub UX Improvements — Phase Plan

**Phase Goal:** Reduce navigation friction, surface discovery pathways for new admins, and optimize for mobile without sacrificing data density for power users.

**Success Criteria:**
- New admins can locate key modules within 60 seconds without external help
- Mobile nav drawer supports full module hierarchy
- Hub displays "My Action Items" variant by default (vs. all-metrics)
- Module taxonomy unified (one source of truth for media sections)
- Type hierarchy reviewed for readability (no 10px text in body copy)

---

## Part 1: Navigation Discovery (Weeks 1–2)

### 1.1 Add Breadcrumb Trail to Module Pages
**Goal:** Context awareness — admins know where they are in the hierarchy

- **File:** `apps/web/src/components/admin/layout/ModuleLayout.tsx` (existing)
- **Change:** Render `Module > Section > Subsection` breadcrumbs above module title
- **Test:** Navigate CMS → Portfolio → Edit Project; breadcrumb shows `CMS > Portfolio > [Project Name]`
- **Effort:** 3–4 hours (component + integration with `useLocation()`)

### 1.2 Create Module Sitemap Card on Hub
**Goal:** Visual discovery of all modules and their purposes

- **File:** `apps/web/src/pages/admin/AdminHub.tsx` (extend existing)
- **Change:** Add a collapsible "Module Directory" card showing:
  ```
  CMS (8 sections)
    ├─ Main Content (Projects, Blog, Services, ...)
    ├─ Visual Media (Hero, Gallery, Before/After, ...)
    └─ Resources (Site Assets)
  
  CRM (4 sections)
    ├─ Leads
    ├─ Analytics (admin only)
    └─ Settings (admin only)
  
  [etc. for each module]
  ```
- **Design:** Accordion or expandable grid card; link each section to its page
- **Effort:** 6–8 hours (component + data structure)

### 1.3 Unify CMS Media Taxonomy
**Goal:** Eliminate confusion between "Visual Media Hub", "Images & Videos", "Gallery", "Before & After"

- **Audit:** `apps/web/src/pages/admin/modules/CmsModule.tsx` — tabs grouped by `group: "Visual Media"`
- **Rename:**
  - `Visual Media Hub` → `Visual Media Library` (parent concept)
  - `Images & Videos` → remains as first tab
  - `Gallery`, `Before & After`, `Hero` → nested under a "By Use Case" subgroup
- **Test:** Tab navigation in CMS module; verify all media paths resolve correctly
- **Effort:** 2–3 hours (rename + tab reorganization)

---

## Part 2: Mobile & Responsive (Weeks 2–3)

### 2.1 Confirm Mobile Navigation Drawer
**Goal:** Full module access on <768px viewports

- **File:** `apps/web/src/components/admin/TopBar.tsx`
- **Audit:** Check if hamburger + drawer exists; if not, build it
- **Design:** Drawer contains full module tree (same structure as Module Sitemap from 1.2)
- **Test:** Mobile emulation (375px, 768px breakpoints); verify all 40+ pages are clickable
- **Effort:** 4–6 hours (drawer component + route registration)

### 2.2 Responsive Bento Grid
**Goal:** Graceful degradation from 6-column (lg) → 2-column (md) → 1-column (mobile)

- **File:** `apps/web/src/pages/admin/AdminHub.tsx` (grid breakpoints)
- **Current:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-6`
- **Audit:** Verify CRM card (4 cols on lg) doesn't break aspect ratio on mobile
- **Change:** Add `sm:grid-cols-1` for <640px; test on iPhone 12 (390px)
- **Effort:** 2 hours (responsive testing + breakpoint tuning)

### 2.3 Readable Type Hierarchy
**Goal:** Eliminate 10px text; ensure no sustained reading at <11px

- **Audit:** Find all `text-[10px]` and `text-xs` instances in:
  - Hub card labels
  - Activity stream timestamps
  - Alert descriptions
- **Fix:** Increase to `text-[11px]` (0.6875rem) or `text-xs` (0.75rem) where safe
- **Trade-off:** Some label density lost, but eyestrain risk reduced
- **Effort:** 1–2 hours (Grep + targeted Edit)

---

## Part 3: Information Architecture (Weeks 3–4)

### 3.1 Context-Aware Hub Variant: "My Action Items"
**Goal:** Reduce cognitive load for new sessions by surfacing actionable items first

- **File:** `apps/web/src/pages/admin/AdminHub.tsx` (new variant logic)
- **Change:** Add toggle or default view:
  - **My Action Items** (new default): Show only:
    - New leads waiting response (from "Key Alerts" section)
    - Unsigned quotes
    - Pending approvals
  - **Full Dashboard** (power user mode): All 10 cards + activity stream
- **Persists:** User preference in `localStorage` or Supabase `admin_preferences` table
- **Test:** Role-based visibility (viewers see leads only, editors see CMS + leads)
- **Effort:** 6–8 hours (state management + card filtering logic)

### 3.2 Replace Mock Activity Stream with Live Feed
**Goal:** Activity stream shows real system events, not hardcoded copy

- **File:** `apps/web/src/pages/admin/AdminHub.tsx` (Activity section)
- **Change:** Query Supabase `audit_logs` or new `admin_activity_feed` table:
  - User logins
  - Lead status changes
  - Content edits (portfolio, blog)
  - System backups
  - Limit to last 10 events with real timestamps
- **Fallback:** Show "No activity yet" if logs table is empty
- **Effort:** 4–5 hours (query + real-time subscription if needed)

### 3.3 Deduplicate Pipeline Value Display
**Goal:** One source of truth for business metrics

- **Audit:** `AdminHub.tsx` shows pipeline value on both CRM and Estimator cards
- **Decision:** CRM is authoritative (leads > estimates)
- **Change:** Estimator card shows "Total Quote Value" instead, or removes stat
- **Verify:** CRM card pipeline recalculates correctly from `leads` table
- **Effort:** 1 hour (metric cleanup)

---

## Part 4: Micro-interactions & Refinement (Weeks 4–5)

### 4.1 Improve Maintenance Mode UX
**Goal:** Faster toggle without drilling to System Settings

- **File:** `apps/web/src/components/admin/TopBar.tsx` or `AdminLayout.tsx`
- **Change:** Maintenance mode banner remains, but add inline "Quick Deactivate" button
  - Current: Only in TopBar handler
  - New: Button visible on banner + on System Settings page
- **Effort:** 1 hour

### 4.2 Role Timeout Resilience
**Goal:** Reduce 10-second grace period friction

- **File:** `apps/web/src/pages/admin/AdminLayout.tsx` (line 106)
- **Current:** 10-second timeout before "Role Verification Failed" screen
- **Option 1:** Pre-fetch role async on login; reduce grace to 3s
- **Option 2:** Retry automatically once if timeout, then show UI
- **Test:** Simulate slow role endpoint; verify UX is smooth
- **Effort:** 2–3 hours (edge case testing required)

### 4.3 Loading State Refinement
**Goal:** Clear skeleton or partial render while hub metrics load

- **File:** `apps/web/src/pages/admin/AdminHub.tsx` + `apps/web/src/hooks/useHubStats.ts`
- **Current:** Full page loader shown until all metrics ready
- **Change:** Render hub layout immediately with skeleton loaders in each card
- **Benefit:** Perceived performance improves; user sees UI structure faster
- **Effort:** 3–4 hours (skeleton components + loading state management)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Mobile drawer navigation path explosion (40+ routes) | Organize drawer in collapsible groups matching module structure; lazy-load route list |
| Real-time activity feed performance (audit_logs table scan) | Index on `created_at` DESC; paginate to last 10; consider materialized view if heavy queries |
| Type size changes break card layouts | Audit card height/padding before increasing font; adjust grid gap if needed |
| Hub personalization (My Action Items toggle) adds complexity | Start with role-based defaults (editor sees CMS, viewer sees CRM); manual toggle is phase 2 |
| Breadcrumb breaks module names with special chars | Sanitize route params; use a Breadcrumb component that handles encoding |

---

## Task Breakdown

**Week 1–2 (Navigation & Discovery):**
- [ ] Task 1.1: Add breadcrumb component
- [ ] Task 1.2: Module Sitemap card (accordion)
- [ ] Task 1.3: Unify CMS media taxonomy (rename tabs)

**Week 2–3 (Mobile & Responsive):**
- [ ] Task 2.1: Audit & build mobile drawer
- [ ] Task 2.2: Responsive bento grid breakpoints
- [ ] Task 2.3: Type hierarchy audit & fixes

**Week 3–4 (IA & Content):**
- [ ] Task 3.1: Implement "My Action Items" variant
- [ ] Task 3.2: Replace mock activity stream
- [ ] Task 3.3: Deduplicate pipeline value

**Week 4–5 (Polish & Testing):**
- [ ] Task 4.1: Maintenance mode quick toggle
- [ ] Task 4.2: Role timeout resilience
- [ ] Task 4.3: Loading state skeleton loaders
- [ ] E2E testing across all modules
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Verification Checklist

- [ ] New admin can locate all 8 modules from hub within 60 seconds (user testing)
- [ ] Mobile drawer responsive at 375px, 768px, 1024px (visual regression)
- [ ] No text <11px in body copy (visual audit)
- [ ] Activity stream shows live events, not mock (functional test)
- [ ] Breadcrumbs render correctly across all module pages (unit test)
- [ ] Role timeout grace period ≤ 5 seconds (performance test)
- [ ] Hub metrics load with skeleton in <500ms perceived time (Lighthouse)
- [ ] All 40+ admin routes accessible from mobile drawer (navigation test)

---

## Next Steps

1. Prioritize by impact: **Task 1.2** (Module Sitemap) + **Task 2.1** (Mobile Drawer) unlock discoverability fast
2. Parallel: **Task 3.1** (My Action Items) reduces hub clutter for new users
3. Polish phase: **Task 4.x** (micro-interactions) after core flows validated
4. Plan E2E test suite for admin workflows (lead intake → quote → signed contract)
