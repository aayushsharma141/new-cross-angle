# Founding Cases v1.0

This specification defines the rigorous criteria required for a project to be recorded as a "Founding Case" for the Learning Engine. Founding Cases serve as the ground truth dataset for calibrating the Decision Quality Index (DQI) and Designer Confidence Delta (DCD).

## Minimum Required Telemetry
To qualify as a Founding Case, the following analytics events MUST be successfully recorded with no validation errors:
- `designer.confidence.pre`
- `workspace.commitment.locked` (with full snapshot payload)
- `designer.confidence.post`
- `outcome.learning_locked`

## Case Lifecycle
1. **Draft**: The workspace is active. Evidence is being reviewed and recommendations generated.
2. **Commitment**: The designer locks the commitment (`workspace.commitment.locked`). The system calculates Provisional DQI and captures the Decision Genome snapshot.
3. **Outcome-Adjusted**: The client accepts, rejects, or modifies the proposal (`outcome.client_accepted`, `outcome.client_rejected`, etc.). DQI is outcome-adjusted.
4. **Complete (Locked)**: The project finishes. Post-project designer and client satisfaction scores are recorded. The case becomes a Validated Founding Case.

## Required Completeness
- **Evidence**: At least 3 pieces of evidence must be available, and at least 1 piece must be used/referenced in the commitment (avoiding `LOW` confidence DQI).
- **Explainability**: The designer must have opened the AI explainability or genome reasoning at least once during the session.
- **Outcome Fields**: Final client decision (Accept/Reject/Modify), final budget, and final scope must be recorded.

## Allowed Missing Data
- `designerExperienceLevel` (if not supplied by user profile)
- `outcome.client_satisfaction` (if client is unresponsive post-project, the case can still be locked with designer outcomes)

## Calibration Review
Every 10-20 cases must undergo a structured human review answering:
1. Would an experienced designer make the same decision?
2. Was the evidence sufficient?
3. Did DQI align with expert judgment?
4. Was confidence appropriately calibrated?
5. Did the recommendation help or distract?

## Dataset Versioning
Founding Cases will be grouped into versioned datasets for algorithm calibration:
- **Dataset v1**: Cases 1–20
- **Dataset v2**: Cases 21–50
- **Dataset v3**: Cases 51–100

*Any changes to the DQI algorithm or recommendation engine must be evaluated against a locked dataset version to prevent benchmark drift.*

## Dataset v1 Operating Rules
During the collection of Dataset v1 (Cases 1-20), the following rules apply to system modifications:
- **✅ Allowed**: Bug fixes that preserve intended behavior.
- **✅ Allowed**: Operational fixes (logging, monitoring, reliability).
- **❌ Deferred**: Any change that could influence designer decisions, DQI, DCD, or recommendation behavior. These must wait until Dataset v1 is closed.

## Learning Baseline Report v1
After the 20th validated case, a `Learning Baseline Report v1` will be produced to evaluate the system. It must include the **Hypothesis Stability Index (HSI)** for every hypothesis, detailing:
- Evidence Supporting
- Evidence Contradicting
- Confidence Level
- Status (Supported / Challenged / Inconclusive)

The report must structurally address:
1. **Dataset Quality**: Completeness and systematic gaps.
2. **Hypothesis Evaluation**: Final HSI statuses.
3. **Metric Calibration**: DCD/DQI behavior and predictive power.
4. **Decision Patterns**: Alignment/divergence and influential evidence.
5. **Operational Findings**: Instrumentation, replay fidelity, friction.
6. **Dataset v2 Plan**: Exactly three prioritized experiments (no speculative redesigns or feature backlogs).
