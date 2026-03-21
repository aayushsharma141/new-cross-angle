# PRD.md — Cross Angle Interior: Active Task Specification
# READ-ONLY for agents. Aayush updates this file with new tasks.
# Cross-reference with progress.txt to find your next task.
# Reference docs: https://crossdocs-86hkteyq.manus.space

---

## Project Overview

Cross Angle Interior is a UHNW luxury interior design studio platform.
Stack: React 18 + TypeScript + Vite + Supabase + shadcn/ui
GitHub: https://github.com/aayushsharma141/new-cross-angle
Design: Dark luxury aesthetic, gold accents, glassmorphism — see .context/design.lock

---

## How to Use This File

1. Read progress.txt to find completed tasks
2. Find the FIRST task below that is NOT in progress.txt
3. That is your active task
4. When done: append to progress.txt, update .context/state.md, append to .context/decisions.log

---

## Task Format

Each task has:
- Clear INPUT: what files/data you need
- Clear OUTPUT: what should exist when done
- VERIFY: how to confirm it worked
- DESIGN CHECK: specific design rules for this task

---

## ACTIVE TASKS

---

### Task 1: Admin Dashboard — Live KPI Cards
**Priority**: HIGH — currently broken (hardcoded values)

**Problem**: All KPI cards in AdminDashboard.tsx show static values (0, 2, 0, 0) that never update when data changes.

**Input files**:
- `apps/web/src/pages/admin/AdminDashboard.tsx`
- `apps/web/src/integrations/supabase/client.ts`

**What to build**:
Replace every hardcoded `useState(0)` KPI initializer with live `useQuery` hooks:

```typescript
// Card 1: Total Portfolio Projects (published)
supabase.from('projects').select('*', {count:'exact',head:true}).eq('status','published')

// Card 2: Total Leads (all time)
supabase.from('leads').select('*', {count:'exact',head:true})

// Card 3: Estimate Enquiries (from cost calculator)
supabase.from('estimate_leads').select('*', {count:'exact',head:true})

// Card 4: Total Portfolio Views
supabase.from('projects').select('views') → sum all views values

// Card 5: New Leads This Month
supabase.from('leads').select('*', {count:'exact',head:true})
  .gte('created_at', startOfCurrentMonth.toISOString())

// Card 6: Active Services
supabase.from('services').select('*', {count:'exact',head:true})
```

**Design check**:
- Skeleton loader must use `bg-muted animate-pulse` (dark, not white)
- Error state: show `—` not `0`
- KPI numbers: gold accent color (`text-yellow-400` or `var(--admin-accent)`)
- Cards: `bg-card border border-border` (dark elevated surface)

**Output**: All KPI cards update in real time when Supabase data changes.

**Verify**: Add a test lead in Supabase → KPI updates without page reload.

---

### Task 2: Leads CRM — Fix List View Empty Columns
**Priority**: HIGH — broken feature

**Problem**: Switching leads view from Board → List shows empty Name, Service, Date, Source columns.
Root cause: field name mismatch between Supabase query and component column accessors.

**Input files**:
- `apps/web/src/pages/admin/AdminLeads.tsx`

**Exact fix**:
```typescript
// Supabase query MUST use these exact field names:
const { data } = await supabase.from('leads').select(`
  id, name, email, phone, message,
  status, lead_source, city, created_at
`);

// Column accessor mapping — MUST match exactly:
// Column "Name"   → accessor: 'name'        (NOT full_name)
// Column "Source" → accessor: 'lead_source'  (NOT service, NOT source)
// Column "City"   → accessor: 'city'
// Column "Status" → accessor: 'status'
// Column "Date"   → accessor: 'created_at'
```

**Design check**:
- Table header: dark muted background
- Status badges: colored on dark bg (new=blue/10, won=green/10, etc.)
- Row hover: `hover:bg-muted/50`

**Verify**: Switch to List view → all 5 columns show data.

---

### Task 3: Lead Analytics Dashboard
**Priority**: MEDIUM

**What to build**: Add analytics section below KPI cards in AdminDashboard.tsx with:
- Lead source breakdown (bar chart or donut: Instagram, WhatsApp, Website, Referral etc.)
- Lead status pipeline (new → contacted → won/lost funnel)
- Leads by city (horizontal bar chart)
- Monthly lead volume (line chart, last 6 months)

**Input**:
- `apps/web/src/pages/admin/AdminDashboard.tsx`
- `apps/web/src/integrations/supabase/client.ts`
- Existing analytics components in `apps/web/src/components/admin/analytics/` (check before creating new)

**Supabase queries**:
```typescript
// Lead source breakdown
supabase.from('leads').select('lead_source').then(group and count by lead_source)

// Lead pipeline  
supabase.from('leads').select('status').then(group and count by status)

// City distribution
supabase.from('leads').select('city').then(group and count by city)

// Monthly volume (last 6 months)
// Use date_trunc or filter by month in JS
```

**Design check**:
- Charts: dark background, gold accent for primary data series
- Chart grid lines: subtle, dark (not white grid lines)
- Tooltips: dark glassmorphism style
- Use recharts (already in stack) — check existing chart components first

**Output**: Dashboard shows live, data-driven analytics section.

---

### Task 4: Services — Nested Steps & FAQs CRUD
**Priority**: MEDIUM

**What to build**: In AdminServices.tsx, the service form dialog needs to support adding/removing:
- `service_steps` (linked by service_id FK): step_number, title, description
- `service_faqs` (linked by service_id FK): question, answer

**Input files**:
- `apps/web/src/pages/admin/AdminServices.tsx`
- Check `apps/web/src/components/admin/` for any existing service form dialog

**DB tables**:
```sql
service_steps:  id, service_id (FK), step_number int, title text, description text
service_faqs:   id, service_id (FK), question text, answer text
```

**Pattern to follow**: Use React `useFieldArray` from React Hook Form for dynamic nested arrays.

**Design check**: Nested section uses dark accordion or collapsible, gold +/- buttons.

---

### Task 5: Portfolio — Category Filter
**Priority**: LOW

**What to build**: In AdminPortfolio.tsx, add category filter dropdown using `project_categories` table.

**DB**:
```sql
project_categories: id uuid, name text, display_order int
```

**Filter logic**:
```typescript
// When category selected:
supabase.from('projects').select('*, project_categories(name)')
  .eq('category_id', selectedCategoryId)
```

---

### Task 6: Estimate Leads — Detail View
**Priority**: LOW

**What to build**: In AdminEstimateLeads.tsx, add expandable row or slide-over panel showing:
- All fields from estimate_leads table
- Formatted min/max estimate range (₹ format)
- Status update dropdown
- Quick note field

**Design check**: Slide-over panel uses glassmorphism (`bg-background/95 backdrop-blur-md`).

---

## Adding New Tasks

When Aayush gives you a new task verbally, ask him:
1. What is the exact problem?
2. Which files are involved?
3. What does "done" look like?
4. Any design requirements specific to this task?

Then add the task to this PRD in the format above before starting work.

---

## Completed Tasks Archive

Tasks move here when done (copy from active section, don't delete).

*(empty — no tasks completed yet)*
