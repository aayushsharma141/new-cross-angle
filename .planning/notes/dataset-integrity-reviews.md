# Dataset Integrity Reviews

*Purpose: After every Founding Case, answer the four instrument-trust questions before any product analysis begins. One case cannot establish trends — it can only verify that the instrument recorded faithfully.*

**Constitutional rule:** n=1 cannot establish patterns. Every claim must begin "In Founding Case N..." not "The platform shows..."

---

## Evidence Status Taxonomy

| Status | Meaning |
|--------|---------|
| **Accepted** | Evidence is complete and collected through the intended production path. |
| **Accepted with Operational Deviation** | Evidence is internally consistent, but one or more operational deviations occurred (deployment gap, fallback path, temporary infrastructure issue). |
| **Rejected** | Evidence is incomplete, inconsistent, or cannot support the intended analysis. |
| **Quarantined** | Evidence is retained but excluded from Dataset v1 until the issue is understood. |

---

## Case Selection Rule

> **Choose the next case from the natural queue of ordinary work. Only use synthetic scenarios when validating instrumentation — never when building Dataset v1.**

Representativeness takes precedence over coverage. Do not select a case because it exercises a different workflow path. Select it because it is a genuine, ordinary project of the kind Crossangle actually receives. Sampling bias introduced at this stage cannot be corrected later without invalidating cases.

**Consequence:** If a workflow path has not been naturally exercised by Case 20, that is a product finding — not a gap to fill by introducing synthetic cases.

---
 — Founding Case 001 Integrity Review

**Date:** 2026-07-07
**Reviewer:** Antigravity Agent (independent evaluator)
**Case:** FC001 — Client FC001 / Mumbai / 2 BHK Apartment / Core Modernization
**Milestone:** Dataset v1 instrument verification

---

### Q1: Was the evidence complete?

**Answer: Partially.**

| Record | Expected | Found | Status |
|--------|----------|-------|--------|
| Lead row (`leads`) | 1 row with email, project_type, source | Captured via `submit-estimate` Edge Function | ✅ |
| Analytics event (`analytics_events`) | `contact_form_submitted` with leadId, sessionId, correlationId | Recorded via `recordLearningEvent` | ✅ |
| Commitment revision (`workspace_commitment_revisions`) | 1 row with rationale, workspace_state, decision_genome | Inserted directly via SQL (edge function path failed) | ⚠️ Partial |

**Gap:** The commitment revision was inserted via direct DB write, not via the intended `submit-workspace-commitment` edge function. The evidence is present, but the capture path used was the fallback, not the production path. This means the instrument passed a test it was not designed to pass in this configuration.

---

### Q2: Was the evidence internally consistent?

**Answer: Yes, within the fallback path.**

The `leadId` referenced in `analytics_events` matched the `lead_id` in `workspace_commitment_revisions`. The correlation chain is intact. No orphaned records were found.

**Caveat:** Internal consistency was verified structurally (FK-level). The semantic consistency (did the workspace_state accurately describe the decision made?) has not been independently verified. That is a depth-of-instrument question for a later calibration review.

---

### Q3: Was the evidence replayable (to the currently validated level)?

**Answer: Yes — State Reconstruction level only.**

State Reconstruction (Track 3, Workspace Acceptance 001) has been validated. The three identifiers (`leadId`, `commitmentId`, `revisionId`) can be used to extract all underlying variables from both ledgers via DB query.

Behavioral Replay (feeding historical state into the replay engine to reproduce the original decision) is consciously deferred pending authentic Dataset v1 vectors.

---

### Q4: Did this case expose a weakness in the instrument?

**Answer: Yes — two weaknesses.**

| ID | Weakness | Classification | Status |
|----|----------|---------------|--------|
| W-001 | `submit-workspace-commitment` edge function not reachable on remote staging (HTTP 404) | Operational Integrity — see OI-001 | Open |
| W-002 | No parent `workspace_commitments` aggregate table; append-only ledger raises query complexity question at scale | Architectural assumption — see OI-002 | Under investigation |

Neither weakness invalidates FC001's evidence. Both must be resolved before FC001's commitment record can be treated as captured via the production instrument path.

---

### DIR-001 Verdict

**Status: Accepted with Operational Deviation**

The evidence is internally consistent. Identity propagation is intact. The commitment record exists in the ledger.

The deviation: the commitment was captured via direct DB insert (fallback path), not via the intended `submit-workspace-commitment` edge function (production path). This is an instrument deviation, not a data integrity failure. The FC001 evidence is valid for analysis; it cannot be treated as demonstrating end-to-end production instrument coverage.

**Linked OI:** OI-001 (deployment drift hypothesis — must be assessed before FC002 proceeds).
**Linked PL:** PL-005 (silent data integrity fracture pattern — the system didn't fail, it deviated silently).

---

*Next review: DIR-002 after Founding Case 002*
*Cadence: Case 5 → Instrument Stability Review | Case 10 → First Calibration Review | Case 20 → Learning Baseline Report v1*

---

## Cross-Case Consistency Table

*Standing template. Filled in after each case closes. No trend analysis. Consistency check only.*

| Dimension | FC-001 | FC-002 | FC-003 | FC-004 | FC-005 |
|-----------|--------|--------|--------|--------|--------|
| Evidence completeness | Partial (fallback path) | | | | |
| Identity propagation | ✅ Intact | | | | |
| Operational deviations | 1 (OI-001, resolved) | | | | |
| Replay chain status | State Reconstruction validated; Behavioral deferred | | | | |
| Dataset classification | Accepted w/ Deviation | | | | |

*Rule: Do not read this table as a trend until Case 5 Instrument Stability Review authorizes it.*

---

## FC-002 Execution Protocol

*Standing protocol. Applies to FC-002 and, unless amended, all subsequent cases.*

**Do not change anything in the product before or during the case.**

### Evidence to collect

**Operational identifiers**
- Lead ID
- Commitment ID
- Revision ID

**Learning telemetry**
- Decision Confidence Distribution (DCD)
- Decision Quality Indicator (DQI) — provisional if applicable
- Evidence viewed / used
- Confidence score

**Governance artifacts**
- Dataset Integrity Review (DIR-002)
- Notebook entry with three mandatory fields:
  - Observation
  - Unexpected Finding (if any)
  - Open Question (if any)

### If an operational issue appears during FC-002

1. Classify it (instrument deviation / data integrity failure / external)
2. Open an OI if warranted
3. Continue if evidence quality remains acceptable
4. Do **not** stop mid-case to repair the platform

### After FC-002 closes

- Fill in the FC-002 column in the Cross-Case Consistency Table above
- No architectural review
- No hypothesis updates
- No trend analysis
- Proceed to FC-003
