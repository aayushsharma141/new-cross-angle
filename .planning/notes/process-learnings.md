# Process Learnings — Lab Notebook

*Constitutional rule: Evidence over assumption. Verification method matters as much as the result.*

---

## PL-001 — Verification Method Failure Producing Incorrect Architectural Conclusion

**Date:** 2026-07-07
**Status:** Institutionalized
**Phase:** Phase 31 — Production Readiness Audit
**Track:** Track 3 — Analytics Pipeline Instrumentation

### Observation

During debugging of the `analytics_events` pipeline, a verification script was written to confirm that the Supabase `anon` role could insert rows. The script chained `.insert()` with `.select()`:

```js
supabase.from("analytics_events").insert({ ... }).select()
```

The call failed with a `42501` RLS violation.

### False Conclusion

The `anon` insert RLS policy was broken. The architecture was declared "misaligned."

### Evidence

```js
supabase.from("analytics_events").insert({ ... })
// no .select() — reads back nothing, error is null, row exists in DB
```

This returned `{ error: null }`. Inserts were working the entire time.

### Correct Conclusion

The `anon_insert_analytics_events` policy permits `INSERT` but not `SELECT`. The `.select()` chain triggered a read-permission check on the just-inserted row — a check the `anon` role correctly cannot pass.

This was a **verification method failure**, not a **system failure**.

### Institutional Lesson

This is exactly the failure mode the constitution's "Evidence over assumption" law is designed to prevent. The failure occurred not at the hypothesis stage, but at the *verification* stage — a subtle and more dangerous category.

**Amendment to verification practice:**
> Before concluding that a write operation is broken, verify the write independently from the read. RLS policies on write and read permissions are evaluated separately. A successful insert does not require a successful subsequent select.

### Why This Matters Institutionally

The governance constitution prevented the incorrect conclusion from becoming institutional truth. The hypothesis "RLS is broken for writes" was held as `[Likely]` and not `[Certain]`, which left the door open to correction. Had it been promoted to `[Certain]` and documented as an architectural flaw, the wrong remediation path would have been pursued.

**The lesson is not "we found the bug." The lesson is: the verification method must be validated before the conclusion is accepted.**

---

## PL-002 — Missing Instrumentation Misclassified as Architecture Failure

**Date:** 2026-07-07
**Status:** Institutionalized
**Phase:** Phase 31 — Production Readiness Audit
**Track:** Track 3 — Analytics Pipeline Instrumentation

### Observation

`analytics_events` showed zero rows for the estimator flow. The architecture (`Application → Supabase`) was initially suspected.

### False Conclusion

The architecture was broken and failed to deliver telemetry payload across boundaries.

### Evidence

The estimator's `saveLead` function in `useCalculatorStore.ts` invoked the `submit-estimate` Edge Function but contained **no telemetry call at all**. The `track()` function was simply never invoked.

### Correct Conclusion

The architecture was never exercised — therefore it wasn't broken. It was a case of **missing instrumentation**.

### Institutional Lesson

The distinction matters:
- Architecture failure = the pipeline cannot carry data
- Missing instrumentation = the pipeline was never called

These require completely different remediation. Misclassifying one as the other wastes investigation time on a functioning system. A broken architecture requires structural repair. Missing instrumentation is a gap fill.

---

## PL-004 — Environment Drift

**Date:** 2026-07-07
**Status:** Institutionalized
**Phase:** Phase 31 — Production Readiness Audit
**Track:** Track 3 — Analytics Pipeline Instrumentation

### Observation

During UAT002 (Track 3 verification), local fixes for `submit-estimate` were tested via the browser, but the edge function did not execute the expected `decision_events` or `workspace_commitment_revisions` inserts.

### Drift Type

Deployment Drift (Remote execution environment ≠ Local code repository).

### Detection Method

Verification scripts querying the linked remote Supabase project (`npx supabase db query --linked`) showed zero rows created for the event types handled by the edge function, despite local code proving the logic was written.

### Impact

A false conclusion that the updated code failed or was incorrect, when in reality the code was never deployed to the test environment. 

### Resolution

Executed `npx supabase functions deploy submit-estimate` to synchronize the local edge function code to the remote environment.

### Preventive Action

Whenever an automated UI or integration test interacts with a backend service, we must explicitly confirm that the latest version of the service code has been successfully pushed/deployed to the target environment before executing the test. We should separate **Identity drift** (code logic failures: events ≠ joinable evidence) from **Deployment drift** (execution environment failures: remote ≠ local).

### PL-005: Do not assume successful persistence implies successful identity propagation

**Status:** Institutionalized

**Observation**:
When using the backend ORM/Client (in this case, Supabase JS client v2), calling `.insert({...})` without a specific return projection (like `.select()`) successfully inserted the operational record but returned `undefined` for the newly created primary key (`leadId`).

**Consequence**:
The Edge Function successfully persisted the operational state, but because the identity was missing in the returned response, it silently cascaded a failure downstream. The frontend blindly included `leadId: undefined` in the telemetry event. The system didn't fail. It silently fractured the data integrity, breaking the correlation between the operational reality and the learning ledger.

**Institutional Lesson**:
This represents the most dangerous class of errors in a learning architecture: **silent integrity failures**. 
*Do not assume successful persistence implies successful identity propagation.* 

**Resolution**:
All write operations that establish an identity (like a Lead ID) MUST explicitly verify and return that identity (`.select().single()`). Furthermore, the system must never silently swallow undefined correlation IDs in telemetry payloads. The architectural rule is that the evidence chain must be unbreakable.

## PL-006 — Semantic API Drift

**Date:** 2026-07-07
**Status:** Institutionalized

### Observation
A valid analytics call produced valid telemetry in the wrong system.

### False Assumption
Any `track()` call contributes to the learning dataset.

### Evidence
Event appeared in PostHog but was absent from `analytics_events`.

### Correct Conclusion
Learning events must use the dedicated learning telemetry API.

### Institutional Lesson
APIs with similar names but different semantics should be difficult or impossible to misuse.

---

## PL-007 — Successful Transport Is Not Evidence of Successful Business Execution

**Date:** 2026-07-07
**Status:** Institutionalized
**Source:** OI-001 — `submit-workspace-commitment` deployment and verification

### Observation

After deploying `submit-workspace-commitment`, the first verification returned HTTP 500. The deployment routing layer (Supabase function registry) was functioning — the 404 was gone. However, the function was referencing `lead_source: 'workspace_studio'`, a value absent from `lead_source_enum` in the database. The function could receive and process the request but could not complete its intended side effect.

### False Assumption (avoided)

> A non-404 response indicates the function is production-ready.

### Correct Conclusion

Two independent failure layers can exist simultaneously:
1. **Routing layer** — is the function reachable? (404 = no)
2. **Business execution layer** — does the function complete its intended side effect? (500 = no)

Returning from the first layer does not guarantee success at the second.

### Institutional Lesson

> **A successful transport response is not evidence of successful business execution. Production readiness requires verification of the intended side effect.**

This principle applies regardless of technology: Supabase Edge Functions, REST, gRPC, message queues, or anything else. The transport envelope and the business transaction are separate concerns. Only confirmed execution of the intended side effect — in this case, a verified database write — constitutes evidence of production readiness.

**Verification standard for any edge function or service endpoint:**
- Transport success (non-error HTTP status) → necessary but not sufficient
- Intended side effect confirmed (database row persisted, event emitted, etc.) → required for production readiness

*Classification: [Likely] — generalised from one instance. Upgrade to [Certain] if recurs on another function or service boundary.*