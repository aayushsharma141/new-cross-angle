# Phase 11: Discovery Workspace V2 Plan

## Goal
Establish a unified CMS control panel for configuring all Discovery Archetypes, questions, and assets. This includes migrating hardcoded configurations (quiz questions, visual prompts) to the Supabase `estimator_flow_config` table (JSONB columns), updating the Discovery engine to read dynamically from the database, and allowing administrators to configure result page CTAs per Archetype redirecting to the Estimator.

## Requirements Map
- **DISC-CONFIG-01**: Admin can edit questions, visual prompts, and archetype metadata in a dedicated CMS panel.
- **DISC-CONFIG-02**: Admin can map DAM assets to archetypes directly.

## Success Criteria
1. Administrator can edit Discovery quiz questions, choices, and slides without code modification.
2. Administrator can map new DAM assets to Archetypes and configure scoring weights / visual prompts directly from the admin dashboard.
3. Discovery quiz results screens support configurable CTAs that redirect to the Estimator.

## Proposed Changes

### 1. Database & Config Sync
- Modify [useFlowConfig.ts](file:///c:/Users/aayus/Desktop/main/apps/web/src/hooks/useFlowConfig.ts):
  - Add `"discovery_questions"` and `"discovery_visual_prompts"` to `FlowConfigKey`.
  - Add default schemas for these keys under `DEFAULTS`.

### 2. Admin Workspace CMS Panels
- Update/Extend [AdminDiscoveryConfig.tsx](file:///c:/Users/aayus/Desktop/main/apps/web/src/pages/admin/AdminDiscoveryConfig.tsx):
  - Add tabs/views for editing questions and visual prompts.
  - Integrate DAM asset picker (`MediaPickerField` or similar universal asset picker) for mapping visual prompts and archetype media.
- Create/Extend editors under `apps/web/src/components/admin/discovery-flow/`:
  - **QuestionsEditor**: Panel to edit quiz questions, slides, choices, and their associated score weights.
  - **VisualPromptsEditor**: Panel to manage the 18 visual prompt images (loaded from DAM) and their associated dimension scores.

### 3. Frontend Discovery Engine Integration
- Modify [DiscoveryEngine.tsx](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/components/DiscoveryEngine.tsx):
  - Use the `useFlowConfig` hook to load `discovery_questions` and `discovery_visual_prompts`.
  - Dynamically pass loaded questions and scoring weights to components (`VisualInstinct`, `AdjectiveSelection`, `MaterialResonance`, `LightCalibration`, etc.) instead of reading from static constants.
- Update results pages to render dynamic CTAs based on active archetype configuration.

---

## Step-by-Step Task List

### Step 1: Extend useFlowConfig hook
- **File**: [useFlowConfig.ts](file:///c:/Users/aayus/Desktop/main/apps/web/src/hooks/useFlowConfig.ts)
- **Instructions**:
  - Add `"discovery_questions"` and `"discovery_visual_prompts"` to `FlowConfigKey`.
  - Import current static question definitions and visual prompts from `constants/discovery` to act as `DEFAULTS` for these new keys.

### Step 2: Build Questions & Visual Prompts Editors
- **Files**:
  - Create `apps/web/src/components/admin/discovery-flow/QuestionsEditor.tsx`
  - Create `apps/web/src/components/admin/discovery-flow/VisualPromptsEditor.tsx`
- **Instructions**:
  - Provide a clean, glassmorphism-themed UI (matching the existing admin pages) to edit questions, choices, tags, and score weights.
  - Visual prompts editor must use the universal asset picker to bind DAM assets to the 18 visual prompt slots and allow editing their aesthetic dimension weight scores (warmth, minimalism, etc.).

### Step 3: Integrate Editors into AdminDiscoveryConfig
- **File**: [AdminDiscoveryConfig.tsx](file:///c:/Users/aayus/Desktop/main/apps/web/src/pages/admin/AdminDiscoveryConfig.tsx)
- **Instructions**:
  - Add tabs/navigation options for "Questions" and "Visual Prompts".
  - Render the new editor components in their respective tabs.

### Step 4: Dynamically Bind DiscoveryEngine to Loaded Configs
- **Files**:
  - [DiscoveryEngine.tsx](file:///c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/components/DiscoveryEngine.tsx)
  - Other sub-steps/quiz stages using questions or asset arrays.
- **Instructions**:
  - Fetch `discovery_questions` and `discovery_visual_prompts` via `useFlowConfig`.
  - Provide fallbacks to static defaults while loading.
  - Dynamically calculate scores based on db-configured weights.

### Step 5: Implement Configurable CTAs on Archetype Results
- **Files**:
  - `apps/web/src/components/admin/discovery-flow/ArchetypesEditor.tsx`
  - Results component files (e.g. `apps/web/src/addons/discovery/components/ResultsReveal.tsx`)
- **Instructions**:
  - Add CTA configuration fields (label, description, target URL) to the archetype editor.
  - Update the results screen to display the configured CTA dynamically, routing the user to the Estimator with pre-fills.

---

## Verification
1. Open Admin Discovery Config panel (`/admin/discovery/quiz-configuration`).
2. Verify all tabs ("Questions", "Visual Prompts", "Archetypes", etc.) load and display successfully.
3. Edit a question's choice weight and save it. Verify the change is persisted in `estimator_flow_config`.
4. Run the user-facing Discovery quiz. Verify that the dynamic questions/choices/scoring weights are loaded and used to determine the result.
5. Verify the CTA on the results screen displays the customized text and correctly links to the Estimator.
