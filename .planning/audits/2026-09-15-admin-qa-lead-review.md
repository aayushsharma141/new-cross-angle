# Admin Panel QA — Independent QA Lead Review (2026-09-15)

**Scope:** Reconciliation of the Antigravity IDE "Autonomous Admin Panel QA Orchestration" run against
independently executed evidence. Evidence labels per ADR 0004 / brief §15. Nothing in this document is
marked VERIFIED on the basis of code reading alone.

**Environment executed against:** `fix-auth-refresh-e2e` working tree, Vite dev server `http://localhost:8080`
(PID 2328), live Supabase project `iuuivmwqodefdrrrewol` (there is no local DB — ADR 0003), Playwright 1.59.1,
session = Playwright global-setup login of `PLAYWRIGHT_ADMIN_EMAIL` (super_admin).

---

## 1. Executive verdict

> **NOT READY FOR ACCEPTANCE**

Antigravity's headline ("blocked by a single high-severity defect, DEF-001") is **not supported by its own
evidence**: 24 of its 33 capability rows are NOT_VERIFIED, its interim defects D-001..D-008 disappeared from the
final register without resolution, and two OPEN security findings (F-07, F-08) were relabelled as different
things and marked PASSING. Independent execution found **four additional production-blocking defects** it
marked PASSING or never reached.

Release-gate items unresolved (brief §20):

| Gate | Status | Evidence |
| --- | --- | --- |
| Broken core CRUD | **FAIL** — Services create/edit (DEF-001); Estimator pricing save (QA-03) | live PostgREST 42703 / PGRST205 |
| Broken critical API | **FAIL** — `posthog-query` 500 on Dashboard, Quiz Analytics, Estimate Leads | live 500 bodies |
| P0/P1 security | **OPEN** — F-07 no rate limit, F-08 no Origin check | 12×401 no 429; cross-origin logout 204 |
| Unverified critical workflow | editor/viewer RBAC, F-09 API-level role denial, 10/12 CMS write cycles | blocked on credentials / write authorisation |
| Production deployment | production branch still pre-cookie-auth (PL-010, D-001/D-002) | STATE.md, unchanged |
| Fixture hygiene | second `super_admin` (`testadmin@example.com`) + plaintext service-role key at repo root | `create_test_admin.mjs` |

**Can this admin panel be trusted for production use? → NO** (blocking conditions in §7).

---

## 2. Reconciliation of Antigravity's claims

| Antigravity claim | Independent result | Label |
| --- | --- | --- |
| Dev server confirmed at `localhost:5173` | Nothing listens on 5173; server is 8080 (`playwright.config.ts:34`, CLAUDE.md) | **[FAILED]** claim |
| RBAC RPC matrix 8/8 → "RBAC verified" | Script has 8 **anonymous** checks only (STATE.md "17/17" is stale). Re-run: 8/8. Says nothing about editor/viewer | [VERIFIED] anon only |
| F-07 "RoleGuard boundary" PASSING | F-07 is *rate limiting* (STATE.md). `api/auth/*.ts` has none; 12 rapid bad logins → `401×12`, never 429 | **[FAILED] OPEN** |
| F-08 "Hub conditional rendering" PASSING | F-08 is *CSRF/Origin*. No Origin/Referer logic; `POST /api/auth/logout` with `Origin: https://evil.example` → 204 | **[FAILED] OPEN** (mitigated by SameSite=Lax) |
| DEF-001 root cause `icon_url` vs `deprecated_icon_url` | Confirmed live: `services.icon_url` → 42703; `deprecated_icon_url` present; `upsert_service` (20260514) still writes `icon_url`; client sends `p_icon_url` (`AdminServices.tsx:255`) | **[VERIFIED]** |
| DEF-001 fix: point RPC at `deprecated_icon_url` | **Rejected.** Reintroduces a URL-on-entity column ADR 0002 explicitly forbids. Correct fix: drop `p_icon_url` from the RPC/client; icon via `asset_usages` role `icon` | — |
| D-008 Hub shows all cards; patched `AdminHub.tsx` | Diff is 36 clean insertions (role flags around each card). `tsc` exit 0, ESLint exit 0. Editor screenshot shows CMS card only | [PARTIALLY VERIFIED] (third-party screenshot, not re-executed) |
| CAP-21 Estimate Leads PASSING "data fetch verified" | Page renders, but `posthog-query` → **500 ×2** underneath; funnel data absent | **[FAILED]** |
| CAP-22 Estimator Config PASSING | Page renders, but `estimate_rates` → **404 PGRST205** (table does not exist); pricing save path dead | **[FAILED]** |
| CAP-15/17 CRM leads/analytics PASSING | Both render, 0 console errors, 0 HTTP ≥400 | [VERIFIED] render only — no write cycle executed |
| CAP-03 Portfolio "create + delete flawless" | No trace remains (newest `projects` row is March); consistent with create→delete but unverifiable | [NOT VERIFIED] |
| CAP-07 Blog create PASSING | Screenshot shows `QA Test Post` draft created 15 Sep by `testadmin` — **leftover in production** | [VERIFIED] + cleanup required |
| Cookie attributes | Saved session: `access_token` httpOnly/Lax/path=/ (60 min), `refresh_token` httpOnly/Lax/path=/api (30 d); localStorage holds only `admin_session_expires` | [VERIFIED] (F-02). Note: STATE.md calls F-05 a "15-min cookie" — live is 60 min |
| D-004 `me.ts` omits role | Confirmed; severity P3 not P2 | [VERIFIED] |
| D-005 `login.ts` swallows role error | Confirmed at `login.ts:41-56` (`.single()` on 0 rows also lands here); impact unreproduced; P2 not P1 | [INFERRED] |
| D-007 viewer reaches lead workspace with write hook | Route inherits `CRM_ROLES` (`adminRoutes.tsx:92-94`); `useCreateCommitmentRevision` mounted. Whether viewer can *write* = F-09, needs viewer token | [NOT VERIFIED] |

