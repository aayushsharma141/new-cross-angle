# Phase 11: Discovery Workspace V2 Context

## Domain
Establish a unified CMS control panel for configuring all Discovery Archetypes, questions, and assets.

## Locked Requirements
- **DISC-CONFIG-01**: Admin can edit questions, visual prompts, and archetype metadata in a dedicated CMS panel.
- **DISC-CONFIG-02**: Admin can map DAM assets to archetypes directly.

## Decisions

### 1. Questions Storage & Schema
- **Decision**: Store all quiz questions, choices, and slides configuration inside the `estimator_flow_config` table using JSONB with the key `discovery_questions`.
- **Rationale**: Keeps configuration unified with archetypes, avoids database migrations, and simplifies the codebase.

### 2. Visual Prompts Configuration
- **Decision**: Manage the 18 visual prompt images and their dimension scoring (e.g. minimalism, warmth) using the key `discovery_visual_prompts` in `estimator_flow_config`.
- **Rationale**: Allows admin to easily select assets from the DAM using the `MediaPickerField` and tweak the scoring weights dynamically.

### 3. Scoring Engine Binding
- **Decision**: Bind the scoring engine dynamically to read dimension weights directly from the database configurations.
- **Rationale**: Ensures the entire Discovery quiz behaves dynamically when administrators modify questions or weights in the admin panel.

### 4. Result Page & CTA Editor
- **Decision**: Make CTAs on the result page configurable per Archetype, allowing the admin to define custom button text, description, and destination routes (defaulting to the Estimator).
- **Rationale**: Powers the connected funnel by guiding users directly from their style profile to a pre-filled Estimator quote.

## Code Context
- Admin configuration route: `/admin/discovery/quiz-configuration` mapped in `apps/web/src/routes/adminRoutes.tsx` to `<AdminDiscoveryConfig />`.
- Existing editors: `AdjectivesEditor`, `MaterialsEditor`, `LightingEditor`, `ArchetypesEditor`, `DiscoveryAssetsPanel` under `apps/web/src/components/admin/discovery-flow/`.
- Hook for loading configurations: `useFlowConfig` in `apps/web/src/hooks/useFlowConfig.ts`.
