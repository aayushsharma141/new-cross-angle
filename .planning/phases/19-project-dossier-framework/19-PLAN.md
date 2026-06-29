# Phase 19: Project Dossier Framework (Phase A2)

**Goal:** Mount placeholder cards into the Dossier (`ProjectDossierPanel.tsx`) and connect them to the global state store. Do not add complex intelligence/calculation logic yet (that happens in Phase C/D).

## Overview
The dossier acts as the live feedback column. We have previously established its structural position. We now need to populate it with the 4 key cards: EstimateCard, BlueprintCard, CostBreakdownCard, and RecommendationCard. 

## Steps
### Step 1: Implement the ProjectDossierPanel
- Update `ProjectDossierPanel.tsx` to include the `EstimateCard`, `BlueprintCard`, `CostBreakdownCard`, and `RecommendationCard`.
- Pass the current `formData` from the global `CostEstimator` component down to the panel.
- Ensure the cards are visually styled according to the reference sample (white/cream backgrounds, minimal aesthetic, premium iconography).

### Step 2: Wire Basic State
- **EstimateCard**: Show a "Calculating..." or static mocked range (e.g., ₹32L - ₹38L) if sufficient form data is provided (Property Type + Area).
- **BlueprintCard**: Display the currently selected Property Type, Configuration (BHK), Area, and Location directly from `formData`.
- **CostBreakdownCard**: Render a static visual placeholder (CSS donut chart) matching the mock.
- **RecommendationCard**: Render a static recommendation placeholder ("Premium Interior Package").

### Step 3: Verification
- The Dossier should accurately reflect selections made in the center form (e.g., changing the city in the form instantly updates the Location row in the Dossier).
- No errors are thrown, and layout doesn't break when data is missing (use graceful "—" fallbacks).

## End State
The `ProjectDossierPanel` is fully fleshed out with placeholder/basic reactive cards. It responds to basic form changes but does not yet contain the actual heuristic calculation formulas or AI recommendations.
