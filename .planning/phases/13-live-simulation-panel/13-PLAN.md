---
phase: 13
title: "Live Simulation Panel"
date: "2026-06-25"
---

# Phase 13 - Plan

## 1. Context Provider for Draft State
We will create a `SimulationContext` (or enhance `EstimatorRegistry`) in `apps/web/src/lib/registry/EstimatorRegistry.ts` (or a dedicated context in the admin pages) that allows editors to push their local unsaved "draft" state so that the simulation panel can compute estimates instantly without waiting for a database save.

- **Task**: Modify `EstimatorRegistry.ts` (or add `SimulationContext.tsx`) to provide a `draftRates` and `setDraftRates` mechanism. Since other configurations might also be edited (like ExecutionTiers), we will start by hoisting the draft state for `PricingConfig` to the parent `AdminEstimatorConfig` level, or into a global zustand store / React Context for the Estimator module.
- **File**: `apps/web/src/pages/admin/AdminEstimatorConfig.tsx` or `EstimatorRegistry.ts`

## 2. Refactor Editors to Expose Draft State
- **Task**: Modify `PricingIntelligenceWorkspace.tsx` to call a callback `onDraftChange` whenever `updateConfig` is called. The parent `AdminEstimatorConfig` can listen to `onDraftChange` and store the `draftRates` state.
- **Task**: Pass `draftRates` down to the right rail Simulation Sandbox so it uses `draftRates` instead of `registry.pricingRates.data` if available.
- **Files**: `PricingIntelligenceWorkspace.tsx`, `AdminEstimatorConfig.tsx`

## 3. Interactive Mock Lead (Sandbox Controls)
- **Task**: In `AdminEstimatorConfig.tsx`, add UI controls (e.g. inputs, sliders, dropdowns) for the `mockLeadData`. At minimum, allow the admin to change:
  - `area` (sqft)
  - `propertyType` (apartment, villa)
  - `executionTier` (standard, premium, luxury)
- **Files**: `AdminEstimatorConfig.tsx`

## 4. Integrate ALCS Output
- **Task**: The simulation panel currently uses hardcoded text for ALCS output (`(registry.alcsRules.data as any)?.defaultRecommendation`). We will import the actual `alcs/intelligence.ts` functions (if applicable) or a simplified logic evaluator to compute a real ALCS recommendation based on the current `mockLeadData` and the draft pricing rules.
- **Files**: `AdminEstimatorConfig.tsx`

## 5. Security & Verification
- Ensure that updating draft state does not trigger unwanted DB saves.
- Ensure the right rail instantly re-renders when a slider or input is modified.

<threat_model>
- **False State Persistence**: Draft states are local and ephemeral. DB saves only happen via the explicit "Save Changes" button.
</threat_model>
