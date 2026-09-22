# Change Governance v1.0

> **The purpose of Crossangle is not to maximize AI agreement or recommendation acceptance. Its purpose is to improve professional decision quality. Every algorithm, metric, and interface change must be evaluated against that objective.**

This document describes **how the system is allowed to evolve**. It establishes the scientific discipline required to ensure that improvements are real, measurable, and aligned with professional decision quality.

## Core Architectural Properties
The architecture must always preserve three properties:
1. **Reproducibility** — The ability to replay exactly how a decision was made.
2. **Traceability** — The ability to explain why it was made.
3. **Falsifiability** — The ability to prove when a hypothesis was wrong.

## Prioritized Preservation List
If priorities compete during operation or development, they must be preserved in this order:
1. **Data integrity** — Never compromise the quality of the evidence.
2. **Replayability** — Never lose the ability to reconstruct historical decisions.
3. **Comparability** — Keep versioned baselines so improvements are measurable.
4. **Interpretability** — Make every important metric explainable.
5. **Feature velocity** — Only after the first four are protected.

---

## 1. Levels of Change
Every modification falls into one category.

| Level | Examples                                                | Requires                                     |
| ----- | ------------------------------------------------------- | -------------------------------------------- |
| L1    | UI copy, styling, non-learning UX                       | Normal review                                |
| L2    | Analytics fields, event additions                       | Analytics review                             |
| L3    | Recommendation logic, Genome weights, DQI formula       | Calibration review + replay validation       |
| L4    | Ledger schema, Founding Case rules, core specifications | New versioned specification + migration plan |

## 2. Promotion Criteria
A recommendation engine version cannot become production simply because it "looks better." It requires objective evidence:
- Replay benchmark passes
- No regression against Dataset v1
- DQI calibration maintained or improved
- Expert agreement not reduced
- Telemetry completeness maintained

*If any fail: Do not promote.*

## 3. Immutable Baselines
Never overwrite these. Every future experiment compares against them:
- Dataset v1
- DQI v1
- DCD v1
- Analytics v1
- Decision Ledger v1

## 4. Experiment Registry
Every experiment receives a structured record:
- **Experiment ID**
- **Hypothesis**
- **Expected improvement**
- **Dataset**
- **Algorithm Version**
- **Result**
- **Decision**

## 5. Rollback Policy
Every release must answer: *"If this performs worse, how do we revert?"*
That includes:
- Algorithm rollback
- Schema compatibility
- Analytics compatibility
- Replay compatibility

## 6. Sunset Rules
Define when a metric or feature can be retired:
- Metric unused for six months
- Replaced by versioned successor
- Historical interpretation preserved

## 7. Evidence Hierarchy
When sources conflict, higher levels win:
1. Completed project outcomes
2. Expert calibration reviews
3. Client acceptance
4. Designer behavior
5. Clickstream analytics

## 8. Decision Log
Maintain a concise architectural log. Example format:
```text
YYYY-MM-DD
Decision [ID]
[Title]
Reason: [Context]
Expected Impact: [Impact]
```

## 9. Cultural Rule: Investigation Over Implementation
Every surprising result must be investigated before it is fixed. If DQI decreases, designers ignore recommendations, or experts disagree with the AI, the instinct to "just improve the algorithm" must be blocked.

Instead, require this sequence:
`Observe → Verify → Explain → Hypothesize → Experiment → Deploy`

Never skip directly from observation to implementation. This single discipline prevents years of accumulated technical debt disguised as "continuous improvement."
