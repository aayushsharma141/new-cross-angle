# CROSSANGLE.md — Immutable Project Reference
# This file is the permanent truth about this codebase.
# Agents READ this. Never rewrite it unless Aayush approves.
# For things that change, use .context/state.md instead.

---

## Project
Cross Angle Interior — UHNW Luxury Interior Design Studio
GitHub: https://github.com/aayushsharma141/new-cross-angle
Docs: https://crossdocs-86hkteyq.manus.space
Public: https://cross-angle-v2.surge.sh
Admin: localhost:4173/admin (dev build)
Root: C:\Users\aayus\Desktop\main\

---

## Monorepo Structure

```
new-cross-angle/
├── apps/web/          ← Main React app (frontend + admin)
├── packages/types/    ← Shared TypeScript type definitions
├── supabase/          ← Backend config, migrations, edge functions
├── .context/          ← Agent session memory (gitignored)
├── prompt.md          ← Ralph Loop / agent boot instructions
├── PRD.md             ← Task specification (read-only for agents)
├── progress.txt       ← Task completion log (agents append only)
└── CROSSANGLE.md      ← This file
```

---

## Auth Flow

```
1. AdminAuth.tsx        → supabase.auth.signInWithPassword()
2. AuthProvider.tsx     → wraps app, manages onAuthStateChange
3. AdminLayout.tsx      → route guard, redirects unauthenticated → /admin/login
4. useAdminAuth.ts      → hook consuming auth context
5. profiles table       → linked to auth.users via DB trigger
6. roles: 'admin' | 'viewer' → stored in profiles.role
```

**Edge functions that require service_role (bypass RLS):**
- `manage-user` — suspend, delete, unsuspend
- `invite-user` — send invite emails
- `assign-first-admin` — initial setup

---

## Data Flow Pattern

```
User action
  → React component
    → useQuery / useMutation (@tanstack/react-query)
      → supabase client (from @/integrations/supabase/client)
        → Supabase PostgREST API
          → PostgreSQL with RLS
            → Response cached by React Query
              → UI updates
```

On mutation success: `queryClient.invalidateQueries({ queryKey: [...] })`

---

## Edge Functions (Deno/TypeScript)

| Function | Trigger | Purpose |
|---|---|---|
| `assign-first-admin` | Manual | Set first user as admin |
| `auto-reply-lead` | DB trigger / manual | Send email to new leads |
| `generate-caption` | Manual | AI caption for images |
| `process-lead` | DB trigger | Score and categorize leads |
| `notify-hot-lead` | DB trigger | Alert on high-value leads |
| `submit-discovery-lead` | Form submit | Process discovery questionnaire |
| `manage-user` | Admin action | Suspend/delete/unsuspend users |
| `invite-user` | Admin action | Send team invite emails |
| `rate_limiter` | Middleware | Protect public endpoints |

Call pattern:
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ...payload }
});
```

---

## Complete Database Schema Reference

```sql
-- ═══════════════════════════════════════════
-- PORTFOLIO CLUSTER
-- ═══════════════════════════════════════════

CREATE TABLE project_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  display_order int DEFAULT 0
);

CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  category_id   uuid REFERENCES project_categories(id),
  client_name   text,
  location      text,
  budget        text,
  status        text CHECK (status IN ('draft','published')) DEFAULT 'draft',
  views         int DEFAULT 0,
  image_url     text,
  created_at    timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- SERVICES CLUSTER
-- ═══════════════════════════════════════════

CREATE TABLE services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,       -- ← 'name' NOT 'title'
  slug          text UNIQUE NOT NULL,
  description   text,
  icon_name     text,                -- ← maps to lucide-react icon name
  image_url     text,
  display_order int DEFAULT 0
);

CREATE TABLE service_steps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid REFERENCES services(id) ON DELETE CASCADE,
  step_number   int NOT NULL,
  title         text NOT NULL,
  description   text
);

