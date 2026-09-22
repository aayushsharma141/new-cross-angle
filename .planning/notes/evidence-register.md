# Evidence Register

*Purpose: Explicit traceability index mapping the semantic relationships and metadata of all governance and evidence nodes.*

*Updated after every: Founding Case, DIR, OI open/close, PL entry.*

---

## Artifact Type Reference

| Prefix | Type | Location |
|--------|------|----------|
| `FC` | Founding Case | `run_fc*.ts`, `LAB_NOTEBOOK.md` |
| `DIR` | Dataset Integrity Review | `.planning/notes/dataset-integrity-reviews.md` |
| `OI` | Operational Investigation | `.planning/notes/operational-investigations.md` |
| `PL` | Process Learning | `.planning/notes/process-learnings.md` |

---

## Node Index & Metadata

### FC-001
- **Status:** Accepted with Operational Deviation
- **Confidence:** Certain (direct operational verification via database queries)
- **Evidence Count:** 3 (leads, analytics_events, workspace_commitment_revisions records)
- **Last Reviewed:** 2026-07-07

### DIR-001
- **Status:** Closed
- **Confidence:** Certain (all 4 integrity checklist questions answered)
- **Evidence Count:** 1 (DIR-001 log entry)
- **Last Reviewed:** 2026-07-07

### OI-001
- **Status:** Open
- **Confidence:** Likely (deployment drift hypothesis is supported by local edge function presence)
- **Evidence Count:** 2 (remote 404 response error, local file verification)
- **Last Reviewed:** 2026-07-07

### OI-002
- **Status:** Open (monitoring only)
- **Confidence:** Certain (undocumented schema pattern verified via database inspection)
- **Evidence Count:** 1 (lack of workspace_commitments parent table in schema)
- **Last Reviewed:** 2026-07-07

### PL-001
- **Status:** Institutionalized
- **Confidence:** Certain (verified via RLS write-vs-read query behavior)
- **Evidence Count:** 2 (local test script failures, RLS policy schema)
- **Last Reviewed:** 2026-07-07

### PL-005
- **Status:** Institutionalized
- **Confidence:** Certain (silent data integrity fracture validated via client response payload observation)
- **Evidence Count:** 2 (undefined leadId in analytics_events, successful workspace_commitment_revisions insert)
- **Last Reviewed:** 2026-07-07

---

## Semantic Relationship Graph

### FC-001
- `produces` -> [DIR-001](file:///c:/Users/aayus/Desktop/main/.planning/notes/dataset-integrity-reviews.md#dir-001--founding-case-001-integrity-review)
- `informed_by` -> [PL-001](file:///c:/Users/aayus/Desktop/main/.planning/notes/process-learnings.md#pl-001--verification-method-failure-producing-incorrect-architectural-conclusion)
- `informed_by` -> [PL-005](file:///c:/Users/aayus/Desktop/main/.planning/notes/process-learnings.md#pl-005-do-not-assume-successful-persistence-implies-successful-identity-propagation)

### DIR-001
- `reviews` -> [FC-001](file:///c:/Users/aayus/Desktop/main/LAB_NOTEBOOK.md#dataset-v1-founding-case-001)
- `opens` -> [OI-001](file:///c:/Users/aayus/Desktop/main/.planning/notes/operational-investigations.md#oi-001--missing-submit-workspace-commitment-edge-function-deployment)
- `opens` -> [OI-002](file:///c:/Users/aayus/Desktop/main/.planning/notes/operational-investigations.md#oi-002--append-only-ledger-query-strategy)
- `references` -> [PL-005](file:///c:/Users/aayus/Desktop/main/.planning/notes/process-learnings.md#pl-005-do-not-assume-successful-persistence-implies-successful-identity-propagation)

### OI-001
- `discovered_by` -> [FC-001](file:///c:/Users/aayus/Desktop/main/LAB_NOTEBOOK.md#dataset-v1-founding-case-001)
- `documented_by` -> [DIR-001](file:///c:/Users/aayus/Desktop/main/.planning/notes/dataset-integrity-reviews.md#dir-001--founding-case-001-integrity-review)
- `blocks_production_path_for` -> FC-002 (unresolved drift prevents production telemetry validation)
- `will_resolve_via` -> Deployment Verification (deploy edge function and execute remote smoke test)

### OI-002
- `discovered_by` -> [FC-001](file:///c:/Users/aayus/Desktop/main/LAB_NOTEBOOK.md#dataset-v1-founding-case-001)
- `documented_by` -> [DIR-001](file:///c:/Users/aayus/Desktop/main/.planning/notes/dataset-integrity-reviews.md#dir-001--founding-case-001-integrity-review)
- `escalates_if` -> FC-002 through FC-010 (if same query complexity concerns recur)

---

## Instrument Stability Checklist — Case 5 Review

*To be completed when FC-005 DIR closes.*

- [ ] Telemetry completeness: same or improved vs FC-001?
- [ ] New operational deviations: any OIs opened since FC-001?
- [ ] Identity propagation: any failures observed in FC-002 through FC-005?
- [ ] Replay readiness: still stable at State Reconstruction level?
- [ ] Process learnings: any PL repeating across multiple cases?

*If all five are reassuring: stability review passes. No product metrics required.*

---

*Last updated: 2026-07-07 after FC-001 / DIR-001 / OI-001 / OI-002*
