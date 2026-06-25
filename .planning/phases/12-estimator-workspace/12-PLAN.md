---
phase: 12-estimator-workspace
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/pages/admin/AdminEstimatorConfig.tsx
  - apps/web/src/App.tsx
  - apps/web/src/components/admin/estimator-flow/PricingIntelligenceWorkspace.tsx
  - apps/web/src/components/admin/estimator-flow/ResultIntelligenceWorkspace.tsx
  - apps/web/src/lib/registry/EstimatorRegistry.ts
autonomous: true
requirements: [EST-CONFIG-01, EST-CONFIG-02]
must_haves:
  truths:
    - "No estimator setting may exist outside the Estimator Workspace after Phase 12."
    - "Every configuration change updates the Live Simulation Panel immediately."
    - "Every editor reads and writes through a unified Estimator Registry instead of directly mutating scattered state."
    - "The right panel always shows the real downstream impact of the current configuration (budget, recommendation, confidence)."
    - "Admin can interact with the Estimator Workspace Foundation containing a 280px navigation rail, a fluid editor workspace, and a 360-400px Live Simulation Panel."
  artifacts:
    - path: "apps/web/src/pages/admin/AdminEstimatorConfig.tsx"
      provides: "Estimator Workspace Foundation (UI Shell)"
    - path: "apps/web/src/components/admin/estimator-flow/PricingIntelligenceWorkspace.tsx"
      provides: "Unified Pricing Intelligence Workspace"
    - path: "apps/web/src/components/admin/estimator-flow/ResultIntelligenceWorkspace.tsx"
      provides: "Result Experience Editor"
    - path: "apps/web/src/lib/registry/EstimatorRegistry.ts"
      provides: "Centralized configuration registry for Estimator"
  key_links:
    - from: "apps/web/src/pages/admin/AdminEstimatorConfig.tsx"
      to: "apps/web/src/components/admin/estimator-flow/PricingIntelligenceWorkspace.tsx"
      via: "Navigation rail"
      pattern: "<PricingIntelligenceWorkspace"
    - from: "apps/web/src/pages/admin/AdminEstimatorConfig.tsx"
      to: "apps/web/src/components/admin/estimator-flow/ResultIntelligenceWorkspace.tsx"
      via: "Navigation rail"
      pattern: "<ResultIntelligenceWorkspace"
    - from: "apps/web/src/components/admin/estimator-flow/PricingIntelligenceWorkspace.tsx"
      to: "apps/web/src/lib/registry/EstimatorRegistry.ts"
      via: "State management/mutation"
      pattern: "EstimatorRegistry."
---

<objective>
Assemble a cohesive, modular Estimator Workspace. Phase 12 converts scattered configuration screens into an operating-system-level workspace architecture utilizing a unified Estimator Registry and a Live Simulation Sandbox.
Purpose: Ensure all estimator settings live inside one UI-Contract compliant interface, reading/writing exclusively via Estimator Registry, with real-time feedback visible in a Live Simulation Panel.
Output: Unified workspace shell, Pricing Intelligence Workspace, Result Intelligence Workspace, and Estimator Registry.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/execute-plan.md
@~/.gemini/antigravity/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/12-estimator-workspace/12-UI-SPEC.md
@apps/web/src/hooks/useFlowConfig.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Estimator Workspace Foundation (UI Shell) & Registry</name>
  <files>apps/web/src/pages/admin/AdminEstimatorConfig.tsx, apps/web/src/App.tsx, apps/web/src/lib/registry/EstimatorRegistry.ts</files>
  <action>- [x] Create `EstimatorRegistry.ts` as the single source of truth for pricing, ALCS, and result templates.e this shape) as a single interface handling Pricing, Packages, Addons, ALCS, Results, and Media. Then,- [x] Refactor `AdminEstimatorConfig.tsx` to act as the 3-panel workspace shell.: a 280px navigation rail (Pricing, Packages, Addons, ALCS Rules, Results, Media), a fluid editor workspace, and a 360-400px Live Simulation Panel on the right. Include responsive logic, keyboard shortcuts (Ctrl/Cmd+S), and skeleton states.- [x] Remove any other disconnected setting routes in `App.tsx`.</action>
  <verify>
    <automated>npm run check -- --filter=web</automated>
  </verify>
  <done>Estimator Workspace Shell renders correctly with a Live Simulation Panel placeholder and a unified Registry backend. Scattered settings are removed.</done>
</task>

<task type="auto">
  <name>Task 2: Pricing Intelligence Workspace & Live Simulation Panel</name>
  <files>apps/web/src/components/admin/estimator-flow/PricingIntelligenceWorkspace.tsx, apps/web/src/pages/admin/AdminEstimatorConfig.tsx</files>
  <action>Move pricing-related configuration (base rates, multipliers, regional coefficients, complexity factors) into `PricingIntelligenceWorkspace.tsx`. Make all edits go through `EstimatorRegistry`.- [x] Build the Live Simulation panel to instantly compute downstream impact based on edits.tsx` to instantly recompute and display the Estimated Range, ALCS recommendation, selected execution path, and budget based on a Mock/Real Lead selector. Ensure real-time reactivity as pricing intelligence is tweaked.</action>
  <verify>
    <automated>npm run check -- --filter=web</automated>
  </verify>
  <done>Pricing workspace built and modifying any value instantly updates the budget and recommendation inside the Live Simulation Panel.</done>
</task>

<task type="auto">
  <name>Task 3: Result Intelligence Workspace</name>
  <files>apps/web/src/components/admin/estimator-flow/ResultIntelligenceWorkspace.tsx, apps/web/src/pages/admin/AdminEstimatorConfig.tsx</files>
  <action>- [x] Implement `PricingIntelligenceWorkspace.tsx` managing base rates, execution tiers, and multipliers., ALCS explanation blocks, confidence messaging, CTA configuration, and dynamic placeholders through the `EstimatorRegistry`.- [x] Expand the Live Simulation Panel to preview the client-facing result dynamically, including designer explanations and confidence messaging based on the selected mock lead.</action>
  <verify>
    <automated>npm run check -- --filter=web</automated>
  </verify>
  <done>Result Experience Editor can configure all recommendation, messaging, and CTA elements, with the Live Simulation Panel reflecting the exact client-facing output.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Admin UI → Supabase API | Admin configuration inputs saving to `estimator_flow_config` via `EstimatorRegistry` |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-12-01 | Spoofing | `EstimatorRegistry` saving logic | mitigate | Rely on RLS policies enforcing authenticated admin access. |
| T-12-02 | Tampering | Configuration Inputs | mitigate | Ensure inputs are strictly typed; Supabase constraints block malformed JSON. |
</threat_model>

<verification>
- Verify no estimator setting exists outside the Estimator Workspace.
- Navigate to the Estimator Workspace.
- Select a mock lead in the Live Simulation Panel.
- Change a pricing setting or result template and verify the Live Simulation Panel immediately updates (estimated range, confidence, recommendation).
- Verify all configuration data reads/writes via the new `EstimatorRegistry` structure.
</verification>

<success_criteria>
- No estimator setting exists outside the Estimator Workspace.
- Every configuration change updates the Live Simulation Panel immediately.
- Every editor reads and writes through the Estimator Registry.
- The right panel always shows the real downstream impact of the current configuration.
</success_criteria>

<output>
Create `.planning/phases/12-estimator-workspace/12-01-SUMMARY.md` when done
</output>
