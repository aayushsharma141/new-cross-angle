# Decision Quality Index (DQI) v1.0

Measures evidence-backed decision quality, actively preventing "blind obedience" from being scored as success. This is the North Star metric.

## Version
- `dqiAlgorithmVersion`: 1.0

## Stages
- **Provisional DQI**: Immediately after lock.
- **Outcome-adjusted DQI**: After client response.
- **Validated DQI**: After project completion.

## Confidence
- **LOW**: Sparse evidence (e.g. `evidenceAvailable < 4` or `evidenceUsed == 0`)
- **MEDIUM**: Moderate evidence (e.g. `evidenceAvailable >= 4` and `evidenceUsed >= 1`)
- **HIGH**: Strong evidence (e.g. `evidenceAvailable >= 8` and `evidenceUsed >= 3`)

## Workspace Phase Calculation
- **Evidence Utilization** (40%): `evidenceUsed / Math.max(1, evidenceAvailable)`
- **Genome Confidence** (30%): The AI's confidence in the baseline recommendation.
- **Explainability / Deliberation** (30%): How much the designer explored the reasoning.

## Validity Rules
*Valid only if:*
- Lead reached the final commitment phase.
- Recommendation Engine successfully generated a proposal.
- System recorded a `workspace.commitment.locked` event.
- `workspace.commitment.locked` includes `revisionId`, `designerConfidence`, and `confidenceDrivers`.

*Invalid if:*
- Proposal was fully overridden without providing an enum `overrideReason` (system considers this incomplete evidence).
- Technical constraint blocked rendering (via `system.error`).
- `timeToDecisionMs` < 30ms (automated/duplicate trigger).
