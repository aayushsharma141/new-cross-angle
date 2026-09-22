# Repository Structure Convention
> Last updated: 2026-06-25 | Maintained by: core team

This document is the **authoritative reference** for where files belong in this repository.
Before adding a file or creating a new directory, check here first.

---

## Root Directory Law

The root contains **only**:
- Tooling configuration (`package.json`, `tsconfig*.json`, `vite.config.ts`, `tailwind.config.ts`, `playwright.config.ts`, `postcss.config.js`, etc.)
- Lock files (`package-lock.json`, `deno.lock`)
- Core markdown docs (`README.md`, `GEMINI.md`, `CLAUDE.md`, `CROSSANGLE.md`, `SECURITY.md`)
- Hidden tool directories (`.git`, `.github`, `.vscode`, `.env*`, `.husky`, etc.)

**Never add**: scripts, images, SQL dumps, notes, logs, or spec files to the root.

---

## Directory Responsibilities

### `apps/`
All application source code. Currently contains `apps/web/` (the Next.js frontend).
- New apps or micro-frontends go here as sibling directories.

### `packages/`
Shared internal packages consumed by `apps/`. Pure logic only — no UI, no DB calls.

### `supabase/`
Database layer. Managed entirely by the Supabase CLI.
- `supabase/migrations/` — All SQL migrations. Timestamped, never edited after merge.
- `supabase/functions/` — Edge Functions.
- **Never** put raw SQL dumps here.

### `docs/`
All documentation. The single source of truth for anything written, not code.

| Subdirectory | What goes here |
|---|---|
| `docs/architecture/` | System-level diagrams and maps: `api-map.md`, `database-map.md`, `routes.md`, `dependency-graph.md` |
| `docs/decisions/` | Plans and architectural decisions (ADR-style). Dated files preferred. |
| `docs/features/` | Per-feature documentation. Each feature gets its own subdirectory. |
| `docs/features/<name>/context/` | Active session state for a feature: PRDs, prompts, task lists, progress. |
| `docs/design/` | Visual design history, color palettes, spacing tokens, typography decisions. |
| `docs/dev/` | Developer setup guides, environment docs, onboarding notes. |
| `docs/guides/` | User-facing or operational guides (deployment, CRM usage, etc.). |
| `docs/internal/` | AI memory files, browser logs, deploy configs, agent state. |
| `docs/internal/notes/` | Informal dev notes and scratchpad text files. |
| `docs/reports/` | Audit reports, Lighthouse results, performance snapshots. Numbered sequentially. |
| `docs/testing/` | Test plans, accessibility audits, QA checklists. |

**Rule:** If a `.md` file describes *how the system works*, it belongs in `docs/architecture/`.
If it describes *a decision made*, it belongs in `docs/decisions/`. If it describes *a feature*, it belongs in `docs/features/<feature-name>/`.

### `data/`
Non-production data files used for reference, seeding, or one-off analysis.

| Subdirectory | What goes here |
|---|---|
| `data/source/` | Raw exports from production (DB dumps, media manifests, admin exports). **Read-only reference.** |
| `data/generated/` | Files output by scripts or agents (edit logs, JSONL traces, error snapshots). |
| `data/migrations/` | Ad-hoc SQL used outside the official Supabase migration pipeline. |

**Rule:** Never commit sensitive credentials or personal data in `data/`.

### `scripts/`
Executable scripts that are not part of the app build.

| Subdirectory | What goes here |
|---|---|
| `scripts/build/` | Scripts that run as part of CI or the build pipeline (doc registry, seed scripts). |
| `scripts/dev/` | Developer utility scripts (import fixers, local patchers). Not run in CI. |
| `scripts/migration/` | One-time data migration scripts. Name with a date prefix: `2026-06-25-migrate-images.ts`. |
| `scripts/legacy/` | Completed or abandoned scripts kept for reference only. Do not execute. |

**Rule:** When a `scripts/migration/` script has been run in production, move it to `scripts/legacy/` and leave a comment at the top with the date it was applied.

### `e2e/`
End-to-end tests powered by Playwright. All `.spec.ts` files go here.

### `archive/`
Historical artifacts with no active use. Files here are preserved for forensic reference only.
- Do not link to files in `archive/` from active code.
- Do not add new files unless they are being retired from active directories.

### `notes/` → Use `docs/internal/notes/` instead
The root-level `notes/` directory has been removed. All informal notes live in `docs/internal/notes/`.

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Migration scripts | `YYYYMMDD_description.sql` | `20260625_add_decision_events.sql` |
| Audit reports | Numbered sequentially | `33_remediation_phases.md` |
| Decision docs | `YYYY-MM-DD-topic.md` | `2026-06-25-imagekit-migration.md` |
| Feature context dirs | `context/` inside feature dir | `docs/features/cms-driven-content/context/` |

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-25 | Removed `_archive/` → `archive/` | Leading underscores are a hidden-file convention; archive is navigable reference |
| 2026-06-25 | Split `data/` into source/generated/migrations | Prevents raw dumps and generated artifacts from being confused |
| 2026-06-25 | Merged `docs/feature-context/` into `docs/features/<name>/context/` | Single feature tree instead of parallel shadow tree |
| 2026-06-25 | Renamed `docs/plans/` → `docs/decisions/` | Plans are a subset of decisions; ADR terminology is more precise |
| 2026-06-25 | Moved `docs/architecture.md` et al. → `docs/architecture/` | Architecture docs deserve their own namespace, not root of docs |
| 2026-06-25 | Moved `notes/` → `docs/internal/notes/` | All written artifacts live under `docs/` |
| 2026-06-25 | Split `scripts/` into build/dev/migration/legacy | Prevents accidental execution of retired scripts in CI |
