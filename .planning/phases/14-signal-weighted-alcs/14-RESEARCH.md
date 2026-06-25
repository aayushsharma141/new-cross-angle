# Phase 14: Signal-Weighted ALCS — Research

## Architectural Context
The ALCS recommendation engine (`ai-recommendation.ts`) is designed to synthesize data from all sub-engines (property, density, conflicts, investment, simulation, etc.) and generate a coherent strategy recommendation.

During my research into the codebase, I discovered that **the core logic for Phase 14 is already implemented** in `ai-recommendation.ts`.

Specifically:
1. **Sensory Alignment**: The `applySensoryAlignment()` function already exists and handles `luxuryResolvedAs`, `lighting`, and `textures` perfectly, capping the bonus at 25 points.
2. **Social Focus**: The `applySocialFocus()` function already processes `priorities.emotionalWeights` to detect "socialFocus" and boosts the `hero_space` strategy by up to 10 points.
3. **Reasoning Text**: `buildSensoryClause()` and `generateReasoning()` correctly embed the sensory characteristics into the AI output explanation.

## Execution Requirements
Since the implementation is already present in the codebase, the plan for Phase 14 should focus strictly on **Validation and Verification**:
1. **Test Vectors**: We must implement unit tests to verify the two success criteria vectors (User A vs. User B) described in the Phase 14 context.
2. **Regression Check**: We must verify that no other ALCS outputs are broken and existing tests pass.

## Relevant Files
- `apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` (Implementation - completed)
- `apps/web/src/addons/calculators/components/data/discovery-handoff.ts` (Types - completed)
- Testing framework files to create unit tests.
