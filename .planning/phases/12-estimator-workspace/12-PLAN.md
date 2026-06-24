# Phase 12: Estimator Workspace - Plan

## Phase Goal

Create an admin workspace for managing estimator formulas, property types, pricing coefficients, and design packages.

## Context Summary

- **Formula Complexity**: Simple base price × static multipliers.
- **Visual Assets**: Integrate `MediaPickerField` into estimator configurations.
- **Publishing Workflow**: Changes go live instantly (no draft state).
- **Existing Config Mechanism**: `useFlowConfig.ts` leveraging `estimator_flow_config` in Supabase.

## Implementation Steps

### 1. Extend Configuration Schemas for Visual Assets

- **File**: `apps/web/src/hooks/useFlowConfig.ts` (and potentially imported type definitions).
- **Action**: Update the interfaces for `PropertyTypeItem` and package tiers to include an `imageId` or `mediaId` string field.
- **Details**: Ensure the default objects (e.g., `PROPERTY_TYPES`) support these new fields gracefully, setting them to empty or `null` by default if no asset is assigned.

### 2. Upgrade PropertyTypesEditor with DAM Asset Picker

- **File**: `apps/web/src/components/admin/estimator-flow/PropertyTypesEditor.tsx`
- **Action**: Modify the edit form to include the `MediaPickerField` from the DAM.
- **Details**:
  - When editing a property type, display a thumbnail of the currently selected DAM asset.
  - Clicking the image opens the DAM media picker to select an asset.
  - Fallback to the current text-based icon if no image is provided.
  - Ensure the list view displays the thumbnail gracefully instead of just the text icon.

### 3. Implement Execution Tiers (Design Packages) Editor

- **File**: `apps/web/src/components/admin/estimator-flow/ExecutionTiersEditor.tsx` (New or adapt existing)
- **Action**: Create an editor for design packages/execution tiers.
- **Details**:
  - Bind to the `execution_tiers` key in `useFlowConfig`.
  - Allow admin to define the package name, description, multiplier coefficient, and select a visual thumbnail via `MediaPickerField`.
  - Add this component as a new tab in `AdminPricingConfig.tsx` or replace an existing unused section.

### 4. Enhance Pricing Coefficients UI

- **File**: `apps/web/src/pages/admin/AdminEstimateRates.tsx`
- **Action**: Review and ensure all static multipliers (base rates, coefficient bounds) are editable and bound to `useFlowConfig`.
- **Details**:
  - Connect numeric input fields to their respective keys (e.g., base sqft rate, tier multipliers).
  - Ensure immediate save and invalidation of queries to reflect changes instantly.

### 5. Verification & Testing

- **Action**: Run the application and open the Estimator Admin workspace.
- **Details**:
  - Verify that property types can have a DAM image assigned and saved correctly.
  - Verify that the Design Packages/Execution Tiers can be fully managed (name, coefficient, image).
  - Test the public Estimator flow (if accessible) to ensure it dynamically uses the newly mapped DAM assets and coefficients from the configuration.

## Success Criteria

1. Administrator can adjust property type details and assign DAM assets from the UI.
2. Design packages (Execution tiers) can be managed with their specific base multipliers and visual thumbnails.
3. Pricing logic and configuration updates are saved via `useFlowConfig` and apply instantly without needing codebase redeployments.
