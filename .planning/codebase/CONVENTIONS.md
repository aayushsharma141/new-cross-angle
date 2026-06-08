# Coding Conventions

**Analysis Date:** 2026-06-08

## Naming Patterns

**Files:**
- `PascalCase.tsx` for React layout, page, and UI components (e.g. `ServicesHero.tsx`, `WhatsAppButton.tsx`).
- `camelCase.ts` for hooks, utility libraries, services, and repositories (e.g. `useToast.ts`, `imagekit.ts`, `LeadService.ts`, `SupabaseLeadRepo.ts`).
- `kebab-case` for folder directories (e.g. `apps/web/src/addons/calculators/`, `design-history/`).
- `YYYYMMDDHHMMSS_name.sql` for Postgres database migrations.

**Functions:**
- `camelCase` for variables and function declarations.
- Event handlers are named `handle[Event]` or `on[Event]` (e.g. `handleSubmit`, `handleConfirmRevoke`).

**Types & Interfaces:**
- `PascalCase` for Interfaces and Types (e.g. `LeadRecord`, `ServicePayload`).
- Interfaces do not use the `I` prefix (e.g. `LeadInterface` or `LeadRepository`, not `ILeadRepository`).

## Code Style

**Indentation & Formatting:**
- 2 spaces indentation.
- Single or double quotes matching existing patterns (double quotes generally preferred in tsx tags).
- Semicolons required.

**Linting:**
- ESLint v9.x used to lint the TypeScript code (`npm run lint` or `eslint .` in `apps/web/`).
- Customized rules:
  - `@typescript-eslint/no-unused-vars` is turned off.
  - `react-refresh/only-export-components` is turned off.
- Ignores built bundles (`dist/`), compiler indices (`*.tsbuildinfo`), and auto-generated Supabase schema types (`src/integrations/supabase/types.ts`).

## Import Organization

**Order:**
1. Third-party library packages (e.g. `react`, `react-router-dom`, `framer-motion`).
2. Internal absolute directory aliases (`@/*` pointing to `apps/web/src/*`).
3. Local relative dependencies (`./components`, `../hooks`).
4. Type imports (e.g. `import type { Lead } from "@/types"`).

## Error Handling

**Strategy:** Exception bubbling caught by React `ErrorBoundary` wrappers on the client. Database transaction rollbacks controlled via postgres trigger failures and standard validation scopes.

**Patterns:**
- Try/catch wraps in async React Query mutations.
- Toast notifications display error messages using standard `useToast` hooks.
- Fallback loaders shown in routers when a lazy component fails to resolve.

## Comments

**When to Comment:**
- Explain the "why", not the "what". Describe business logic, calculations, or integration workarounds rather than self-explanatory code blocks.
- Highlight visual variations referencing the design history checks in comments near components.

---

*Convention analysis: 2026-06-08*
*Update when patterns change*
