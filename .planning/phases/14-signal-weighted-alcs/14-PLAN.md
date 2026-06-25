# Phase 14: Signal-Weighted ALCS — Implementation Plan

## Phase Goal
Transform the Phase 14 ALCS engine implementation from a feature test into a robust **test contract**. Since the core logic already exists (`ai-recommendation.ts`), this phase establishes a strict verification harness and regression suite that protects the recommendation engine against undocumented behavioral changes and future logic drift.

## Step 1: Verification Harness (Behavioral Tests)
**Task:** Create a dedicated script to verify algorithmic correctness and behavioral invariants.
**File:** `.planning/phases/14-signal-weighted-alcs/verify-alcs.ts`
**Action:**
- Implement a `BASE_CONTEXT` fixture.
- Define specific test variants: `USER_A` (Quiet Modernist), `USER_B` (Statement Host), `USER_C` (Budget Sensitive), `USER_D` (Luxury Materials), `USER_E` (Tech Forward), `USER_F` (Family First).
- **Test Behavioral Invariants:**
  1. **Sensory Isolation:** Vary only `lighting`, `textures`, and `luxuryResolvedAs`. Ensure recommendation changes or score delta exceeds a threshold.
  2. **Social Priority Isolation:** Vary only social factors (`hosting`, etc.). Ensure `scoreSocialFocus` applies the correct weighting.
  3. **Budget Dominance:** Maximize sensory score but minimize budget. Ensure the budget penalty dominates the sensory bonus.
  4. **Property Dominance:** Maximize sensory score but minimize property suitability. Ensure recommendation does not upgrade to Premium.
  5. **Recommendation Stability:** Execute 100 times to verify exact same recommendation, confidence, and reasoning (no randomness).
- **Test Score Invariants:** Assert intermediate engine scores directly to isolate failures (e.g., `scoreSensoryAlignment`, `scoreSocialFocus`, `scoreBudgetConstraint`).
- **Explainability Contract:** Assert that every reasoning clause dynamically maps back to a specific evidence object with its corresponding score and source.

## Step 2: Regression Suite (Golden Fixtures)
**Task:** Create a secondary script to protect against future drift.
**File:** `.planning/phases/14-signal-weighted-alcs/regression-alcs.ts`
**Action:**
- Generate golden JSON output files (`golden-user-a.json`, etc.) in the `fixtures/` directory based on the initial successful runs.
- The `regression-alcs.ts` script strictly compares current engine output against these golden fixtures. Any deviation must fail the build until manually approved and the golden fixture is updated.

## Step 3: Execute & Generate Validation Report
**Task:** Run the suites and document the contract proof.
**Action:**
- Output detailed reports in `validation/latest-run.json`.
- Structure `14-VALIDATION.md` to clearly show `Input → Score Breakdown → Winning Path → Confidence → Evidence → Reasoning → Assertions` for every fixture.

## Phase Deliverables
```text
14-CONTEXT.md
14-PLAN.md
verify-alcs.ts
regression-alcs.ts
fixtures/
    baseline.json
    user-a.json
    ...
    golden-user-a.json
validation/
    latest-run.json
14-VALIDATION.md
14-SUMMARY.md
```

## Acceptance Criteria
- [ ] Identical inputs always produce identical outputs.
- [ ] Sensory signals influence recommendations but never override budget or property constraints.
- [ ] Every reasoning paragraph references at least one dominant signal that contributed to scoring.
- [ ] Any future change to `ai-recommendation.ts` that alters a golden fixture fails regression until explicitly approved.
- [ ] Every scoring function is independently verified.
- [ ] Every reasoning clause maps to an evidence item.
- [ ] Regression fixtures are version-controlled.
- [ ] No hidden randomness exists anywhere in ALCS.
- [ ] Every failing assertion identifies the exact scoring function responsible.
