# Phase 07 User Acceptance Testing (UAT)

## Test Scenarios

### Scenario 1: Discovery Media Slots Admin UI

- **Action**: Navigate to `/admin/discovery/quiz-configuration` and select the **Media Slots** tab.
- **Expected Results**:
  - The page displays all 18 Visual Prompt slots and all Archetype slots in a grid.
  - The slots display resolved image previews or placeholder skeleton loaders if no asset is assigned.
  - The "Replace" action triggers the `UniversalAssetPicker` with the default domain filter pre-set to `discovery`.
  - Selecting an asset updates the slot image immediately and registers the usage in `asset_usages`.

### Scenario 2: Stable Slug IDs for Archetypes

- **Action**: Modify or reorder Archetypes in the admin interface.
- **Expected Results**:
  - Entity ID matches the name slug convention: `arch_{name_slug}`.
  - Reordering or editing name-independent attributes does not orphan existing `asset_usages` records.

### Scenario 3: End-to-End Image Resolution in Quiz

- **Action**: Launch the Discovery Quiz.
- **Expected Results**:
  - Visual Prompts dynamically query Supabase via the `useDiscoveryAsset` hook (React Query backed).
  - Archetype results display Hero and Moodboard visuals resolved from the DAM instead of the legacy fallback JSON field.
  - Default fallbacks display gracefully if DAM assets are not present.
