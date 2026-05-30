# 🎯 CRM & Admin Panel — Design History

Tracks all visual iterations, layout decisions, and UI/UX changes for the Admin CRM module (Lead Pipeline, Lead Cards, KPIs, Admin Layout chrome).

---

## Active Iteration: **v2.2-crm-theme-standardization**

**Date:** 2026-05-29

### What changed

- **Transparency Fixes:** Systematically converted arbitrary `hsl(var(--admin-...))` background and text inline classes into standardized tailwind semantic tokens (e.g., `bg-admin-bg`, `bg-admin-surface`) across `AdminLeads.tsx`, `LeadGridView.tsx`, and `LeadDetailSheet.tsx` to fix rendering bugs inside portal overlays like dropdowns and sheets.
- **Filter Cleanup:** Removed the duplicate 'Stage' filters from the master dropdown inside `AdminLeads.tsx`, consolidating view controls to rely solely on the Left Sidebar Tabs for stage filtering.
- **Views & UI consistency:** Finalized the implementation of a functional Card/Grid view (`LeadGridView.tsx`) to complement the standard List view.

---

## Previous Iteration: **v2.1-standardized-crm-manifest**

**Date:** 2026-05-29

### What changed

Centralized all CRM domain semantics into `apps/web/src/lib/crm/` as a single manifest layer. Every component now reads labels, colors, predicates, and sort logic from one place instead of duplicating inline maps.

| New file | Purpose |
|---|---|
| `lib/crm/index.ts` | Barrel export |
| `lib/crm/stages.ts` | Stage definitions + `badgeClass` (was missing) |
| `lib/crm/sources.ts` | Lead source labels, short codes, chip styles, alias resolution |
| `lib/crm/types.ts` | Lead type / project category labels |
| `lib/crm/temperature.ts` | Hot/Warm/Cold thresholds, dot + badge classes |
| `lib/crm/views.ts` | Saved-view predicates (Today, Hot, Needs action, Quiet, Won this month) |
| `lib/crm/sorts.ts` | Sort comparators (score, newest, oldest, name, stage) |
| `lib/crm/nav.ts` | CRM sidebar navigation manifest |
| `lib/crm/kpis.ts` | KPI card specs with compute functions |

### Components updated to consume the manifest

- `LeadCard.tsx` — uses `getCrmSource()` + `getCrmTemperature()` instead of inline maps
- `LeadListView.tsx` — uses `CRM_STAGE_LABELS`, `CRM_STAGE_BADGE_CLASSES`, `getCrmSourceLabel()`, `getCrmLeadTypeLabel()`, `applyCrmSavedView()`
- `LeadToolbar.tsx` — iterates `CRM_SOURCES`, `CRM_STAGES`, `CRM_TEMPERATURES` for dropdowns
- `LeadTable.tsx` — uses `CRM_STAGE_BADGE_CLASSES` + `CRM_TEMPERATURES`
- `AdminLeads.tsx` — uses `CRM_SAVED_VIEWS` predicates, `CRM_SORTS` comparators, `CRM_KPIS` compute, `CRM_SOURCES` for filter dropdown

### Eliminated duplication

- `SOURCE_LABELS` was defined in 4 files → now 0 (all read from `getCrmSourceLabel`)
- `TYPE_LABELS` was defined in 2 files → now 0 (all read from `getCrmLeadTypeLabel`)
- `STAGE_LABELS` was defined in 2 files → now 0 (all read from `CRM_STAGE_LABELS`)
- `STATUS_COLORS` was defined in 3 files → now 0 (all read from `CRM_STAGE_BADGE_CLASSES`)
- `SOURCE_CHIP` inline map in LeadCard → now 0 (reads from `getCrmSource`)
- Saved-view filter predicates were inline in AdminLeads → now shared via `views.ts`
- Sort comparators were inline switch-case → now `sorts.ts`
- KPI compute logic was inline JSX → now `kpis.ts`

---

## Previous Iteration: **v2-action-first-crm**

**Git commit:** `9419af68` — `feat(crm): Phase 1 action-first CRM transformation`
**Date:** 2026-05-28

### What's live now

| Component | State |
|---|---|
| **LeadCard.tsx** | Redesigned: source chip (color-coded), temperature glow border, requirement one-liner, budget/city chips, quick-action bar (Call/WA/Email/View/Move) on hover |
| **LeadPipeline.tsx** | Meaningful stage labels (New Inquiry → Won/Lost), wider columns (260–280px), softer visual styling |
| **LeadListView.tsx** | Consistent stage labels via `STAGE_LABELS` map, complete `STATUS_COLORS` for all 9 stages |
| **admin-theme.css** | Warmer background (`225 20% 6%` ≈ `#0E1118`), increased text contrast, card elevation shadows, slightly larger typography |
| **AdminLeads.tsx** | Operations-focused KPI row: Leads Today, Hot Leads, Unassigned, Stale, Conversion %, Pipeline Value |
| **CrmModule.tsx** | Renamed to "Lead Operations Center", tab label "Pipeline Board" |
| **TopBar.tsx** | Logout button recolored: red → neutral grey (F-01 fix) |
| **AdminLayout.tsx** | Footer telemetry hidden for non-admin roles; "modules" → "sections"; removed Audit Logs link from footer (F-20 fix) |

