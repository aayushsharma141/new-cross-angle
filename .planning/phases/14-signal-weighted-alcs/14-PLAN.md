---
phase: 14
name: Signal-Weighted ALCS
wave: 1
depends_on: []
files_modified:
  - apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts
autonomous: true
---

# Phase 14 Plan: Signal-Weighted ALCS

## Goal

Wire `sensory.*` and `priorities.emotionalWeights` from `DiscoveryHandoff` into ALCS path scoring and reasoning generation, so two users with the same archetype but different sensory profiles receive meaningfully different execution path recommendations and reasoning text.

## must_haves
- [ ] `scorePaths()` produces different top-ranked path for User A (Natural Light + Organic + invest-in-materials) vs User B (Dramatic + Minimal + invest-in-tech) OR different score by ≥ 10 points. If outcomes are identical, phase fails.
- [ ] `generateReasoning()` output includes at least one sensory-specific sentence not present before this change
- [ ] `npx tsc --noEmit --project apps/web/tsconfig.json` exits with code 0
- [ ] No changes to any other ALCS engine files (lifestyle-density, space-allocation, feasibility-conflict, investment-reality, reality-simulation, existing-property, blueprint-generator, orchestrator)

---

## Tasks

<task id="14-01">
<title>Add scoreSensoryAlignment and scoreSocialFocus helpers to ai-recommendation.ts</title>
<wave>1</wave>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts (entire file — read before touching; understand existing scorePaths structure)
- apps/web/src/addons/calculators/components/data/discovery-handoff.ts (DiscoveryHandoff.sensory and .priorities types — confirm exact field names before writing)
</read_first>
<action>
Add two new pure helper functions ABOVE the `scorePaths` function:

1. `scoreSensoryAlignment(handoff: DiscoveryHandoff, path: ExecutionPath): number`
   - luxuryResolvedAs === "invest-in-materials" → full_premium +15, hero_space +12
   - luxuryResolvedAs === "invest-in-tech" → smart_renovation +15
   - luxuryResolvedAs === "invest-in-space" → phased_evolution +12
   - luxuryResolvedAs === "balanced" → smart_renovation +8
   - lighting === "natural" → full_premium +8
   - lighting === "dramatic" → full_premium +10, hero_space +5
   - lighting === "warm" → hero_space +5
   - textures.includes("organic") → hero_space +5, full_premium +3
   - textures.includes("textural") || textures.includes("layered") → full_premium +4
   - textures.includes("minimal") → smart_renovation +5
   - Return the sum of matched bonuses, capped at a maximum of +25 (e.g. `Math.min(bonus, 25)`).

2. `scoreSocialFocus(priorities: DiscoveryHandoff["priorities"]): number`
   - Sum emotionalWeights for keys: "Living Room", "Dining", "Entertainment" (case-insensitive lookup)
   - Normalize to 0–100 by dividing by 3.0 (max weight per key is 1.0, max total is 3.0)
   - Return Math.round(normalized * 100)

In `scorePaths`, for each path being pushed, add `scoreSensoryAlignment(ctx.handoff, pathKey)` to its base score. For the `hero_space` path specifically, also add `(scoreSocialFocus(ctx.handoff.priorities) > 60 ? 10 : 0)`.

Add a JSDoc comment at the top of `scoreSensoryAlignment` documenting expected User A vs User B score differentials:
```
// Test vectors:
// User A (invest-in-materials, natural, organic): full_premium bonus = +15 +8 +3 = +26
// User B (invest-in-tech, dramatic, minimal): smart_renovation bonus = +15; full_premium bonus = +10
// → User A full_premium score is at least 16 points higher than User B full_premium score
```
</action>
<acceptance_criteria>
- `grep -c "scoreSensoryAlignment" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns ≥ 5 (definition + 4 path calls)
- `grep -c "scoreSocialFocus" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns ≥ 2 (definition + hero_space call)
- `grep "invest-in-materials" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
- `grep "invest-in-tech" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
- No changes to any file other than ai-recommendation.ts
</acceptance_criteria>
</task>

<task id="14-02">
<title>Add buildSensoryClause helper and wire into generateReasoning()</title>
<wave>1</wave>
<depends_on>14-01</depends_on>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts (lines 90–117, the generateReasoning function — read the exact current string construction before changing)
- apps/web/src/addons/calculators/components/data/discovery-handoff.ts (DiscoveryHandoff.sensory interface — confirm field names)
</read_first>
<action>
Add `buildSensoryClause(handoff: DiscoveryHandoff): string` ABOVE `generateReasoning`. Priority order (first match wins, returns empty string if none match):

