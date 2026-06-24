---
wave: 1
depends_on: []
files_modified:
  - apps/web/src/addons/calculators/components/data/engines/conversation-strategy.ts
  - apps/web/src/addons/calculators/components/data/engines/risk-cards.ts
autonomous: true
requirements:
  - INTEL-06
  - INTEL-07
---

# Plan 2: Intelligence Engines for Workspace

<objective>
Build deterministic, rule-based Strategy and Risk engines to power the intelligence blocks in the Workspace, extending the patterns from the Designer Brief generator.
</objective>

<must_haves>
- [ ] Strategy Engine must produce discrete blocks (hook, conversation order, topics to explore/avoid, visual references).
- [ ] Risk Engine must produce exactly 3 risk cards ranked by business impact.
- [ ] Outputs must be deterministic without autonomous LLM decision generation.
</must_haves>

<task>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/brief-generator.ts
- .planning/phases/17-project-intelligence-workspace/17-CONTEXT.md
</read_first>
<action>
Create `apps/web/src/addons/calculators/components/data/engines/conversation-strategy.ts`.
Implement `generateConversationStrategy(leadData)` that evaluates `discovery_archetype` and `sensory` signals to output an array of `StrategyBlock` objects.
Each block must include: `id`, `type` (hook, order, explore, avoid, visual), `content`, `confidence`, and `evidence` (string linking back to the driving signals).
</action>
<acceptance_criteria>
- `conversation-strategy.ts` exports `generateConversationStrategy`.
- The returned data structure matches the `StrategyBlock` requirement exactly.
</acceptance_criteria>
</task>

<task>
<read_first>
- apps/web/src/addons/calculators/components/data/engines/conversation-strategy.ts
- .planning/phases/17-project-intelligence-workspace/17-CONTEXT.md
</read_first>
<action>
Create `apps/web/src/addons/calculators/components/data/engines/risk-cards.ts`.
Implement `generateRiskCards(leadData)` that evaluates the lead's archetype, budget, timeline, and property details.
Return up to 3 `RiskCard` objects ranked by business impact.
Each card must include: `id`, `headline`, `why` (evidence), `earlySignals`, `recommendedResponse`, `confidence`, and `successIndicator`.
</action>
<acceptance_criteria>
- `risk-cards.ts` exports `generateRiskCards`.
- Returns an array of maximum 3 cards with the required properties.
</acceptance_criteria>
</task>
