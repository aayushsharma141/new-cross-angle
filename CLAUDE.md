# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted. The root package delegates to the `web` workspace.

| Task | Command |
| --- | --- |
| Dev server (port **8080**) | `npm run dev` |
| Production build | `npm run build` |
| Preview built output | `npm run preview` |
| Lint | `npm run lint` |
| Typecheck (root + web) | `npm run typecheck` |
| Unit tests (Vitest) | `npm run test --workspace=web` |
| Single unit test | `npm run test --workspace=web -- src/test/architecture.test.ts` |
| Watch / coverage | `npm run test:watch --workspace=web` / `npm run test:coverage --workspace=web` |
| E2E (Playwright) | `npx playwright test` |
| Single E2E spec | `npx playwright test e2e/estimator-smoke.spec.ts` |

### Architecture & quality gates

Run from `apps/web` (or append `--workspace=web`):

- `npm run arch:check` — dependency-cruiser layer enforcement (`.dependency-cruiser.cjs`)
- `npm run arch:fitness` — Vitest architecture fitness tests (`src/test/architecture.test.ts`)
- `npm run arch:engine` / `arch:drift` — architecture engine + drift report (`scripts/checks/architecture-engine.ts`)
- `npm run arch:no-console` — fails on `console.log` in production source (test files and `src/test/` are exempt)
- `npm run arch:supabase-auth` — guards the cookie-based auth model (see Architecture below)
- `npm run arch:knip` / `arch:ts-prune` — dead-code detection
- `npm run report:engineering` — regenerates the engineering report
- `npm run test:chaos`, `test:load:tier-a`, `test:load:tier-b:*` (k6 via Docker), `test:lighthouse`

CI (`.github/workflows/ci.yml`) runs lint, typecheck, npm audit, `no-console-log`, `arch:supabase-auth`, and `arch:check`. Of those, `npm audit` and `arch:check` are `continue-on-error` (they report but do not block, pending baseline cleanup); everything else fails the build. Husky `pre-commit` runs `npm run typecheck`, `arch:supabase-auth`, then `lint-staged` (ESLint on staged `.ts`/`.tsx`).

### Build pipeline

`npm run build` in `apps/web` chains: `prebuild` (`scripts/optimize-images.js`) → clean `dist` → `vite build` → `scripts/generate-sitemap.js` → `postbuild` (`scripts/copy-indexes.js`, `scripts/checks/bundle-budget.js`). Bundle budgets are hard limits: main ≤ 350 KB, route chunk ≤ 450 KB, vendor engine chunk ≤ 900 KB. Manual chunking lives in `apps/web/vite.config.ts`.

## Repository layout

npm workspaces monorepo (`apps/*`, `packages/*`):

- `apps/web` — the Vite + React 18 + TypeScript SPA (public site + admin dashboard). Almost all work happens here.
- `apps/web/api/auth/*.ts` — Vercel serverless auth handlers (login / logout / me / refresh).
- `apps/web/middleware.ts` — Vercel Edge middleware.
- `packages/types` (`@repo/types`), `packages/ui` (`@repo/ui`), `packages/utils` (`@repo/utils`) — shared workspace packages consumed via those aliases.
- `supabase/` — `config.toml`, ~84 SQL migrations, and ~25 Deno edge functions (AI, lead scoring, notifications, ImageKit, PostHog).
- `e2e/` + `playwright.config.ts` (repo root) — Playwright E2E; `apps/web/src/test/` — Vitest suites (architecture, chaos, contracts, telemetry, load harness).
- `.planning/`, `.decisions/`, `.rules/` — GSD workflow state, ADRs, and project rules. `.rules/git.md` asks that `.planning/STATE.md` be updated before finishing a turn.

## Architecture

### Auth is cookie-based, not supabase-js session-based

This is the least obvious part of the system and easy to break.

