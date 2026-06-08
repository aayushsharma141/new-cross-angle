# Architecture

**Analysis Date:** 2026-06-08

## Pattern Overview

**Overall:** Monorepo SPA (Single Page Application) with a decoupled Supabase backend (consisting of PostgreSQL Database + RLS Security Policies + Serverless Edge Functions).

**Key Characteristics:**
- **Monorepo structure:** Separates application code (`apps/web`) from shared schemas/types (`packages/types`) and database definitions (`supabase`).
- **Repository-Service Pattern:** Client application divides operations into explicit UI components, Service interfaces (business logic), and Repositories (data persistence layer).
- **Client-Side Security (RLS):** Leverages Supabase Row Level Security (RLS) to enforce data access permissions based on user auth states/roles directly at the database layer.

## Layers

**UI Layer (Client Pages & Components):**
- Purpose: Render user interfaces, coordinate layouts, and manage visual animations.
- Contains: React components, lazy-loaded page route components (`apps/web/src/pages/`, `apps/web/src/components/`).
- Depends on: Client service layer (`apps/web/src/services/`) and hooks (`apps/web/src/hooks/`) for data retrieval and submission.
- Used by: Route mapping boundary (`apps/web/src/routes/`).

**Service Layer (Business Logic):**
- Purpose: Intercepts user actions from components, calculates scores, controls validation rules, and formats payloads.
- Contains: `LeadService.ts` (computes lead scores/health metrics), `AuditService.ts`, `GalleryService.ts`.
- Depends on: Repository abstraction layers (`apps/web/src/repositories/`) to retrieve data.
- Used by: Custom hooks and React controllers.

**Repository Layer (Data Persistence):**
- Purpose: Direct data communications with backend repositories (Supabase instances).
- Contains: `SupabaseLeadRepo.ts`, `SupabaseProjectRepo.ts`, `SupabaseBlogRepo.ts`, and base interfaces (`apps/web/src/repositories/interfaces/`).
- Depends on: `@supabase/supabase-js` database connections.
- Used by: Service layer files.

**Edge Integration Layer (Supabase Functions):**
- Purpose: Offloads sensitive, compute-heavy tasks or cron jobs from the client (e.g. AI caption generations, Telegram notifications, sheet syncing).
- Contains: TypeScript Deno functions (`supabase/functions/`).
- Depends on: Vault environment secrets and external APIs.
- Used by: Database triggers (webhook handlers) or direct fetch clients.

## Data Flow

**Lead Creation & Scoring Flow:**
1. A client submits a contact form/estimator quiz inside the UI (`apps/web/src/addons/calculators/pages/PriceEstimator.tsx`).
2. The UI calls the `LeadService` via a custom hook.
3. `LeadService` computes local scoring (timeline, budget, categories) via helper files.
4. `LeadService` triggers `SupabaseLeadRepo.ts` to write to the Supabase database.
5. In Supabase, the insert triggers database webhooks linking to `auto-score-lead` or `process-lead` edge functions.
6. The edge function executes (scoring normalization, syncing to Google Sheets via `syncToGoogleSheets`, notifying Slack/Telegram).
7. Client states update automatically using React Query invalidations.

**State Management:**
- React Query (`@tanstack/react-query`) handles query caching, background fetching, and mutation invalidation.
- React context (`apps/web/src/context/`) manages global states (e.g. user authentication, language presets).

## Key Abstractions

**Repository (`*Repo.ts`):**
- Purpose: Isolates database details from the application.
- Examples: `SupabaseLeadRepo.ts`, `SupabaseBlogRepo.ts`.
- Pattern: Data Repository pattern.

**Service (`*Service.ts`):**
- Purpose: Decouples business calculations and API coordination from React UI components.
- Examples: `LeadService.ts`, `AuditService.ts`.
- Pattern: Singleton service modules.

## Entry Points

**Web Client Entry:**
- Location: `apps/web/src/main.tsx` / `apps/web/src/App.tsx`
- Triggers: User loads website URL in browser.
- Responsibilities: Mounts React tree, hooks core providers (routing, queries, themes), starts page-tracking.

**Database Schema Entry:**
- Location: `supabase/schema.sql` / `supabase/migrations/`
- Triggers: Supabase instance startup / migration deployments.
- Responsibilities: Declares table schemas, trigger bindings, and RLS policies.

## Error Handling

**Strategy:** Exception bubbling caught by React `ErrorBoundary` wrappers on the client. Database transaction rollbacks controlled via postgres trigger failures and standard validation scopes.

**Patterns:**
- Try/catch wraps in async React Query mutations.
- Toast notifications display error messages using standard `useToast` hooks.
- Fallback loaders shown in routers when a lazy component fails to resolve.

---

*Architecture analysis: 2026-06-08*
*Update when major patterns change*
