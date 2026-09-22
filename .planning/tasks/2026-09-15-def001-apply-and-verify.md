# Task: Apply and verify DEF-001 (Services CMS `upsert_service` fix)

**Owner:** Antigravity IDE (execution) · **Prepared by:** QA Lead review, 2026-09-15
**Status:** ✅ DONE — Verified 2026-09-21. Probe PASS, CRUD all green, audit docs updated.
**Reference:** `.planning/audits/2026-09-15-admin-qa-lead-review.md` (§4 DEF-001, QA-10)

---

## 1. What is wrong (verified live)

| Fact | Evidence |
| --- | --- |
| `services.icon_url` no longer exists; the column is `deprecated_icon_url` | `GET /rest/v1/services?select=icon_url` → `42703 column services.icon_url does not exist` |
| `public.upsert_service` (migration `20260514000000`) still writes `icon_url` on INSERT and UPDATE | `supabase/migrations/20260514000000_upsert_service_rpc.sql:37,49` |
| Therefore every Services CMS create/edit fails | Antigravity browser run + this review |
| Service imagery already lives in `asset_usages` (`domain='Services'`, `entity_type='service'`, `role='icon'`, 8 rows) — the public site reads it from there via `lib/api/_shared/dam-stitcher.ts` | anon read of `asset_usages` |

**Do NOT** "fix" this by pointing the RPC at `deprecated_icon_url`. ADR 0002 forbids raw URL columns on entities; the
`deprecated_*` column is a migration leftover, not a target.

## 2. What has already been done (in the working tree — do not redo)

| File | Change |
| --- | --- |
| `supabase/migrations/20260915000000_def001_upsert_service_drop_icon_url.sql` | `CREATE OR REPLACE` with identical param names/types; `p_icon_url TEXT DEFAULT NULL` (accepted, ignored); no `icon_url` in INSERT/UPDATE; `SET search_path = ''` (S3 pattern); `REVOKE EXECUTE … FROM PUBLIC, anon; GRANT … TO authenticated, service_role` (S2 pattern) |
| `apps/web/src/pages/admin/AdminServices.tsx` | stops sending `p_icon_url`; binds the picked asset with `AssetUsageService.replaceUsage({ entityType: "service", role: "icon", domain: "Services" })` **after** the RPC returns the id (awaited, so the list refetch sees it); list thumbnails come from `AssetUsageService.getUsageUrlsForEntities("service", ids, "icon")` instead of the dead column |
| `apps/web/src/services/AssetUsageService.ts` | `replaceUsage` now forwards `domain` (was re-inferred as "Portfolio"); new `getUsageUrlsForEntities()` batch reader |
| `scripts/checks/probe-upsert-service.mjs` | read-only probe: PASS when the new function is live |
| `scripts/checks/verify-def001-services-crud.mjs` | UI create → edit → delete verification using the saved Playwright session |

Static gates already green: `tsc` exit 0, ESLint 0 errors, `arch:check`, `arch:no-console`, `arch:supabase-auth`.

## 3. Current blocker — the migration is not live

Three dashboard attempts were reported as applied, but every probe returns the **old** function:

```
new signature (no p_icon_url) -> 404 PGRST202  (function with these params not found)
old signature (with p_icon_url) -> 400 P0001 "Access denied. Must be CMS editor."
```

The second line is decisive: anon reached the *in-function* guard, which is only possible if anon still has EXECUTE —
the new migration revokes it. So nothing about the new definition is in the database.

Likely causes, in order: (a) text was selected in the SQL Editor, so only the selection ran; (b) a statement errored and
the whole script rolled back (the editor runs the file as one transaction); (c) the dashboard was on a different
project. Target project is **`iuuivmwqodefdrrrewol`** (`VITE_SUPABASE_URL` in `apps/web/.env.local`).

## 4. Commands to run, in order

