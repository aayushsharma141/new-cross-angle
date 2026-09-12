# 0004. A fix carries an evidence label, the same way a finding does

- **Date:** 2026-09-12
- **Status:** Accepted

## Context

The admin authentication audit (11–12 Sep 2026) labelled every finding
`Verified / Inferred / Unknown` and refused to assign severity without naming
the evidence. Fixes had no such discipline: a fix was either open or
"RESOLVED".

That asymmetry produced a false closure. F-03 (password recovery) was reported
RESOLVED on the strength of nine passing Vitest cases. The tests mocked
`supabase.auth.setSession`, `exchangeCodeForSession` and `verifyOtp` to return a
session whenever called, so they proved the handler's branching and nothing
about the token contract. In production the browser client is implicit-flow,
the recovery link carries `#access_token=…&refresh_token=…`, the client
forwarded only `access_token`, and auth-js rejects an empty refresh token
(`GoTrueClient.js:3019`). Every real recovery would have returned 400. The
defect was found by tracing the production flow, not by any test
(fixed in `b06a549a`).

The same shape appeared on the database side. `rpc_register_dam_asset` carried
an authorization guard in `20260622000001_dam_v3_rpcs.sql` and none in
production; `update_media_metadata(text, jsonb)` existed in production as a
callable RPC that no migration created. A finding "verified from migrations" was
verified against something that was not the system (see ADR 0003).

In both cases the evidence looked complete because it was internally consistent,
and was wrong because the boundary that mattered had been replaced by a stand-in.

## Decision

1. **Fix status uses three labels.** "Resolved" is retired.

   | Label | Meaning | Minimum artifact |
   | --- | --- | --- |
   | **Implemented** | Code merged; unit or mocked tests pass. | Commit SHA + test file |
   | **Verified** | The trust boundary the finding was *about* has been crossed with the real component on the far side — real auth-js, real Postgres, real Edge runtime — even if the environment is local or disposable. | The unmocked test, script, or query, named |
   | **Closed** | A live round-trip on the deployed system has passed, or live inspection shows the finding cannot occur. | Run output, or `pg_get_functiondef` / `pg_policies` evidence |

   A status table must name the artifact behind each label. A label with no
   artifact is `Implemented` at most.

2. **Test tiers are reported separately, never summed.** "30/30 tests pass" is
   not a status. Reports distinguish:
   - unit / contract tests (pure logic, everything external mocked),
   - mocked integration tests (our layers wired together, providers mocked),
   - real-provider integration tests (real Supabase, disposable data),
   - browser / API end-to-end tests against a deployment.

   Only the last two can move a fix past `Implemented`.

3. **Database claims cite the live catalogue.** Any finding or fix that concerns
   a Postgres function, policy, grant or constraint cites `pg_get_functiondef`,
   `pg_proc.proconfig`, `pg_proc.proacl` or `pg_policies` from the linked
   project. Migration files are context, not evidence (ADR 0003).

4. **Security findings close only at `Closed`.** For anything under
   `api/auth/`, `middleware.ts`, `components/auth/`, RLS or `SECURITY DEFINER`
   functions, an audit is not closed while any finding sits at `Implemented`
   or `Verified`.

## Consequences

- Status tables get longer and slower to fill in. That is the point: the
  F-03 table took one word to be wrong.
- Some fixes will sit at `Implemented` for a while when the only real
  provider is production and exercising it needs credentials, a preview
  deployment, or a throwaway account. That is the state of F-01, F-03, F-05
  and F-06 at the time of this decision: their tests mock the far side of the
  boundary, so by this definition they are not yet `Verified`. F-02 is
  `Verified` (the real handler's response is what the test asserts). The
  label says so honestly instead of hiding it.
- The audit review document and `.planning/STATE.md` adopt these labels
  immediately. `e2e/auth-lifecycle-smoke.spec.ts` is the reference shape for
  a `Closed`-tier artifact: real provider, disposable account, refuses to run
  destructively against a primary account, skips with a named reason when a
  prerequisite is missing.
- This is a definition applied with judgment, not yet a mechanical gate. A
  gate (for example, refusing a status row whose label lacks an artifact path)
  is worth adding once the definition has been used across a few audits and
  its edge cases are known — see the seed
  `.planning/seeds/live-schema-inventory-before-db-audits.md`.

## Related

- ADR 0003 — production is the schema source of truth
- `.planning/notes/process-learnings.md` — PL-008 (mocks lied), PL-009 (migrations lied)
- Review: https://claude.ai/code/artifact/c659c2c9-a1c8-40d0-8b78-952d160a99ea
