# Task: Apply and verify F-07 (auth rate limiting) — F-08 is already live

**Owner:** whoever has Supabase Dashboard access · **Prepared by:** QA Lead review, 2026-09-21
**Status:** F-08 DONE (code-only, verified live). F-07 code-complete, BLOCKED on DB apply.
**Reference:** `.planning/audits/2026-09-15-admin-qa-lead-review.md` (§4 QA-03/QA-04)

---

## 1. What is wrong (verified live, 2026-09-21)

| Fact | Evidence |
| --- | --- |
| `/api/auth/login` had no rate limiting | 12 rapid bad logins → `401×12`, never `429` (original audit) |
| `/api/auth/logout` had no Origin check | cross-origin `POST` (`Origin: https://evil.example`) → `204` (original audit) |

## 2. What has already been done and verified

| Item | Status | Evidence |
| --- | --- | --- |
| **F-08 same-origin check** — `apps/web/api/_lib/security.ts` (`isSameOriginRequest`), wired into `login.ts`, `logout.ts`, `refresh.ts`, `recover.ts` | **VERIFIED — CLOSED** | `node scripts/checks/probe-auth-hardening.mjs` on `:8080`: cross-origin `POST /api/auth/logout` → `403`. No DB step — live the moment the code deploys. |
| **F-07 rate limiter code** — `apps/web/api/_lib/security.ts` (`checkAuthRateLimit`, `getClientIp`), wired into `login.ts` only | Code-complete, **NOT yet effective** | Same probe run: 8 rapid bad logins on `:8080` still `401×8`, no `429` — because the migration below has not been applied. The helper fails OPEN by design when the RPC errors, so login stays available in the meantime; it just isn't throttling yet. |
| **F-07 migration** — `supabase/migrations/20260921000000_f07_auth_rate_limit.sql` (table `auth_rate_limits` + `check_and_record_auth_attempt()` RPC) | **NOT APPLIED** to `iuuivmwqodefdrrrewol` | — |
| Static gates | Green | `tsc`, ESLint, `arch:check`, `arch:no-console`, `arch:supabase-auth` all pass |
| Unit tests | Green | `npm run test --workspace=web -- src/test/auth` → 6 files, 48 tests pass, incl. new `origin-check.test.ts` and `rate-limit.test.ts` |

## 3. Apply the migration

**Lesson from DEF-001 (2026-09-15):** two "applied" reports for that migration turned out false — the SQL
Editor run either selected only part of the file or ran against the wrong tab — and were only caught because
the probe script was re-run independently rather than trusted on report. Do the same discipline here: run the
probe yourself after applying, don't just report success.

1. **Diagnose first** (Supabase Dashboard → SQL Editor, target project `iuuivmwqodefdrrrewol`, read-only):
   ```sql
   select to_regclass('public.auth_rate_limits') as table_exists,
          (select count(*) from pg_proc where proname = 'check_and_record_auth_attempt') as fn_count;
   ```
   Expected before apply: `table_exists = NULL`, `fn_count = 0`.

2. **Apply**: open `supabase/migrations/20260921000000_f07_auth_rate_limit.sql`, copy the **entire** file with
   nothing pre-selected in the editor, paste into a **new** SQL Editor query, Run. Result must read "Success. No
   rows returned."

3. **Re-run the diagnostic query** — expect `table_exists = auth_rate_limits`, `fn_count = 1`.

## 4. Probe (repo root, read-only against the DB — uses only the anon key)

```bash
node scripts/checks/probe-auth-hardening.mjs
```

Point it at whatever is running the new code (`PLAYWRIGHT_BASE_URL=... node scripts/checks/probe-auth-hardening.mjs`
if not `localhost:8080`). Expected after a real apply:

```
8 rapid bad logins, same email: 401,401,401,401,401,429,429,429
PASS — rate limit engaged (429 observed)
...
PASS — cross-origin request rejected (403)
```

The exact position of the first `429` may vary slightly (threshold is 5 attempts per email per 15 minutes) but a
`429` **must** appear. Anything else (still all `401`) → the migration did not take effect; do not mark closed.

## 5. Regression

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8080 npx playwright test e2e/admin-full-flow.spec.ts e2e/auth-lifecycle-smoke.spec.ts --project=chromium
```
A fresh login/logout per spec run stays well under the 5-per-15-minutes email threshold and the 20-per-15-minutes
IP threshold, so no legitimate test run should trip the limiter. If a full suite run trips it (e.g. because the
suite retries login many times), that's real signal the threshold needs revisiting — don't just raise it blindly.

## 6. Close out
- Update `.planning/audits/2026-09-15-admin-qa-lead-review.md`: F-07 → Verified/Closed with the probe output as
  evidence (F-08 already updated as part of this same pass — no DB step was needed for it).
- Append a dated `STATE.md` entry.

## Guardrails
- No service-role key needed anywhere in this fix — `login.ts` and the probe both use the anon key.
- The rate-limit table only ever holds `identifier` + `created_at`; no PII beyond the email address the caller
  already submitted, and it self-prunes on every call.
- Do not widen the RPC's grants beyond `anon, authenticated, service_role` — it does nothing but increment/read
  its own counters, but there's no reason to grant more.
