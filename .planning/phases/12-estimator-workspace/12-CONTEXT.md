# Phase 12: Estimator Workspace Context

## Domain
Create an admin workspace for managing estimator formulas, property types, pricing coefficients, and design packages.

## Locked Requirements
- **EST-CONFIG-01**: Admin can configure property types, design packages, addon options, and base pricing coefficients.
- **EST-CONFIG-02**: Admin can manage Estimator visual assets and results templates.

## Decisions

### 1. Formula Complexity
- **Decision**: Use simple base price × static multipliers.
- **Rationale**: Easier to build, predictable, and can be efficiently stored and updated as simple JSON configuration via the existing `useFlowConfig`.

### 2. Visual Assets Integration
- **Decision**: Integrate `MediaPickerField` into the estimator configuration editors.
- **Rationale**: Ensures property types and design packages have rich DAM thumbnails mapped to them, providing a unified visual approach without having to hardcode URLs.

### 3. Publishing Workflow
- **Decision**: Changes to pricing logic and packages go live instantly upon save.
- **Rationale**: Simpler architecture that reduces overhead. We will rely on administrators to input correct values without needing a staging/draft mode.

## Canonical Refs
- `c:\Users\aayus\Desktop\main\.planning\REQUIREMENTS.md`
- `c:\Users\aayus\Desktop\main\apps\web\src\hooks\useFlowConfig.ts`

## Code Context
- Admin configuration routes: Existing hooks in `AdminPricingConfig.tsx` and `AdminEstimateRates.tsx`.
- Existing editors: `AddonsEditor`, `DetailsEditor`, `LocationsEditor`, `PropertyTypesEditor`, `ServicesEditor` under `apps/web/src/components/admin/estimator-flow/`.
