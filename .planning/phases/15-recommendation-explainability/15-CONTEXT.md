# Phase 15: Recommendation Explainability

## 1. Intent
The current ALCS recommendation engine effectively computes the best execution path by weighing reality against discovery signals. However, the resulting `AIRecommendationResult` is opaque. The CRM user sees *what* path was chosen, but they do not see *why* the math favored it. 

To bridge the gap between "machine intelligence" and "human sales value," we need to add explainability (traceability) to the recommendation. This allows a designer or salesperson to look at an estimate and immediately understand the specific drivers behind the proposed strategy. 

## 2. Success Criteria
1. **Traceable Results**: Every `AIRecommendationResult` object must contain an `evidence[]` array with at least 3 `RecommendationEvidence` entries detailing specific scoring impacts (e.g., `+15 Material-first luxury language`).
2. **Confidence Metric**: `AIRecommendationResult` must include a computed `confidence` score (0-100%).
3. **Primary Drivers**: `AIRecommendationResult` must extract the top 3 `primaryDrivers` from the evidence array.
4. **UI Integration**: The CRM Lead Detail drawer (`AdminEstimateLeads.tsx`) must expose a collapsible "Why this recommendation?" section listing the evidence items, confidence, and primary drivers.
5. **Diverse Evidence**: Evidence entries must not be generic; they should specifically source from sensory, lifestyle, property, and archetype dimensions.

## 3. The Core Challenge
Currently, `ai-recommendation.ts` tallies up bonuses and penalties per path but doesn't maintain a ledger of *why* those scores were added. We need to introduce an evidence-gathering mechanism inside `scorePaths` that captures the delta events and attributes them to human-readable signals.

## 4. Current State vs Target State
**Before Phase 15:**
```json
{
  "executionPath": "full_premium",
  "reasoning": "Because your family lifestyle prioritizes...",
  "summary": "Full execution prioritizing high-ROI zones."
}
```

**After Phase 15:**
```json
{
  "executionPath": "full_premium",
  "reasoning": "Because your family lifestyle prioritizes...",
  "summary": "Full execution prioritizing high-ROI zones.",
  "confidence": 87,
  "evidence": [
    { "signal": "Material-first luxury language", "scoreImpact": 15, "source": "sensory", "rationale": "Matches Full Premium execution model." },
    { "signal": "Natural light preference", "scoreImpact": 8, "source": "sensory", "rationale": "High impact for spatial expansion." },
    { "signal": "Work-from-home requirement", "scoreImpact": 6, "source": "lifestyle", "rationale": "Requires dedicated focused space." },
    { "signal": "Budget pressure", "scoreImpact": -4, "source": "budget", "rationale": "Underfunded relative to city benchmark." }
  ],
  "primaryDrivers": ["Material Quality", "Natural Light", "Home Working"]
}
```

## 5. Next Actions
- Update `types.ts` to include `RecommendationEvidence` and extend `AIRecommendationResult`.
- Refactor `ai-recommendation.ts` to collect evidence tokens during scoring.
- Compute the `confidence` score based on data density and conflict magnitude.
- Extract `primaryDrivers`.
- Update `AdminEstimateLeads.tsx` to render the explainability breakdown.
