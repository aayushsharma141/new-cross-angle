# Phase 15: Recommendation Explainability - Implementation Plan

## Overview
We need to surface *why* the ALCS engine arrived at its final execution path recommendation. This requires adding a transparent audit trail (`evidence[]`, `confidence`, and `primaryDrivers`) to the engine output and exposing it in the Admin Lead Detail UI.

## Task 15-01: Update Types
- **File**: `apps/web/src/addons/calculators/components/data/engines/types.ts`
- **Action**: 
  - Add `RecommendationEvidence` interface with fields `signal`, `scoreImpact`, `source`, `rationale`.
  - Extend `AIRecommendationResult` to include `confidence: number`, `evidence: RecommendationEvidence[]`, and `primaryDrivers: string[]`.

## Task 15-02: Implement Evidence Ledger in Recommendation Engine
- **File**: `apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts`
- **Action**:
  - In `scorePaths`, track the scoring contributions for the *winning* path.
  - Or better: Calculate path scores as a collection of evidence objects (e.g., instead of just `score += 15`, we do `pathScores[path].push({ signal: 'Material-first luxury language', scoreImpact: 15, source: 'sensory' })`), then sum them to find the winner.
  - Once the winning path is found, extract its evidence array.
  - Sort the evidence array by absolute `scoreImpact` descending.
  - Pick the top 3 positive drivers for `primaryDrivers` (e.g. converting "Material-first luxury language" -> "Material Quality").

## Task 15-03: Implement Confidence Scoring
- **File**: `apps/web/src/addons/calculators/components/data/engines/ai-recommendation.ts`
- **Action**:
  - Calculate `confidence` out of 100%. 
  - Base confidence = 70%.
  - Add +10% if `discoveryHandoff` has strong sensory data.
  - Add +10% if `discoveryHandoff` has high emotional weights filled out.
  - Subtract up to 20% based on `feasibilityConflicts` (e.g., budget_vs_sensory mismatch).
  - Return this as part of `AIRecommendationResult`.

## Task 15-04: Update Admin CRM UI
- **File**: `apps/web/src/pages/admin/AdminEstimateLeads.tsx`
- **Action**:
  - In the Lead Details slide-over, locate the "Recommendation" display section (where it currently says "Recommended Path: ...").
  - Add a collapsible or nested section labeled "Why this recommendation?".
  - Render the `evidence` items dynamically, showing positive impacts in green (e.g. `+15`) and negative impacts in red (e.g. `-4`).
  - Render the `Confidence` percentage cleanly.
  - Render the `Primary Drivers` list.

## Task 15-05: Verification
- **File**: `test-alcs.ts` (recreate temporarily) or browser review.
- **Action**: 
  - Validate that typescript passes.
  - Validate that mock vectors generate valid evidence arrays and confidence metrics.
  - Review in browser (Admin panel) to ensure it's beautifully rendered for the sales team.