CREATE TABLE service_faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid REFERENCES services(id) ON DELETE CASCADE,
  question      text NOT NULL,
  answer        text NOT NULL
);

-- ═══════════════════════════════════════════
-- LEAD INTERACTIONS CLUSTER
-- ═══════════════════════════════════════════

CREATE TABLE leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,       -- ← 'name' NOT 'full_name'
  email         text,
  phone         text,
  message       text,
  status        text CHECK (status IN ('new','contacted','won','lost')) DEFAULT 'new',
  lead_source   text,               -- ← 'lead_source' NOT 'service' or 'source'
  city          text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE estimate_leads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  email               text,
  phone               text,
  project_type        text,
  property_size       text,
  quality_tier        text,
  timeline            text,
  estimate_total_min  numeric,     -- ← SERVER SIDE ONLY — never trust client value
  estimate_total_max  numeric,     -- ← SERVER SIDE ONLY — never trust client value
  status              text DEFAULT 'new',
  created_at          timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- CONTENT CLUSTER
-- ═══════════════════════════════════════════

CREATE TABLE blogs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  excerpt       text,
  content       text,              -- ← HTML or markdown
  image_url     text,
  read_time     text,
  status        text CHECK (status IN ('draft','published')) DEFAULT 'draft',
  created_at    timestamptz DEFAULT now(),
  published_at  timestamptz
);

CREATE TABLE testimonials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,     -- ← 'name' NOT 'author' or 'client_name'
  role          text,
  content       text NOT NULL,
  rating        numeric CHECK (rating >= 1 AND rating <= 5),
  active        boolean DEFAULT true  -- ← 'active' NOT 'is_active' or 'is_featured'
);

-- ═══════════════════════════════════════════
-- USER CLUSTER
-- ═══════════════════════════════════════════

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text,              -- ← 'full_name' (this table only — leads uses 'name')
  avatar_url    text,
  role          text CHECK (role IN ('admin','viewer')) DEFAULT 'viewer'
);
-- Note: profiles are auto-created via DB trigger on auth.users insert
```

---

## RLS Policy Summary

```
Public (anon) role:
  ✅ INSERT → leads, estimate_leads (rate limited via edge function)
  ❌ SELECT → leads, estimate_leads (no scraping)
  ❌ UPDATE / DELETE → everything

Authenticated (admin/viewer):
  ✅ Full CRUD → all tables
  ✅ Storage → media bucket

Admin only (via edge function + service_role):
  ✅ manage-user, invite-user, assign-first-admin
```

---

## Key Custom Hooks

| Hook | File | Purpose |
|---|---|---|
| `useAdminAuth` | hooks/useAdminAuth.ts | Auth state, session, role |
| `useLanguage` | hooks/useLanguage.tsx | i18n language switching |
| `useCountUp` | hooks/useCountUp.ts | Animated number counters for KPIs |
| `useApi` | hooks/useApi.ts | Generic API call wrapper |

---

## Field Name Trap Reference (Bugs That Already Happened)

| Wrong | Correct | Table |
|---|---|---|
| `full_name` | `name` | `leads` |
| `service` | `lead_source` | `leads` |
| `source` | `lead_source` | `leads` |
| `title` | `name` | `services` |
| `author` | `name` | `testimonials` |
| `client_name` | `name` | `testimonials` |
| `is_active` | `active` | `testimonials` |
| `is_featured` | `active` | `testimonials` |
| `tags` | `category_id` | `projects` |
| `username` | `full_name` | `profiles` |

---

## Migration Rules

```
1. Never edit past migration files
2. New file naming: supabase/migrations/YYYYMMDDHHMMSS_description.sql
3. Always run: supabase db push (or supabase db reset --no-confirmation for dev)
4. Always confirm with Aayush before applying migrations to production
5. Include rollback comment in migration header
```

---

## Environment Variables Required

```bash
# apps/web/.env.local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Never commit to git. Never hardcode in source.
# supabase service_role key: server-side only (edge functions / local CLI)
```