1. luxuryResolvedAs === "invest-in-materials" → `"your luxury language centers on material quality — natural stone, solid wood, and premium textiles"`
2. luxuryResolvedAs === "invest-in-tech" → `"your luxury language centers on smart integration — automated systems and invisible tech"`
3. lighting === "natural" → `"your preference for natural light makes open-plan spaces with deep fenestration the highest-ROI investment"`
4. lighting === "dramatic" → `"your preference for statement lighting makes curated pendant and architectural lighting the defining design investment"`
5. textures includes "organic" → `"your preference for organic textures calls for natural wood grain, stone, and linen in the hero spaces"`

In `generateReasoning`, call `const sensoryClause = buildSensoryClause(ctx.handoff)` at the top of the function. In each `switch` case return statement, append `${sensoryClause ? ` and ${sensoryClause}` : ""}` before the closing period.

Example result for full_premium case:
`"Because your family lifestyle prioritizes social connection and daily cooking — and your luxury language centers on material quality — natural stone, solid wood, and premium textiles — a comprehensive execution delivers maximum emotional return."`
</action>
<acceptance_criteria>
- `grep -c "buildSensoryClause" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns ≥ 2 (definition + call)
- `grep "material quality" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
- `grep "natural light" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
- `grep "statement lighting" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
- `grep "smart integration" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` returns at least one line
</acceptance_criteria>
</task>

<task id="14-03">
<title>TypeScript compile check and type error resolution</title>
<wave>2</wave>
<depends_on>14-01, 14-02</depends_on>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts (full final state after 14-01 and 14-02)
- apps/web/src/addons/calculators/components/data/engines/types.ts (ExecutionPath type — confirm it is already imported)
</read_first>
<action>
Run `npx tsc --noEmit --project apps/web/tsconfig.json` from the project root `c:\Users\aayus\Desktop\main`. If errors exist, fix them in ai-recommendation.ts only.

Common issues to watch for:
- `ExecutionPath` must be imported at the top (it likely is — verify before adding a duplicate import)
- `DiscoveryHandoff` must be imported (already imported in the existing file)
- `handoff.sensory.textures` is `string[]` — `.includes()` is valid, no cast needed
- `handoff.priorities.emotionalWeights` is `Record<string, number>` — access via bracket notation `[key]` with `?? 0` fallback
</action>
<acceptance_criteria>
- `npx tsc --noEmit --project apps/web/tsconfig.json` exits with code 0
- Zero TypeScript errors in the output
</acceptance_criteria>
</task>

<task id="14-04">
<title>Automated A/B Test Vector Verification</title>
<wave>2</wave>
<depends_on>14-03</depends_on>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/orchestrator.ts
</read_first>
<action>
Create a temporary script `test-alcs.ts` in the project root. The script should instantiate User A (natural light, organic, invest-in-materials) and User B (dramatic, minimal, invest-in-tech) with identical archetypes and budgets.
Run the ALCS orchestrator pipeline (`runALCSPipeline` or similar) for both users.
Assert that the resulting `topPath` differs between User A and User B, OR `Math.abs(resultA.topScore - resultB.topScore) >= 10`.
Execute the script using `npx tsx test-alcs.ts` (or `npx ts-node` or compile and run). Ensure the script passes the assertion.
If it fails, the phase logic must be adjusted to ensure the engine output is actually different.
After verification passes, the temporary script can be deleted.
</action>
<acceptance_criteria>
- A script is written to execute the test vectors
- The script passes its assertion, proving the outcome (top recommendation or score difference) is functionally changed by the new signals
</acceptance_criteria>
</task>

<task id="14-05">
<title>Regression check — no other engine files modified</title>
<wave>3</wave>
<depends_on>14-04</depends_on>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts (final state)
</read_first>
<action>
Run `git diff --name-only` to confirm only `ai-recommendation.ts` appears as modified. If any other engine file appears modified, revert it with `git checkout -- <file>`.

Then verify the sensory signals are live by checking the grep counts match expectations.
</action>
<acceptance_criteria>
- `git diff --name-only` shows ONLY `apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts`
- `grep -c "scoreSensoryAlignment" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` ≥ 5
- `grep -c "buildSensoryClause" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` ≥ 2
</acceptance_criteria>
</task>

---

## Verification

```bash
# 1. TypeScript check
npx tsc --noEmit --project apps/web/tsconfig.json
# Expected: exit code 0, no output

# 2. Sensory scoring present
grep -c "scoreSensoryAlignment" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts
# Expected: ≥ 5

# 3. Reasoning clause present
grep -c "buildSensoryClause" apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts
# Expected: ≥ 2

# 4. Only one file changed
git diff --name-only
# Expected: apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts
```

## Threat Model

**Risk: Over-weighting sensory breaks existing path rankings for users without Discovery data**
- Mitigation: All sensory bonuses are additive, but now explicitly capped at +25 per path. Existing base scores remain unchanged. Users without `sensory.*` data (direct estimator) produce zero bonus — no regression.

**Risk: emotionalWeights keys don't match room names exactly**
- Mitigation: Use `Object.entries(priorities.emotionalWeights).find(([k]) => k.toLowerCase().includes("living"))` pattern for fuzzy key matching.
