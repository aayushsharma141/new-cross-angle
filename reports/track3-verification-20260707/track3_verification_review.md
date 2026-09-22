# Track 3 Verification Review — Case 001

Date: 2026-07-07  
Reviewer mode: independent operational verification  
Matrix source: `C:\Users\aayus\.gemini\antigravity-ide\brain\32f3282b-9cbb-47b1-af58-e9d43d172284\artifacts\track3_verification_matrix.md`

## Test Identity

Fresh origin used: `http://127.0.0.1:8080/estimate?case=track3-review-fresh-20260707`

Using `127.0.0.1` avoided the stale `localhost` estimator draft and produced a clean browser storage origin.

Submitted contact:

```text
name: Track3 Reviewer 20260707-uat-001
email: track3-reviewer-20260707-uat-001@crossangle.test
phone: +91 9876500101
```

Selected path:

```text
Apartment
3 BHK
Andhra Pradesh / Guntur
Luxury budget
C5 White Glove Commission
Luxury execution tier
No add-ons
Immediate start
```

## Matrix Result

| # | Step | Status | Evidence |
|---|---|---|---|
| 1 | Dev server starts cleanly | PASS | Vite log: `ready in 2368 ms`, local URL `http://127.0.0.1:8080/`; HTTP probe returned `STATUS=200 LENGTH=2653` for `/estimate`. |
| 2 | Fresh estimator session submitted | PASS | Browser result page rendered after submission; console error list was empty. Screenshot emitted in chat and result screenshot saved at `reports/track3-verification-20260707/row3-result-page.png`. |
| 3 | Edge Function returns 200 | PASS, correlated evidence | Browser console logged `Lead securely captured via edge function: Object`; row landed in `public.leads` at `2026-07-07 07:20:14.359597+00`. Direct Network-tab status was not captured by the browser connector. |
| 4 | Lead persisted to `leads` table | PASS | Query returned lead id `41c645b0-8a7f-4e9a-8e76-0c2b3d8847d1`. |
| 4A | Lead values validated | PASS | `lead_source=estimator`, `source=estimator`, `project_type=C5`, `service=null`, required identity/timestamp/id populated. |
| 5 | Learning event persisted | PASS with column-name caveat | `analytics_events` uses `event_type`, not `event_name`. A `contact_form_submitted` row exists at `2026-07-07 07:20:14.834545+00`. |
| 5A | Learning event schema validated | FAIL | Payload only contains `email` and `leadSource`; `user_id`, `leadId`, `sessionId`, `correlationId`, `timestamp`, `eventVersion`, and `schemaVersion` are absent. |
| 6 | No `analytics.failed` events emitted | PASS | `analytics_failed_count = 0`. |
| 7 | Decision events persisted | NOT APPLICABLE to direct estimator; FAIL for full Case 001 reconstruction | `decision_events_for_reviewer_lead = 0`; `commitment_revisions_for_reviewer_lead = 0`. No commitment/proposal replay chain exists for this direct estimator path. |
| 8 | PostHog receives same event | NOT CHECKED / OBSERVATIONAL | Non-blocking per revised governance. |

## Query Evidence

### Rows 4 and 4A — Lead Persistence

```json
{
  "city": "Guntur",
  "city_tier": "tier2",
  "created_at": "2026-07-07 07:20:14.359597+00",
  "email": "track3-reviewer-20260707-uat-001@crossangle.test",
  "estimated_max": 20071800,
  "estimated_min": 14289800,
  "id": "41c645b0-8a7f-4e9a-8e76-0c2b3d8847d1",
  "lead_score": 76,
  "lead_source": "estimator",
  "name": "Track3 Reviewer 20260707-uat-001",
  "project_type": "C5",
  "property_type": "apartment",
  "score": 76,
  "service": null,
  "source": "estimator",
  "start_timing": "Immediate",
  "state": "Andhra Pradesh"
}
```

### Analytics Table Schema

```json
[
  { "column_name": "id", "data_type": "uuid" },
  { "column_name": "event_type", "data_type": "text" },
  { "column_name": "user_id", "data_type": "uuid" },
  { "column_name": "payload", "data_type": "jsonb" },
  { "column_name": "occurred_at", "data_type": "timestamp with time zone" }
]
```

### Rows 5 and 5A — Learning Event

```json
{
  "event_type": "contact_form_submitted",
  "id": "52eaac9a-3f37-4647-9988-cadd829089a1",
  "occurred_at": "2026-07-07 07:20:14.834545+00",
  "payload": {
    "email": "track3-reviewer-20260707-uat-001@crossangle.test",
    "leadSource": "estimator"
  },
  "user_id": null
}
```