- The browser Supabase client (`src/integrations/supabase/client.ts`) is created against **`${origin}/api/supabase`**, not the Supabase URL, with `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`.
- In production, `middleware.ts` intercepts `/api/supabase/*` and injects the HTTP-only `access_token` cookie as the `Authorization` header. In dev, the same behaviour is emulated by the `/api/supabase` proxy in `vite.config.ts`.
- Login/logout/refresh go through `apps/web/api/auth/*.ts`, which a custom `vercelApiPlugin` in `vite.config.ts` executes locally via `ssrLoadModule` so auth works under `vite dev`.
- Never reintroduce client-side session persistence or point the client directly at `VITE_SUPABASE_URL`. Enforced by `npm run arch:supabase-auth` (`scripts/checks/supabase-auth-invariant.js`), which runs on `pre-commit` and in CI: it asserts the three `false` auth options, that `createClient` receives `PROXY_URL`, and that no other module under `src/` constructs its own client.

`middleware.ts` has a second job: detecting crawler User-Agents and injecting Open Graph / Twitter meta into the SPA shell (data from `src/og/og-defaults.ts` plus Supabase REST for dynamic `/blog/:slug`, `/portfolio/:slug`). Real users pass through untouched.

### Layering (enforced by tooling, not convention)

`pages → (components | hooks | lib) → services → repositories → providers → integrations`, no reverse imports. Enforced in three places that must stay in sync:

1. `apps/web/.dependency-cruiser.cjs` — forbids pages/components importing storage providers, `MediaRepository`, or `integrations/supabase/client`; forbids services/repositories importing React; forbids circular deps; restricts `components/auth/_internals` to the auth folder and `services/media/{MediaRepository,UploadOrchestrator,providers}` to the media service layer.
2. `apps/web/eslint.config.js` — `@typescript-eslint/no-restricted-imports` blocks the same media provider/repository paths.
3. `apps/web/src/test/architecture.test.ts` — fitness tests asserting the same contracts.

The media stack is the reference implementation of this layering: `MediaService` (public) → `UploadOrchestrator` / `PipelineCoordinator` / `StorageGateway` → `MediaRepository` → `providers/{ImageKit,Supabase}Provider`. UI touches `MediaService` and hooks only.

### Media: Supabase backbone + ImageKit visual media (ADR 0002)

Supabase is the source of truth for structured data and CMS state; ImageKit is the source of truth for managed visual media; the admin CMS is the only control plane for either; Vercel `public/` holds immutable static assets and is never managed CMS media. Supabase owns the information *about* an asset, ImageKit owns the asset itself.

Entities reference assets through `asset_usages` (`domain` / `entity_type` / `entity_id` / `role` / `display_order`) — never a raw CDN URL on an entity row, and never a per-entity `*_media_id` FK (that shape was considered and rejected; see the ADR). The browser never calls the ImageKit API directly — writes go through the `imagekit-upload` edge function, which holds the private key as a Supabase secret. Read [.decisions/0002-supabase-imagekit-media-architecture.md](.decisions/0002-supabase-imagekit-media-architecture.md) before changing anything in the media stack; it also records the known deviations (Supabase Storage is still the ImageKit endpoint origin, `media_files` still coexists with `assets`, `deprecated_*` columns still present).

Auth follows the same shape: `AuthProvider` exposes `useAuth()` as the public contract; `_internals/role-cache.ts` and `_internals/useRoleFetcher.ts` are private to it.

### Routing & providers

- `src/App.tsx` splits on `location.pathname.startsWith("/admin")`: admin renders `adminRoutes` inside `ErrorBoundary` + `AdminDeviceGate`; public renders `publicRoutes` inside `SmoothScroll` with a route-specific `PageSkeleton` variant (see `getSkeletonVariant`). Public routes also honour `settings.maintenance_mode_active`.
- Route tables live in `src/routes/adminRoutes.tsx` and `src/routes/publicRoutes.tsx`; nearly every page is `React.lazy`.
- Provider order is fixed in `src/providers/CoreProviders.tsx`: Helmet → QueryClient → Theme → CookieConsent → Tooltip → Analytics → Auth → System → Admin → Language. Analytics is gated on cookie consent; PostHog goes through the `/ingest` proxy.
- React Query defaults (5 min `staleTime`, 30 min `gcTime`, no refetch on focus/reconnect) are set once in `CoreProviders`. Cache keys are centralised in `src/lib/queryKeys.ts` — add new keys there rather than inlining arrays.

