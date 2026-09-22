# UAT003 Evidence Package: Identity Propagation Validation

**Date**: July 7, 2026
**Target**: `track3-uat-20260707-uat-005@crossangle.test` (Using UAT005 internally as UAT003/004 were consumed for edge-case bug fixing prior to this final verification run)

---

### 1. Lead Record

Query output showing the successful insertion of the core operational record:

```json
{
  "created_at": "2026-07-07 12:56:10.127685+00",
  "email": "track3-uat-20260707-uat-005@crossangle.test",
  "id": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
  "lead_source": "estimator",
  "name": "UAT 005",
  "project_type": "C1",
  "service": null,
  "source": "estimator"
}
```
- **Pass Status**: ✅ One row returned. Values correct. Timestamp plausible.

---

### 2. Learning Event

Query output showing the corresponding tracking event in `analytics_events`:

```json
{
  "event_type": "contact_form_submitted",
  "id": "e1b30fb7-b7db-4903-b87a-f490a94b6593",
  "occurred_at": "2026-07-07 12:56:13.906721+00",
  "payload": {
    "correlationId": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
    "email": "track3-uat-20260707-uat-005@crossangle.test",
    "eventVersion": 1,
    "leadId": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
    "leadSource": "estimator",
    "schemaVersion": "2026-07",
    "sessionId": "dd57d772-53a5-47c8-93cf-7d35bbec8ac2",
    "timestamp": "2026-07-07T12:56:10.414Z"
  },
  "user_id": null
}
```
- **Pass Status**: ✅ No required fields missing. Versions populated. Payload valid.

---

### 3. Join Verification

Mapping operational identity to learning telemetry:
- **`leads.id`**: `9f644f1a-8fe9-40de-ae84-52cfe987ef35`
- **`analytics_events.payload->>'leadId'`**: `9f644f1a-8fe9-40de-ae84-52cfe987ef35`

- **Pass Status**: ✅ MATCH. The learning telemetry exactly references the operational database record.

---

### 4. Correlation Integrity (Replay Readiness)

Verifying that the edge function successfully initialized the decision ledger for this identity:

**A. Decision Event Created (`decision_events`)**:
```json
{
  "event_type": "Proposal",
  "id": "a0f5026c-1c80-4a86-b0a4-5687c50c559c",
  "lead_id": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
  "payload": {
    "clientDecision": "Estimate Generated",
    "metadata": {
      "totalMax": 1818600,
      "totalMin": 1818600
    },
    "outcome": "Estimator direct submission",
    "recommendations": []
  },
  "session_id": null
}
```

**B. Workspace Revision Created (`workspace_commitment_revisions`)**:
```json
{
  "id": "8ebf4590-0ce4-4cd8-8c59-7f243050e19e",
  "lead_id": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
  "session_id": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
  "workspace_state": {
    "step": "estimate_submitted"
  }
}
```
- **Pass Status**: ✅ Stable `lead_id` utilized across both ledgers. The foundation for workspace decision-replay is established.

---

### 5. Negative Verification

- **`analytics.failed` Count**: 0 (Confirmed by secondary query run)
- **Pass Status**: ✅ No failures reported during this execution. 

---

### 6. Architecture Verdict

| Verification Step | Result | Evidence |
| - | - | - |
| 1. Edge Function Executes | ✅ PASS | Inserted lead row successfully returned and generated `leadId`. |
| 2. Telemetry Isolation Holds | ✅ PASS | Learning Telemetry reached Supabase exactly matching Edge `leadId`. |
| 3. Join Verification Validates | ✅ PASS | `analytics_events` payload perfectly joins against `leads.id`. |
| 4. Ledger Initialization | ✅ PASS | `decision_events` and `workspace_commitment_revisions` correctly initialized by edge function. |

**Verdict**: The Dataset v1 structure successfully maps operational state and learning telemetry. The system is Replay Ready.
