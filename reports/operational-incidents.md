# Operational Incidents Log

> **Purpose:** A permanent record of operational failures, distinct from product defects, learning defects, and instrumentation defects.
>
> **Why this exists:** A system that recommends well but deploys incorrectly is not trustworthy. A system that deploys correctly but doesn't learn is not improving. These are different failure modes with different remediation strategies. This log exists so they are never conflated.

---

## Defect Taxonomy

| Category | Definition | Example |
|---|---|---|
| **Product Defect** | The software behaves incorrectly given correct inputs | Estimator calculates wrong total |
| **Learning Defect** | The system receives data but learns incorrectly from it | DQI scores a good decision as poor |
| **Instrumentation Defect** | The system runs but emits wrong or missing telemetry | Score captured as null when it should be 76 |
| **Operational Defect** | The operational environment is incomplete or misconfigured | Edge Function not deployed |

---

## OI-001 — Edge Function Never Deployed

**Incident ID:** OI-001
**Discovery Date:** 2026-07-06
**Detection Method:** Dataset v1 Case 001 end-to-end observation (governance-mandated)

### What was observed

The estimator workflow completed in the UI without visible error.
The results screen rendered correctly.
No row was written to the database.

### Category

Operational Integrity Failure

### Root Cause

The `submit-estimate` Supabase Edge Function existed in source control but had never been deployed to the remote project (`iuuivmwqodefdrrrewol`).

All callers received HTTP 404 `NOT_FOUND` silently.  
The frontend caught the error but did not surface it to the user.  
No alert, no log, no visibility.

### Dataset Impact

Unknown. The function was never deployed, so **every estimator submission since the feature was built has been silently discarded.**

The exact impact window cannot be determined without knowing:
1. When the `submit-estimate` function was first written.
2. When the first real user submitted the estimator.

This data gap is itself a finding.

### Resolution

```
npx supabase functions deploy submit-estimate --project-ref iuuivmwqodefdrrrewol
```

HTTP 200 confirmed post-deployment. Server-side DB insert inferred.

### Preventive Action

- [ ] Add `submit-estimate` deployment to the CI/CD or release checklist
- [ ] Add a startup health check in `/admin/learning-health` that pings the function and reports its status
- [ ] Add a non-silent error state on the estimator results screen when the edge function fails (currently swallowed in `catch`)
- [ ] Audit all other edge functions for the same deployment gap

### Notes

This was detected by the end-to-end observation protocol mandated by Dataset v1 governance.  
Without Case 001, this would not have been found until a real client submitted and the team noticed zero leads in the database.

The architecture isolated the failure to the deployment boundary — the estimator logic, scoring, and payload construction were all correct. This is a hallmark of a well-partitioned system.

---

_New incidents should be added below in the same format._