### RBAC

Four roles, defined in `src/lib/auth/rbac.ts`: `super_admin > admin > editor > viewer`, each with a default landing route and an assignable-roles matrix. `AuthGuard` gates authentication; `RoleGuard` gates roles per route in `adminRoutes.tsx` (`ADMIN_ONLY`, `CMS_ROLES`, `CRM_ROLES`, `SUPER_ONLY`). The admin surface is organised into module pages: CMS, CRM, Discovery, Estimator, Blog, System, User Access.

### Design tokens — three layers, strictly separated

`apps/web/src/tokens/` (see `TOKENS.md`, `TOKEN_DECISIONS.md`):

1. **Foundation** (`foundation/colors.css`) — the only place raw HSL values may appear (`--f-stone-*`, `--f-charcoal-*`, `--f-bronze-*`, …).
2. **Semantic** (`semantic/semantic.css`) — the only layer components may consume.
3. **Environments / lighting states** (`environments/environments.css`) — remap semantic tokens per environment (`gallery`, `workspace`); they never define colours.

Components must not reference foundation tokens directly, and lighting states must not be mapped straight into CSS variables. Tokens carry stability levels (CORE / STABLE / EXPERIMENTAL). Treat the architecture as frozen: before adding a token, answer whether an existing semantic token can be reused, whether this is a true design concept or just a page-specific need, and whether it would still make sense after a future redesign.

### Feature modules

`src/addons/` holds self-contained feature verticals (`calculators` — the price estimator, `discovery` — the style quiz, `home-brief`, `core`, `_shared`) with their own components, pages, and engines (e.g. `calculators/components/data/engines/*.ts`, which have colocated unit tests).

## Conventions

- `@/*` aliases `apps/web/src` (mirrored in `vite.config.ts`, `vitest.config.ts`, and tsconfig). `@repo/types` resolves to `packages/types/src`.
- Env vars use the `VITE_` or `NEXT_PUBLIC_` prefix (`envPrefix` in `vite.config.ts`); secrets live in `.env.local`, never committed. `vite.config.ts` also hand-parses `.env` / `.env.local` into `process.env` so the local serverless handlers can read them.
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- No `console.log` in production source — `arch:no-console` runs in CI.
- ESLint relaxes several rules under `src/pages/lab/**` (a prototyping area); don't rely on that laxity elsewhere.
- `src/integrations/supabase/types.ts` is generated and ESLint-ignored — regenerate it rather than hand-editing.

## Knowledge graph

A graphify knowledge graph is checked in at `graphify-out/`. For architecture or codebase-wide questions, read `graphify-out/GRAPH_REPORT.md` (god nodes, community structure) before crawling files; if `graphify-out/wiki/index.md` exists, navigate that instead. Run `graphify update .` after structural code changes to keep it current (AST-only, no API cost).

<!-- imported-from: gemini:project:instructions -->

## Visual design history

Visual iterations are tracked as git tags, not as a checked-in document — `DESIGN_HISTORY.md` and a `design-history/` directory are referenced by older instructions but do not exist in this repo. Before UI, styling, or layout work:

1. Run `git tag --list 'checkpoint/*'` to see which visual checkpoints already exist for the area being touched (e.g. `checkpoint/v1-dark-meteors`, `checkpoint/home-page-ux-luxury-funnel`, `checkpoint/v-pre-skeleton-overhaul`).
2. Report the current active iteration and its design properties before editing.
3. Ask whether to build on the current layout, restore features from an earlier checkpoint, or do a full overhaul.
4. Never overwrite previous design work without first creating a new `checkpoint/...` tag.
