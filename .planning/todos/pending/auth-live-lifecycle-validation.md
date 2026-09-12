---
title: "Live lifecycle validation for F-03 / F-05 / F-06 — closes the auth audit"
date: 2026-09-12
priority: high
depends_on: "Admin password in .env.local; branch pushed for a Vercel preview; a throwaway recovery account"
---

## Task

Move F-03 (recovery), F-05 (refresh), F-06 (logout) from **Verified** to
**Closed** per ADR 0004 by running the real-provider harness. Until this
passes, the admin authentication audit is *not* closed and **Patch 3
(F-07–F-10) does not start** — the next security work is evidence, not code.

Harness: `e2e/auth-lifecycle-smoke.spec.ts` (committed `cf350e69`).
Always `--project=chromium` — the recovery link is single-use and the config
defines five browser projects.

```bash
npx playwright test e2e/auth-lifecycle-smoke.spec.ts --project=chromium
```

## Sub-tasks

1. **F-06 logout — local.**
   Set `PLAYWRIGHT_ADMIN_PASSWORD` in `.env.local` (never in chat or source).
   Run. Expect F-06 pass; F-05 and F-03 skip with named reasons.
   Side effect: `scope=global` revokes every session for that account.

2. **F-05 refresh — Vercel preview.**
   Push `feature/dam-v3-milestone-planning` (28+ commits unpushed at time of
   writing). Set `PLAYWRIGHT_BASE_URL` to the preview URL. Run. Expect F-05
   pass. The 401→refresh→retry lives in `middleware.ts` (Edge only); a local
   run cannot prove it.

3. **F-03 recovery — throwaway account.**
   Provision a disposable user (any role; the harness refuses
   `PLAYWRIGHT_ADMIN_EMAIL`). Set `SMOKE_RECOVERY_EMAIL`, run once to send the
   email. Paste the link into `SMOKE_RECOVERY_LINK`, set
   `SMOKE_RECOVERY_NEW_PASSWORD`, run again. Expect: 200 update, 400 replay,
   401 for the recovery access token, 200 login with the new password.

4. **Record the evidence.** Paste the three Playwright outcomes into
   `.planning/STATE.md` and update the review document; flip the three rows to
   **Closed** with the run output as the artifact. Delete the throwaway user.

5. **Then** open the residual found during review: `logout.ts` revokes only
   when an `access_token` cookie is present, so a logout after JWT expiry
   clears cookies without revoking the refresh token (Low). Fix is
   refresh-then-revoke. This is the first item of Patch 3, not part of this
   task.

## Open dashboard questions to settle while in the Supabase console

- Is public signup enabled? (compounds F-09)
- JWT expiry and refresh-token rotation settings
- Recovery OTP expiry; consider switching the recovery email template to the
  token-hash variable so tokens never appear in the URL fragment
  (`recover.ts` already supports `verifyOtp(token_hash)`)
- GoTrue sign-in rate limits (only brute-force control in force — F-07)

## References

- ADR 0004 — fix evidence tiers
- PL-008 in `.planning/notes/process-learnings.md`
- Review: https://claude.ai/code/artifact/c659c2c9-a1c8-40d0-8b78-952d160a99ea