### Design properties
- **Background:** near-black navy-gray `hsl(225, 20%, 6%)` — NOT pure black
- **Primary accent:** gold/amber `hsl(var(--admin-primary))`
- **Logout button:** neutral grey (was red — red is now reserved for truly urgent items only)
- **Card actions:** visible on hover via quick-action bar
- **Stage labels:** Human-readable (New Inquiry, Contact Attempted, Interested, Req. Gathering, Proposal Sent, Negotiation, Final Review, Won, Lost)
- **KPI row:** 6 operations-focused metrics replacing abstract totals
- **Footer:** Simplified — technical telemetry (storage, module count) admin-only

---

## Previous Iteration: **v1-original-crm**

**State before changes (pre-2026-05-28)**

| Component | State |
|---|---|
| **LeadCard** | Name, email, phone, city, budget tier badge, "Stale — 43d no activity" warning, relative time. No source badge, no assignee, no next-action |
| **LeadPipeline** | 7 raw columns (NEW, CONTACTED, QUALIFIED, CONSULTATION, PROPOSAL SENT, NEGOTIATION, FINAL REVIEW). Narrow columns (~150px) |
| **admin-theme.css** | Pure black background, lower text contrast, smaller typography |
| **AdminLeads KPIs** | 4 abstract cards: Total Leads, Hot Leads, Stale, Pipeline Value |
| **CrmModule** | Title "CRM & Lead Pipeline" |
| **TopBar** | Logout button in red |
| **AdminLayout footer** | Full telemetry visible to all users: "System Connected · 67.2 MB of 20GB used · 8 modules active" |

### Known issues at v1
- All 14 leads showed as stale
- "Hot Leads" = 0 with no explanation
- "Pipeline Value" = em-dash (no data)
- 6 of 7 Kanban columns empty ("No leads" repeated)
- No source badge on cards → trainee doesn't know the channel
- No next-action anywhere → "what do I do?" paralysis
- Red overload (logout + stale + danger all red)
- Footer showed technical telemetry to trainees

---

## Planned: **v3-blueprint-full-redesign** (Week 1–6 Rollout)

Based on: [CRM_UX_Audit_and_Redesign_Blueprint.md](file:///C:/Users/aayus/Downloads/CRM_UX_Audit_and_Redesign_Blueprint.md)

### Architectural decisions locked
1. **Stages:** Collapse 9 → 5 in DB + UI (New → In Conversation → Meeting Planned → Quote Sent → Closing → Won/Lost)
2. **Navigation:** Promote CRM sections to top-level sidebar items (Today, Inbox, Leads, Tasks, Reports, Settings)
3. **Default landing:** `/admin/crm` → Today page (not Pipeline)

### Remaining Week 1 fixes (Completed)
| Status | ID | Description |
|---|---|---|
| [x] | **F-01** | Recolor logout button (`admin-danger` → neutral) |
| [x] | **F-05** | Inline help tooltips for ambiguous KPIs |
| [x] | **F-06** | Replace Pipeline Value `—` with nudge ("No budgets set") |
| [x] | **F-13** | Auto-capitalize names on capture |
| [x] | **F-14** | Lowercase & validate emails |
| [x] | **F-16** | Reformat budget display (`₹ Essential...` → `Budget: ₹15L`) |
| [x] | **F-20** | Hide footer telemetry from non-admins |
| [x] | **F-22** | Red overuse audit (Neutralized Logout, Unassigned, No-action) |

### Future weeks
- **Week 2:** Vocabulary swap site-wide, empty states, InlineHelp component
- **Week 3:** 5-stage pipeline (DB migration), stale banner, saved view chips, always-visible action buttons
- **Week 4:** "Today" page as new default landing
- **Week 5:** 3-step Add Lead wizard with source-aware fields
- **Week 6:** Inbox page, Reports with PDF export, onboarding tour

---

## Revert Instructions

- **Revert to v1-original-crm:** `git revert 9419af68` (undoes Phase 1 commit)
- **Revert only LeadCard:** restore `LeadCard.tsx` from the commit before `9419af68`
- **Revert only theme:** restore `admin-theme.css` from the commit before `9419af68`
