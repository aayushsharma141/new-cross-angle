# Phase 13 - Live Simulation Panel - Research

## Objective
Research how to implement Phase 13: "Live Simulation Panel".
The goal is to implement a robust Live Simulation Panel in the Estimator Workspace so that pricing, packages, and ALCS thresholds instantly recompute the Estimated range, Sellable presentation view, and ALCS Output as the admin edits them (before saving), and allowing the mock lead data to be modified.

## Current State Analysis
1. **AdminEstimatorConfig (`AdminEstimatorConfig.tsx`)**:
   - Currently has a hardcoded `mockLeadData` object.
   - The simulation computes `estimate` using `calculateEstimate(mockLeadData, registry.pricingRates.data)`.
   - The right rail displays the "Estimated Range", "ALCS Output", and "Workspace State".
   - The ALCS Output uses hardcoded fallback strings from the registry instead of actually running an ALCS engine against the mock lead.
   
2. **The Problem with "Instant Recompute"**:
   - Editors (`PricingIntelligenceWorkspace`, `ExecutionTiersEditor`, etc.) manage their own local state (unsaved changes).
   - The `AdminEstimatorConfig` component uses `registry.pricingRates.data`, which only updates *after* the user clicks "Save" and the data is fetched from Supabase.
   - To make it "instantly recompute", the unsaved draft state needs to be hoisted to `AdminEstimatorConfig` or shared via a context so the simulation panel can compute using the *draft* registry data rather than the *committed* registry data.

## Requirements for Phase 13
1. **Draft State Management**: 
   - We need a way for the active editor to expose its "draft" state to the simulation panel.
   - Alternatively, the `EstimatorRegistry` context should support a `draftState` mechanism where editors apply local overrides.
   
2. **Interactive Mock Lead**:
   - The right rail should allow the admin to quickly toggle aspects of the mock lead (e.g., Area slider, Property Type dropdown, Execution Tier dropdown) to see how the pricing logic holds up under different scenarios.

3. **ALCS Engine Integration**:
   - The simulation panel needs to run the actual ALCS scoring engine (`alcs/intelligence.ts`) using the draft rules and the mock lead data, producing a real recommendation and confidence score.

4. **Sellable Presentation View**:
   - Show a preview of the Result Template (colors, CTAs, confidence badges) based on the draft Result Experience configuration.

## Architectural Approach
1. **Shared Draft Context**: Create a `SimulationContext` or add to `EstimatorRegistry` to hold both `mockLead` state and `draftOverrides` for pricing rates, packages, and rules.
2. **Editor Refactoring**: Modify the editors (e.g., `PricingIntelligenceWorkspace`) to dispatch their local `onChange` events to update the `draftOverrides` in the context.
3. **Simulation Computation**: The `AdminEstimatorConfig` right rail reads `mockLead` and `draftOverrides` (merged with saved registry data) and feeds them into `calculateEstimate` and `computeALCS`.
4. **Mock Lead Controls**: Add a "Sandbox Controls" popover or accordion in the right rail to let the user change the area, tier, and property type of the mock lead.

## Conclusion
To plan this phase, we will need to:
- Lift draft state up or utilize a shared Context.
- Build UI controls for the Mock Lead.
- Wire up the ALCS compute function to the panel.
