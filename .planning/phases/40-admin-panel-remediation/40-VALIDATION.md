---
phase: 40
slug: admin-panel-remediation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-14
---

# Phase 40 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `40-RESEARCH.md` § Validation Architecture. Task IDs are filled in once plans exist.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (apps/web) + Playwright (repo root) |
| **Config file** | `apps/web/vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test --workspace=web -- <file>` |
| **Full suite command** | `npm run test --workspace=web && npm run typecheck && npm run lint && npm run arch:supabase-auth --workspace=web && npm run arch:check --workspace=web` |
| **Estimated runtime** | ~90 seconds (full Vitest suite ~60 s; typecheck ~30 s) |

---

## Sampling Rate

- **After every task commit:** the single new/changed Vitest file + `npm run typecheck`
- **After every plan wave:** full suite command
- **Before `/gsd:verify-work`:** full suite green, plus operator proof evidence (lead id, `lead_activities` rows, `net._http_response` statuses, decoded `aal` claim) recorded in the phase verification note
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | — | D-01 | — | Recipients = env default + list, deduped, invalid dropped | unit | `vitest run src/test/lead-notify.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-02 | — | Newsletter sign-ups (new `source` marker + legacy fingerprint) get no auto-reply; template escapes name/service | unit | `vitest run src/test/lead-notify.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-03 | — | Chat-id list validated/capped; no `1228126069` literal left in functions | unit + grep | `vitest run src/test/lead-notify.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-04 | — | Digest sends once/day; stale-lead-checker rejects unauthenticated calls | unit | `vitest run src/test/stale-digest.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-05 | — | Claim-then-send: second call does not re-email | unit (fake client) | `vitest run src/test/lead-notify.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-06 | — | No bearer/hex secret literal in any repo SQL/TS | grep contract | `vitest run src/test/no-hardcoded-secrets.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-07/D-08 | — | Login withholds session cookies until AAL2 verify for every role; pending cookie path-scoped, short-lived | unit (mock fetch) | `vitest run src/test/auth/mfa-login.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-07 | — | `reset-mfa` is super-admin only and audit-logged | unit | `vitest run src/test/auth/mfa-reset.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-09 | — | Idle hook warns at T-2 min, logs out at T, resets on input, works across tabs | unit (fake timers) | `vitest run src/test/useIdleLogout.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-10 | — | No "will be required to set up" / "Inactive users will be logged out" copy while inactive | grep contract | `vitest run src/test/security-copy-truthful.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-11 | — | Per-item SEO fallback chain; middleware OG for project/service/blog uses real columns | unit | `vitest run src/test/seo-resolve.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-12 | — | Every `*.seo` block has `ogImage` + `noindex`; old rows normalise | unit (extend) | `vitest run src/test/siteContent.test.ts` | ✅ extend | ⬜ pending |
| TBD | TBD | — | D-12 | — | Page emits `robots noindex` / `og:image` when set | e2e | `npx playwright test e2e/seo-blocks.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | D-13 | — | Default menu/footer blocks reproduce today's links; unsafe hrefs rejected | unit (extend) | `vitest run src/test/siteContent.test.ts` | ✅ extend | ⬜ pending |
| TBD | TBD | — | D-14 | — | Form wording defaults equal current strings; overrides render | unit + e2e | `npx playwright test e2e/contact-form-flow.spec.ts` | ✅ extend | ⬜ pending |
| TBD | TBD | — | D-15 | — | Lock payload built from real lead/events; no placeholder literals; error toast on failure | unit + grep | `vitest run src/test/workspace-lock.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | all | — | Auth and layering invariants stay green | existing | `npm run arch:supabase-auth --workspace=web && npm run arch:fitness --workspace=web` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `supabase/functions/_lib/leadNotify.ts` (pure, no imports) + `apps/web/src/test/lead-notify.test.ts`
- [ ] `apps/web/api/_lib/mfa.ts` + `apps/web/src/test/auth/mfa-login.test.ts`, `mfa-reset.test.ts`
- [ ] `apps/web/src/test/useIdleLogout.test.ts`, `security-copy-truthful.test.ts`, `no-hardcoded-secrets.test.ts`, `seo-resolve.test.ts`, `workspace-lock.test.ts`, `stale-digest.test.ts`
- [ ] Playwright admin setup (`e2e/setup/admin-auth.ts`) gains TOTP support via `PLAYWRIGHT_ADMIN_TOTP_SECRET` (test-only RFC 6238 helper), so e2e keeps working once 2FA is enforced
- [ ] Edge-function logic kept in pure `_lib` modules so Vitest can test it (Deno is not installed locally)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A real submission produces the Telegram message, internal email, customer reply and both `lead_activities` rows | D-05 | Needs production deploy, Vault secret and a real lead insert (operator write) | Submit a test lead; `select activity_type from lead_activities where lead_id='<id>'`; check `net._http_response` statuses; delete the test lead |
| AAL2 survives `/api/auth/refresh` | D-07 | Depends on hosted GoTrue behaviour (research assumption A2) | Log in with TOTP, call `/api/auth/refresh`, decode the new access token, confirm `aal: "aal2"` |
| RLS backstop denies AAL1, allows AAL2, inert while `enforce_2fa` is false | D-07 | Policy applied by operator after all logins enrol | Read-only `db query` simulations with `set local request.jwt.claims` |
| Cron jobs authenticate (200, not 401) | D-04 | Runs on the production scheduler | Next run: `select status_code from net._http_response order by created desc limit 3` |
| Resend sender domain is verified | D-05 | External provider setting (assumption A4) | Resend dashboard → Domains |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90 s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
