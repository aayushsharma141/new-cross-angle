# UAT003 Evidence Package

## 1. Context
We sought to prove that a workspace designer clicking "Lock Commitment" successfully propagates operational identity into the learning event ledger (`analytics_events`), and creates the corresponding record in `workspace_commitment_revisions`.

## 2. Telemetry Bug Fix
It was discovered that `AdminLeadWorkspace.tsx` was calling the client-side `track` method imported from `@/analytics/AnalyticsProvider`, which routes events only to PostHog (Product Analytics). 
This was a structural error. The correct method is `recordLearningEvent` from `@/analytics/track`, which routes to both Supabase (Learning Analytics) and PostHog.
The fix was implemented, separating the Product Analytics `analytics` var from the dual-write `recordLearningEvent` function.

## 3. UAT Execution
The browser subagent accessed the UI for Lead `9f644f1a-8fe9-40de-ae84-52cfe987ef35` and clicked the "Lock Commitment" button.

### 4. Evidence: Workspace Commitment Revision
The operational backend correctly inserted a locked revision:
```json
{
  "commitment_id": "e17b34c2-4de4-458f-9dcd-1c5cf45f5226",
  "id": "16e439b5-b407-49a8-b844-4b1d8f74586a",
  "is_locked": true
}
```

### 5. Evidence: Learning Event (`analytics_events`)
The telemetry system caught the interaction and populated the identity chain and event schema:
```json
{
  "event_type": "workspace.commitment.locked",
  "payload": {
    "activeRoom": "before",
    "commitmentId": "e17b34c2-4de4-458f-9dcd-1c5cf45f5226",
    "confidenceDrivers": [
      "Evidence",
      "Client Constraints"
    ],
    "designerConfidence": 85,
    "dqiAlgorithmVersion": "1.0",
    "dqiConfidence": "MEDIUM",
    "dqiStage": "provisional",
    "eventVersion": 1,
    "evidenceAvailable": 10,
    "evidenceUsed": 2,
    "evidenceViewed": 4,
    "genomeVersion": "1.0.0",
    "leadId": "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
    "revisionId": "16e439b5-b407-49a8-b844-4b1d8f74586a",
    "schemaVersion": "2026-07",
    "selectedConstraints": [
      "Budget",
      "Timeline"
    ],
    "selectedEvidence": [
      "Market Comparable 1",
      "Past Project A"
    ],
    "selectedPriorities": [
      "Aesthetics"
    ],
    "timeToDecisionMs": 49988,
    "timestamp": "2026-07-07T13:32:06.939Z",
    "workspaceVersion": "1.0"
  },
  "user_id": null
}
```

## 6. Conclusion
* **One row inserted:** ✅
* **Timestamp plausible:** ✅
* **Values correct:** ✅
* **Identity Keys present:** `leadId`, `commitmentId`, `revisionId` are all present and valid. ✅
* **Data versions populated:** `schemaVersion` and `eventVersion` correctly injected by wrapper. ✅

### Verdict
UAT003 is **PASS**. We are officially Replay Validated.