### 4.1 Diagnose what is live (Supabase Dashboard → SQL Editor, read-only)
```sql
select pg_get_function_arguments(oid) as args,
       has_function_privilege('anon', oid, 'EXECUTE') as anon_can_execute,
       current_database() as db
from pg_proc where proname = 'upsert_service';
```
Expected **before** apply: `args` has `p_icon_url text` with no `DEFAULT`; `anon_can_execute = true`.
Expected **after** apply: `p_icon_url text DEFAULT NULL`, `anon_can_execute = false`.

### 4.2 Apply (pick ONE)
**A. SQL Editor (preferred):** open `supabase/migrations/20260915000000_def001_upsert_service_drop_icon_url.sql`,
copy the **entire** file, make sure nothing is selected in the editor, Run. Result must read
"Success. No rows returned". If red, capture the error text verbatim.

**B. CLI:** requires `npx supabase login` (human, needs browser). Then:
```bash
npx supabase db push --dry-run
```
Proceed **only** if the dry-run lists exactly one file, `20260915000000_def001_upsert_service_drop_icon_url.sql`.
The working tree contains modified/untracked migrations that must not be pushed as a side effect. Then:
```bash
npx supabase db push
```

If PostgREST still reports PGRST202 after a confirmed apply, reload its schema cache in the SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### 4.3 Probe (repo root, read-only, no secrets)
```bash
node scripts/checks/probe-upsert-service.mjs
```
Must print `PASS — DEF-001 migration is live`. Anything else → stop, do not proceed to 4.4.

### 4.4 End-to-end verification (dev server on :8080 must be running; writes ONE `[QA-2026-09-15]` row and deletes it)
```bash
node scripts/checks/verify-def001-services-crud.mjs
```
Expected output lines:
- `CREATE rpc: 200 "<uuid>" | row: id=… tag=QA`
- `EDIT rpc: 200 … | row tag now: QA-EDITED`
- `DELETE -> row: gone`
- `QA leftovers in services: []`
- `service thumbnails rendered from asset_usages:` ≥ 1

Also confirm on the public site that `/services` still renders each service image (they now come only from
`asset_usages`; nothing reads `deprecated_icon_url`).

### 4.5 Regression
```bash
npx playwright test e2e/admin-interactions.spec.ts --project=chromium
```
(Set `PLAYWRIGHT_BASE_URL=http://localhost:8080` — `.env.local` points this at a Vercel preview by default.)
Expected: 23 passed. Services tests at spec lines ~202–207 cover the list + status badge.

### 4.6 Commit (only these paths; leave `AdminHub.tsx`, `create_test_admin.mjs`, `scratch_patch.cjs` unstaged)
```bash
git add supabase/migrations/20260915000000_def001_upsert_service_drop_icon_url.sql apps/web/src/pages/admin/AdminServices.tsx apps/web/src/services/AssetUsageService.ts scripts/checks/probe-upsert-service.mjs scripts/checks/verify-def001-services-crud.mjs
```
```bash
git commit -m "fix(cms): stop upsert_service writing services.icon_url; bind service icon via asset_usages (DEF-001)"
```
Pre-commit runs root `typecheck`, `arch:supabase-auth`, and lint-staged — all pass on this tree today.

### 4.7 Close out
- In `.planning/audits/2026-09-15-admin-qa-lead-review.md`: DEF-001 → **Verified** with the 4.4 output as evidence;
  QA-10 → **Closed** for `upsert_service` (anon EXECUTE revoked, probe output as evidence).
- Append a dated line to `.planning/STATE.md`.

## 5. Guardrails
- No service-role key in any file. Probes use the anon key from `apps/web/.env.local` only.
- Never write to `services` outside the `[QA-2026-09-15]`-prefixed row the script creates and removes.
- Do not run `supabase db reset`, `supabase start`, or push migrations other than `20260915000000` (ADR 0003: the
  migration directory is not a reproducible build).
- If 4.3 fails after a confirmed 4.1 "after" state, the problem is PostgREST cache, not SQL — use the `NOTIFY` above.
