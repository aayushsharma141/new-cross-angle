# Phase 14: Signal-Weighted ALCS — Summary

## One-liner
Established a rigorous behavioral invariants harness and golden regression suite for the ALCS recommendation engine.

## What Was Built

### Behavioral Invariants Harness (`verify-alcs.ts`)
- 6 behavioral tests covering: Sensory Isolation, Social Priority Isolation, Budget Dominance (+25 cap enforcement), Property Dominance, Recommendation Stability (100-run determinism), and Explainability Contract.
- All 6 tests pass cleanly.

### Regression Suite (`regression-alcs.ts`)
- Golden fixtures for 3 user archetypes (USER_A: Quiet Modernist, USER_B: Statement Host, USER_C: Budget Sensitive).
- Fixtures stored in `fixtures/` directory and version-controlled.
- Any future engine change that alters output fails regression until fixtures are explicitly updated.

### Engine Verification Findings
- `applySensoryAlignment` correctly caps bonus at +25.
- `applySocialFocus` fires correctly when `hostingFreq = "Always"` AND `mustHave` includes social rooms.
- `computeAIRecommendation` is deterministic across 100 consecutive runs.
- Evidence traces back explicitly to each evidence item in reasoning generation.

## Files Created
- `.planning/phases/14-signal-weighted-alcs/verify-alcs.ts`
- `.planning/phases/14-signal-weighted-alcs/regression-alcs.ts`
- `.planning/phases/14-signal-weighted-alcs/fixtures/golden-user-a.json`
- `.planning/phases/14-signal-weighted-alcs/fixtures/golden-user-b.json`
- `.planning/phases/14-signal-weighted-alcs/fixtures/golden-user-c.json`
- `.planning/phases/14-signal-weighted-alcs/validation/latest-user-a.json`
- `.planning/phases/14-signal-weighted-alcs/validation/latest-user-b.json`
- `.planning/phases/14-signal-weighted-alcs/validation/latest-user-c.json`

## Outcome
Phase 14 verified. All behavioral invariants and regression fixtures pass.