---

## 3. Independently executed coverage

| Item | Result |
| --- | --- |
| `admin-audit-verification.spec.ts` | **8/8 pass** (chromium) |
| `admin-interactions.spec.ts` | **23/23 pass** |
| `admin-full-flow.spec.ts` | **0 effective coverage** — first test asserts `<h1>` "Admin Sign In" (page says "Admin Login") and the suite is serial → 23 skipped. Excluding it: 5 pass, then `/admin/cms/blogs` fails — **10 of its 22 routes no longer exist** |
| Authenticated route sweep (32 real routes) | **32/32 render** for super_admin, no error boundary. Screenshots: session scratchpad `sweep/*.png`, `sweep/results.json` |
| Unknown admin paths (`/admin/cms/blogs`, `/admin/does-not-exist`, `/admin/cms/media`) | **Blank page** — no `path="*"` inside admin tree |
| Anonymous probes | `/api/auth/me` 401; proxied `user_roles` 200 `[]` (RLS); `upsert_service` P0001 "Must be CMS editor" (guard works; anon still has EXECUTE — see QA-10) |

---

## 4. Defect register (independent, ranked)

| ID | Sev | Layer | Defect | Evidence | Fix direction |
| --- | --- | --- | --- | --- | --- |
| **DEF-001** | P1 | DATABASE/RPC | Services create/edit dead since `20260622000002` renamed `icon_url` | 42703 live; `AdminServices.tsx:255` | **[VERIFIED]** New migration: `upsert_service` without `p_icon_url`; client stops sending it; icon via `asset_usages` |
| **QA-01** | P1 | INTEGRATION | `posthog-query` → 500 "Failed to query PostHog" for `traffic-stats`, `funnel-*`, `retention-summary` | Dashboard, Quiz Analytics, Estimate Leads | Check `POSTHOG_*` secrets on the function; add UI error state (pages currently render silently empty) |
| **QA-02** | P1 | DATABASE | `estimate_rates` table absent in production | PGRST205 live; `EstimatorRegistry.ts:20,36`, `useEstimateEngine.ts:31` | Either create/restore the table by migration or repoint both consumers; **public estimator silently runs on `DEFAULT_PRICING_CONFIG`** |
| **QA-03** | P1 | SECURITY | F-07 no rate limiting on `/api/auth/login` | 12×401, no 429 | Vercel-side limiter (KV/Upstash) or rely on GoTrue limits + document |
| **QA-04** | P1 | SECURITY | F-08 no Origin/Referer check on auth mutations | cross-origin logout 204 | Reject state-changing `/api/auth/*` unless `Origin` ∈ allow-list |
| **QA-05** | P1 | SECURITY/CONFIG | Second `super_admin` created in production (`testadmin@example.com`) + `testeditor@example.com`; passwords **and service-role key in plaintext** at `create_test_admin.mjs` (untracked). Regresses the 2026-09-14 hygiene sweep | file on disk; walkthrough | Delete both accounts + `user_roles` rows after QA; delete the file; rewrite fixture creation to read key from env |
| **QA-06** | P2 | UI/CLIENT | Dashboard Recent Activity feed 400 — `system_logs` embed `profiles(full_name)` has no FK | PGRST200 live; `RecentActivityFeed.tsx:35` | Drop the embed or add FK/view |
| **QA-07** | P2 | UI/ROUTING | Unknown `/admin/*` renders blank | sweep | Add `<Route path="*">` → admin 404 |
| **QA-08** | P2 | DATA/ADR-0002 | `team_members` avatars hotlink `crossangleinterior.com/wp-content/…` → `ERR_BLOCKED_BY_ORB`; broken images in Team, Hero | dig | Migrate to ImageKit via `asset_usages` |
| **QA-09** | P2 | TEST_COVERAGE | `admin-full-flow.spec.ts` stale (heading + 10 dead routes); `PLAYWRIGHT_BASE_URL` in `.env.local` points at a Vercel preview, so default runs never hit branch code | E2E run | Rewrite routes, drop `body visible` assertions, add editor/viewer projects |
| **QA-10** | P3 | SECURITY (hardening) | `upsert_service` executable by `anon`; only in-function `is_cms_editor()` stops it | P0001 | **[CLOSED]** `REVOKE EXECUTE … FROM PUBLIC, anon` |
| **QA-11** | P3 | A11Y | `<h1>` on every admin page is the top-bar greeting; page titles are not headings; `<button>` nested in `<button>` on Media Library | sweep console | Heading hierarchy pass |
| **QA-12** | P3 | CONFIG | OTLP exporter targets `localhost:4318` with no collector → `ERR_CONNECTION_REFUSED` on every page; slows `networkidle` | dig | Gate exporter on env |
| D-004 | P3 | API | `/api/auth/me` omits role → extra round-trip | code | Return role |
| D-005 | P2 | API | `login.ts` swallows role lookup failure → `role:null` → `?error=role_unavailable` | code | Surface as 403 with reason |
| D-006 | P2 | AUTH | Logout skips GoTrue revocation when access token already expired (known residual) | STATE.md §250 | Use refresh token for revocation |
| D-001/002 | P0 | DEPLOYMENT | Production runs pre-cookie-auth build (PL-010) | STATE.md | Separate workstream — do not fold into QA |