Schema verdict:

```text
Missing: leadId, sessionId, correlationId, timestamp, eventVersion, schemaVersion
Null: user_id
```

### Row 6 — Analytics Failure Events

```json
{
  "analytics_failed_count": 0
}
```

### Row 7 — Decision / Replay Chain

```json
{
  "decision_events_for_reviewer_lead": 0
}
```

```json
{
  "commitment_revisions_for_reviewer_lead": 0
}
```

## Browser Evidence

Result page excerpt after submit:

```text
BASELINE INVESTMENT OUTLOOK
INR 1,42,89,614 - INR 2,00,71,539

This is a direct estimate
```

Console evidence:

```text
errors: []
log: Lead securely captured via edge function: Object
```

Saved screenshot:

```text
reports/track3-verification-20260707/row3-result-page.png
```

## Reviewer Decision

Track 3 remains **PENDING OPERATIONAL VERIFICATION**.

The persistence repair is successful, but Track 3 cannot close because the critical learning event schema does not satisfy the matrix. The current telemetry wrapper persists an event, but it does not attach the required correlation and version metadata needed to reconstruct the evidence chain.

Required remediation before closure:

1. Add `leadId` to the estimator submission analytics event after the Edge Function returns the created lead id.
2. Add `sessionId` and `correlationId` to the event payload.
3. Add `timestamp`, `eventVersion`, and `schemaVersion` to persisted learning telemetry.
4. Decide whether `analytics_events` should expose `event_name` or whether the matrix should be amended to use the implemented `event_type` column.
5. Explicitly classify direct estimator submissions as non-decision-ledger cases, or create a minimal replayable decision event for them.

---

## UAT002 Post-Fix Verification

Date: 2026-07-07  
Submitted contact:

```text
name: Track3 UAT 20260707-uat-002
email: track3-uat-20260707-uat-002@crossangle.test
phone: +91 9876500102
```

Browser evidence:

```text
Result page rendered:
BASELINE INVESTMENT OUTLOOK
INR 1,42,89,659 - INR 2,00,71,602

Console errors: []
```

Saved screenshots:

```text
reports/track3-verification-20260707/row2-uat002-pre-submit-contact.png
reports/track3-verification-20260707/row3-uat002-result-page.png
```

### Lead Query

```json
{
  "city": "Guntur",
  "city_tier": "tier2",
  "created_at": "2026-07-07 07:50:39.105882+00",
  "email": "track3-uat-20260707-uat-002@crossangle.test",
  "estimated_max": 20071800,
  "estimated_min": 14289800,
  "id": "89eadd45-c081-44b3-b8f3-e15dad65fd73",
  "lead_score": 76,
  "lead_source": "estimator",
  "name": "Track3 UAT 20260707-uat-002",
  "project_type": "C5",
  "property_type": "apartment",
  "score": 76,
  "service": null,
  "source": "estimator",
  "start_timing": "Immediate",
  "state": "Andhra Pradesh"
}
```

### Analytics Query

Exact query by UAT002 email:

```json
[]
```

Latest analytics rows around the run:

```json
[
  {
    "event_type": "estimate_path_selected",
    "occurred_at": "2026-07-07 07:50:38.210304+00",
    "payload": {
      "eventVersion": 1,
      "pathId": "calculator_complete",
      "schemaVersion": "2026-07",
      "timestamp": "2026-07-07T07:50:37.220Z"
    },
    "user_id": null
  },
  {
    "event_type": "estimate_path_selected",
    "occurred_at": "2026-07-07 07:50:07.267132+00",
    "payload": {
      "eventVersion": 1,
      "pathId": "calculator_started",
      "schemaVersion": "2026-07",
      "timestamp": "2026-07-07T07:50:05.834Z"
    },
    "user_id": null
  }
]
```

`analytics.failed` count remained `0`.

### Replay Chain Query

```json
{
  "decision_events": [],
  "workspace_commitment_revisions": []
}
```

### UAT002 Decision

Rows 2 and 3 pass by browser evidence: the estimator submitted and rendered a result with no JavaScript errors, and lead persistence proves the Edge Function completed the insert.

Track 3 still cannot close:

1. No `contact_form_submitted` learning event was found for UAT002.
2. The new metadata enrichment is visible on `estimate_path_selected`, but not on the required submit event.
3. No lead-specific `decision_events` or `workspace_commitment_revisions` were created remotely.
4. The local Edge Function source contains replay-chain insert logic, but the remote function behavior observed in UAT002 did not produce those rows. Treat this as possible deployment/runtime drift until proven otherwise.
