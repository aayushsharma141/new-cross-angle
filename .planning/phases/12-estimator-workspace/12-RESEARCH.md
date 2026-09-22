# Phase 12: Estimator Workspace - Research

## Objective
Determine the implementation details needed to plan the estimator workspace (EST-CONFIG-01, EST-CONFIG-02), given that many editors already exist in `apps/web/src/components/admin/estimator-flow/`.

## Existing Code Analysis
- `useFlowConfig.ts` is the central hook storing estimator data in Supabase table `estimator_flow_config`.
- `PropertyTypesEditor.tsx`, `ServicesEditor.tsx`, `AddonsEditor.tsx` etc. already exist and contain some configuration logic.
- `MediaPickerField` has already been integrated into `PropertyTypesEditor.tsx`.

## Missing Pieces (To be planned)
1. **Pricing Coefficients & Base Rates**: The current editors might lack fields for multipliers or base pricing coefficients. We need to implement a dedicated base rate config or ensure `ExecutionTiersEditor` and `ServicesEditor` have input fields for their multipliers.
2. **Results Templates**: There is no current editor for "results templates". We need to create a `ResultsTemplateEditor.tsx` that lets admins define dynamic text or component visibility for the final result page.
3. **Workspace Assembly**: The individual editors exist, but they need to be assembled into a cohesive "Estimator Workspace" page (e.g., `AdminEstimatorConfig.tsx`) utilizing `AdminLayout`. The current routes might be fragmented between `AdminPricingConfig` and `AdminEstimateRates`.

## Validation Architecture
- **Testing**: End-to-end tests for the admin flow: editing a multiplier, saving, and verifying it applies to the estimator frontend.
- **Dependencies**: React Hook Form, Shadcn Tabs, `useFlowConfig`.

## Conclusion
To plan this phase well, the planner must focus on uniting the existing fragmented editors into a single `AdminEstimatorConfig` page, adding base pricing coefficients inputs, and creating a net-new `ResultsTemplateEditor`.