---

## 5. Not verified / blocked (and why)

| Item | Blocker |
| --- | --- |
| Editor & viewer route matrix in browser; deep-link bypass; `canAssignRole` matrix | No credentials for those roles supplied via env; refused to lift passwords from Antigravity's script |
| F-09 direct RPC/edge calls as editor/viewer (incl. D-007 write attempt) | Same |
| CMS write cycles for Testimonials, Team, Media upload, Hero, Gallery, B&A, Milestones, Process Steps, Site Assets; CRM status transitions/bulk ops; User Access invite/ban | Writes go to the production DB; awaiting explicit authorisation + `[QA-2026-09-15]` data convention |
| Production user listing to confirm fixture accounts | Auto-mode classifier denied service-role read; owner to confirm in Supabase dashboard |
| F-03 recovery, F-10 auth audit log | Need throwaway mailbox / audit-table read |
| Multi-tab, offline/retry, double-submit races | Not reached |

---

## 6. Test-data / fixture cleanup list

- `blog_posts` slug `qa-test-post` (draft, created 15 Sep by testadmin) — delete.
- `auth.users` + `user_roles`: `testadmin@example.com` (super_admin), `testeditor@example.com` (editor) — delete after role testing.
- Repo root: `create_test_admin.mjs` (service-role key + passwords), `scratch_patch.cjs` — delete; neither is tracked.
- Verify no `[QA-…]` rows in `services` (checked: none), `projects` (none newer than March).

---

## 7. Release readiness — blocking conditions

1. DEF-001 fixed per ADR 0002 (not the `deprecated_icon_url` shortcut) and Services create/edit re-executed.
2. QA-02 resolved and Estimator pricing save + public estimator read re-executed.
3. QA-01 resolved or analytics pages given an explicit error state; `posthog-query` returns 200 for `traffic-stats`.
4. F-07 / F-08 closed with live negative probes (429 observed; cross-origin mutation rejected).
5. Editor/viewer executed in browser **and** against RPC/edge functions directly (F-09, D-007).
6. Fixture accounts and secret-bearing scratch files removed (QA-05).
7. D-001/D-002: feature branch deployed through the pipeline; the four STATE.md verification events re-run on that deployment.
8. `admin-full-flow.spec.ts` rewritten so CI actually covers login → modules → logout.

Until 1–6 are done, verdict stays **NOT READY FOR ACCEPTANCE**; 7–8 are required before any "Closed" label.
