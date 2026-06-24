# Phase 14: Signal-Weighted ALCS — Context

**Gathered:** 2026-06-25
**Status:** Ready for planning
**Source:** Discuss-phase (inline — full context from audit session)

<domain>
## Phase Boundary

This phase modifies the ALCS recommendation engine (`ai-recommendation.ts`) to incorporate `sensory.*` and `priorities.emotionalWeights` from the `DiscoveryHandoff` into:

1. **Path scoring** — `scorePaths()` adds a `sensoryAlignment` bonus/penalty per execution path
2. **Reasoning text** — `generateReasoning()` includes at least one sensory-specific sentence

No new UI surfaces. No DB changes. No new API routes. Pure engine logic change in two functions within a single file.

The `types.ts` file may need a minor addition if the `AIRecommendationResult` type needs a new field, but that is the maximum scope.

</domain>

<decisions>
## Implementation Decisions

### Engine Scope
- Only `ai-recommendation.ts` is modified (scorePaths, generateReasoning, generateSummary)
- `types.ts` updated only if a new field is needed on `AIRecommendationResult`
- All other 9 ALCS engines are read-only (no changes)

### Sensory Scoring Logic

`luxuryResolvedAs` is the highest-signal field:
- `"invest-in-materials"` → strong boost to `full_premium` (+15) and `hero_space` (+12)
- `"invest-in-tech"` → strong boost to `smart_renovation` (+15, tech-optimized renovation)
- `"invest-in-space"` → boost to `phased_evolution` (+12, space expansion via phasing)
- `"balanced"` → modest boost to `smart_renovation` (+8)

`lighting` is the second signal:
- `"natural"` → boost `full_premium` (+8, worth investing in fenestration/glazing)
- `"dramatic"` → boost `full_premium` (+10, dramatic lighting = premium spec)
- `"warm"` → boost `hero_space` (+5, warm lighting zones = hero space focus)
- `"cool"` → neutral (no strong path preference)

`textures` contribution:
- Contains `"organic"` → boost `hero_space` (+5) and `full_premium` (+3)
- Contains `"textural"` or `"layered"` → full_premium (+4)
- Contains `"minimal"` → boost `smart_renovation` (+5, clean finishes = renovation scope)

**IMPORTANT Capping Rule:** The total sensory bonus calculated for any single path MUST be capped at a maximum of `+25` (e.g., `Math.min(bonus, 25)`). This prevents the discovery sensory signals from overpowering the other 9 ALCS reality layer engines (like budget, feasibility, property constraints).

### emotionalWeights in Scoring

`priorities.emotionalWeights` is a `Record<string, number>` (0–1 weight per room name).

The sum of weights for social rooms (Living Room, Dining, Entertainment) normalized to 0–100 creates a `socialFocus` score. High socialFocus (+60) boosts `hero_space` score by up to +10.

### Reasoning Language

Add a `sensoryClause` to the reasoning string based on the top sensory signal:

```
lighting=natural → "your preference for natural light makes open-plan spaces with deep fenestration the highest-ROI investment"
lighting=dramatic → "your preference for statement lighting makes curated pendant and architectural lighting the defining design investment"
luxuryResolvedAs=invest-in-materials → "your luxury language centers on material quality — natural stone, solid wood, and premium textiles over gadgetry"
luxuryResolvedAs=invest-in-tech → "your luxury language centers on smart integration — automated systems, motorized shading, and invisible tech"
textures=[organic] → "your preference for organic textures calls for natural wood grain, stone, and linen in the hero spaces"
```

The `generateReasoning()` function appends ONE sensory clause (highest confidence signal) to the existing lifestyle-trait string.

### Regression Safety

All 9 other ALCS engine functions are pure and untouched. The only file modified with logic changes is `ai-recommendation.ts`.

The two test vectors (User A: Natural Light + Organic + Quiet Retreat vs User B: Statement Lighting + Luxury Hosting) must produce:
- Different top-ranked path in `scorePaths()` OR different top path score differential >= 10 points. If they both return the exact same top recommendation and score after implementation, the phase fails.

Success is measured by the engine outcome, not just the reasoning string text.

### the agent's Discretion

- Exact scoring coefficient values (within the ranges specified above) — tune for natural differentiation without over-weighting
- How to break ties in `scorePaths()` if sensory delta is small — no change needed, existing sort is stable
- Whether `generateSummary()` needs sensory language — optional, only if it improves clarity

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ALCS Engine (Primary Target)
- `apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts` — THE file being modified; read entirely before touching
- `apps/web/src/addons/calculators/components/data/engines/types.ts` — AIRecommendationResult type; read before any type changes
- `apps/web/src/addons/calculators/components/data/discovery-handoff.ts` — DiscoveryHandoff interface; `sensory.*` and `priorities.emotionalWeights` live here

### Supporting Engines (Read-only — for regression awareness)
- `apps/web/src/addons/calculators/components/data/engines/lifestyle-density.ts` — Pattern for dimension scoring (0–100 range, Math.min caps)
- `apps/web/src/addons/calculators/components/data/engines/orchestrator.ts` — How all engines are chained; EngineContext is assembled here

### Type Contracts
- `apps/web/src/addons/calculators/components/data/engines/types.ts` — All engine result types; do not change `LifestyleDensityResult`, `FeasibilityConflictResult`, etc.

</canonical_refs>

<specifics>
## Specific Ideas

### Test Vectors (Success Criteria Verification)

**User A — Quiet Modernist:**
```typescript
const userA: DiscoveryHandoff = {
  archetype: "The Warm Modernist",
  sensory: {
    lighting: "natural",
    luxuryResolvedAs: "invest-in-materials",
    textures: ["organic", "textural"],
    colors: ["warm white", "sand"]
  },
  lifestyle: { hostingFreq: "Sometimes", members: 3, children: 1, workFromHome: true, ... }
}
```

**User B — Statement Host:**
```typescript
const userB: DiscoveryHandoff = {
  archetype: "The Warm Modernist",  // SAME archetype
  sensory: {
    lighting: "dramatic",
    luxuryResolvedAs: "invest-in-tech",
    textures: ["minimal", "sleek"],
    colors: ["black", "chrome"]
  },
  lifestyle: { hostingFreq: "Always", members: 2, children: 0, workFromHome: false, ... }
}
```

Expected: User A → `full_premium` (materials + natural light bonus), User B → `smart_renovation` (invest-in-tech bonus) or `hero_space` (dramatic lighting + always hosting).

### Reasoning Output Examples

**User A reasoning (target):**
> "Because your family lifestyle prioritizes emotional decompression and productive home working, and your preference for natural light makes open-plan spaces with deep fenestration the highest-ROI investment — a comprehensive execution delivers maximum emotional return."

**User B reasoning (target):**
> "Because your lifestyle prioritizes social connection and your luxury language centers on smart integration — automated systems and invisible tech — a hero space strategy concentrates premium quality in the entertaining zones where you'll experience it daily."

</specifics>

<deferred>
## Deferred Ideas

- Exposing the `sensoryAlignment` sub-score in the UI (deferred to Phase 15 — explainability)
- Adding sensory weights to other engines like `computePropertySuitability` (deferred — diminishing returns, keep engines focused)
- A/B testing different coefficient values (deferred — needs analytics instrumentation first)

</deferred>

---

*Phase: 14-signal-weighted-alcs*
*Context gathered: 2026-06-25 via inline discuss-phase (audit session)*
