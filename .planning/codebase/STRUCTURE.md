# Codebase Structure

**Analysis Date:** 2026-06-08

## Directory Layout

```
cross-angle-monorepo/
├── apps/
│   └── web/                    # Client React application
│       ├── scripts/            # Build & optimization scripts
│       └── src/                # Core application source
├── packages/
│   └── types/                  # Shared TypeScript type definitions
├── supabase/
│   ├── functions/              # Deno Edge Functions
│   ├── migrations/             # Database migration files
│   └── schema.sql              # Compiled PostgreSQL database schema
├── design-history/             # Visual design history logs and screenshots
├── .planning/                  # GSD specs, phases, roadmaps, and states
├── package.json                # Monorepo workspaces manifest
└── tailwind.config.ts          # Core styling configurations
```

## Directory Purposes

**apps/web/src/addons/**
- Purpose: Specialized application modules and features.
- Contains:
  - `calculators/` - Interactive budget and Price Estimator pages.
  - `discovery/` - Aesthetic Style Quiz wizard and results page.

**apps/web/src/components/**
- Purpose: Reusable user interface components.
- Subdirectories:
  - `ui/` - Shadcn primitives (buttons, modals, dialogs, dropdowns).
  - `layout/` - Shell structures (Navbar, Footer, FixedSocialBar).
  - `about/` / `services/` - Page-specific micro-components.

**apps/web/src/repositories/**
- Purpose: Database client connectors mapping SQL tables.
- Key files: `SupabaseLeadRepo.ts`, `SupabaseProjectRepo.ts`, `SupabaseBlogRepo.ts`.

**apps/web/src/services/**
- Purpose: Computations, calculations, and business logic adapters.
- Key files: `LeadService.ts` (computes temperatures, budgets, scores), `AuditService.ts`.

**supabase/functions/**
- Purpose: Backend serverless functions written in Deno TypeScript.
- Key files: `auto-score-lead/`, `aesthetic-ai/`, `weekly-report-email/`.

## Key File Locations

**Entry Points:**
- `apps/web/src/main.tsx` - Initial React client entry.
- `apps/web/src/App.tsx` - App controller hosting providers and layout gates.
- `supabase/schema.sql` - Full PostgreSQL schema file.

**Configuration:**
- `package.json` - Workspace settings and node package constraints.
- `tailwind.config.ts` - Tailwind preset overrides.
- `tsconfig.json` - TypeScript path mappings and compiler targets.

**Testing:**
- `playwright.config.ts` - End-to-end test parameters.
- `apps/web/src/test/` - Shared unit tests.

## Naming Conventions

**Files:**
- `PascalCase.tsx` - React component files.
- `camelCase.ts` - Services, repositories, hooks, and helpers.
- `YYYYMMDDHHMMSS_name.sql` - Timestamped SQL database migrations.

**Directories:**
- `kebab-case` - General folders and page folders.

## Where to Add New Code

**New UI Component:**
- Place in `apps/web/src/components/` under the appropriate domain subdirectory (or create one).

**New Database Stored Procedure / Table:**
- Create a new migration file in `supabase/migrations/` using `supabase migration new`.

**New Backend logic / Webhook / Outgoing service integration:**
- Add a new Deno folder under `supabase/functions/`.

---

*Structure analysis: 2026-06-08*
*Update when directory structure changes*
