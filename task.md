# PRD: Discovery Engine — Architecture Sprint

# CrossAngle Interior | v2.1 → v3.0

# Sprint Duration: 14 Days

## Overview

The Discovery Engine is CrossAngle's behavioral spatial profiling system. It collects user signals across 10 phases, runs a 5-axis aesthetic scoring model (minimalism, warmth, social, structure, novelty), and produces a personalized Spatial Identity Blueprint. This sprint restructures the engine's internal architecture without adding any new features. The goal is a clean scoring core, zero UI duplication, a mountable addon entry point, a working analytics foundation, and a repositioned lead gate.

No new features. No UI redesign. No copy changes. Architecture and structural fixes only.

Completion marker: ralph-done-discovery-arch-sprint

---

## Task 1: [x] Delete UI Duplication — discovery/components/ui/

The folder `discovery/components/ui/` contains 49 duplicated shadcn component files. This is a full copy of the shared design system that already exists at `@/components/ui`. Delete the entire folder and replace all imports across discovery files to use the shared path.

Steps:

- Search the entire discovery folder for all import paths containing `../ui/`, `./ui/`, or `discovery/components/ui/`
- Record every file that uses a local UI import
- Update every such import to use `@/components/ui/button`, `@/components/ui/input`, etc.
- Delete the `discovery/components/ui/` folder entirely
- Run build — zero errors required before proceeding

Success signal: Build passes. No file inside `discovery/components/` references a local `ui/` subfolder. The `discovery/components/ui/` directory no longer exists. Bundle size decreases visibly in build output.

---

## Task 2: [x] Create core/normalization.ts — Extract normalizeScore()

The function `normalizeScore()` is currently defined as an inline function inside `DiscoveryEngine.tsx`, a React component. This is pure math with no React dependency and must be extracted to a dedicated core file.

The function takes a raw score (0–10) and returns a normalized value (1–9) using: centered = (raw - 5) / 5, compressed = centered × 0.7, output = 5 + compressed × 5, clamped to max(1, min(9, output)).

Steps:

- Create the folder `addons/discovery/core/` if it does not exist
- Create `addons/discovery/core/normalization.ts`
- Move the normalizeScore function into it as a named export
- Remove the inline function definition from `DiscoveryEngine.tsx`
- Import normalizeScore in DiscoveryEngine from the new path
- Run build — zero errors required

Success signal: `core/normalization.ts` exists with zero React imports. `DiscoveryEngine.tsx` no longer defines `normalizeScore` inline. Build passes.

---

## Task 3: [x] Create core/weights.ts — Extract All Score Weight Maps

Six UI components contain hardcoded score weight maps that define how user inputs translate to aesthetic score changes. These maps are business logic and must not live inside presentation components.

The components and their weight maps to extract:

- `AdjectiveSelection.tsx` — word-to-score map (Calm, Warm, Bold, Organic, Luxurious, etc.)
- `EmotionalMapping.tsx` — slider position to score delta conversion
- `MaterialResonance.tsx` — material choice to score delta
- `LightCalibration.tsx` — light type to score delta
- `LifestyleReflection.tsx` — lifestyle option to score delta
- `VisualInstinct.tsx` — any inline weight logic not already in constants/discovery

Steps:

- Create `addons/discovery/core/weights.ts`
- Export each weight map as a named constant: ADJECTIVE_WEIGHTS, MATERIAL_WEIGHTS, LIGHT_WEIGHTS, LIFESTYLE_WEIGHTS, SLIDER_WEIGHTS, VISUAL_WEIGHTS (if applicable)
- Update each of the 6 components to import their weights from `core/weights.ts`
- Remove all hardcoded weight objects from inside the UI components
- Run build — zero errors required

Success signal: `core/weights.ts` exists with zero React imports. None of the 6 UI components define their own score weight objects. All components import weights from core/. Build passes.

---

## Task 4: [x] Create core/archetype.ts — Move getArchetype()

The function `getArchetype()` currently lives in `constants/discovery`. It is the final classification step that takes normalized AestheticScores and returns an Archetype object. This is core IP and belongs in the core layer.

Steps:

- Create `addons/discovery/core/archetype.ts`
- Move the `getArchetype` function and any archetype definition data it requires
- Export `getArchetype` as a named export
- Update `DiscoveryEngine.tsx` and any other files that import `getArchetype` to use the new path
- Run build — zero errors required

Success signal: `core/archetype.ts` exists with zero React imports. `getArchetype` is no longer exported from `constants/discovery`. Build passes.

---

## Task 5: [x] Create core/scoring.ts — Central Score Accumulation

Create a canonical scoring module that provides the additive score accumulation logic with boundary enforcement.

Steps:

- Create `addons/discovery/core/scoring.ts`
- Export the `addScores` function that takes current AestheticScores and a partial AestheticScores delta, returns updated scores clamped to 0–10 on each axis
- Export the `initialScores` constant (all axes set to 5)
- Update `DiscoveryEngine.tsx` to use the exported `addScores` and `initialScores` from `core/scoring.ts`
- Verify no score accumulation logic remains defined inline in `DiscoveryEngine.tsx`
- Run build — zero errors required

Success signal: `core/scoring.ts` exists with zero React imports. `DiscoveryEngine.tsx` does not define `addScores` or `initialScores` inline. Build passes.

---

## Task 6: [x] Create flow/session.ts and flow/transitions.ts — Clean Flow Controller

`DiscoveryEngine.tsx` currently manages state, transitions, normalization, routing, and renders the full UI shell simultaneously. Extract flow concerns into dedicated files.

Steps:

- Create the folder `addons/discovery/flow/`
- Create `flow/session.ts` — exports SessionState type, initialSession constant, resetSession function
- Create `flow/transitions.ts` — exports a `getNextStage(currentStage: Stage, mode: 'quick' | 'deep'): Stage` pure function that encapsulates all Quick vs Deep branching logic
- Update `DiscoveryEngine.tsx` to import from `flow/session.ts` and use `getNextStage` for all stage transitions
- Remove all inline `mode === 'quick' ? StageA : StageB` branching from handler functions
- Run build — zero errors required

Success signal: `flow/session.ts` and `flow/transitions.ts` exist with zero React or UI imports. `DiscoveryEngine.tsx` contains no inline stage branching conditions. Build passes.

---

## Task 7: [x] Create infrastructure/analytics/tracker.ts — Analytics Foundation

Zero event tracking exists. Create the analytics infrastructure and wire 9 events across the engine.

Steps:

- Create `addons/discovery/infrastructure/analytics/tracker.ts`
- Export `track(eventName: string, payload: Record<string, unknown>)` — async, wrapped in try-catch, never throws, never blocks rendering, writes to Supabase `addon_events` table
- Export `startSession(mode: 'quick' | 'deep'): string` — generates UUID, inserts into `addon_sessions` table (id, started_at, mode, is_completed: false), returns sessionId
- Export `completeSession(sessionId: string, archetype: string, totalSeconds: number)` — updates the session record
- Wire 9 events at their correct locations:
  - `start_session` in WelcomeScreen on Start click (payload: mode)
  - `step_viewed` at mount of each stage component (payload: stepName, sessionId)
  - `step_completed` in each onComplete handler in DiscoveryEngine (payload: stepName, sessionId, timeSpentSeconds)
  - `image_selected` in VisualInstinct on each image selection (payload: imageId, sessionId)
  - `adjective_selected` in AdjectiveSelection on each word toggle (payload: word, sessionId)
  - `gate_viewed` when LeadGatePhase mounts (payload: sessionId, mode)
  - `gate_submitted` on successful gate form submit (payload: sessionId, hasPhone boolean — no PII ever)
  - `session_completed` when Stage.Results is reached (payload: sessionId, mode, archetype, totalTimeSeconds)
  - `restart_clicked` in ResultsReveal on retake (payload: sessionId, archetypeShown)
- Privacy rule: no names, emails, or phone numbers in any event payload

Success signal: tracker.ts exists and never throws. Engine completes fully with network disabled. Test Quick mode run produces records in addon_sessions and addon_events tables. All 9 events fire at correct points.

---

## Task 8: [x] Create DiscoveryAddon.tsx — Mountable Entry Point

Create a self-contained mountable entry point for the engine so it can be deployed anywhere without router dependencies.

Steps:

- Create `addons/discovery/DiscoveryAddon.tsx`
- Props: `config` (object: firmName string, availableModes 'quick' | 'deep' | 'both') and `onComplete` callback
- Internally renders DiscoveryEngine with provided config
- Update `DiscoveryPage.tsx` to import DiscoveryAddon instead of DiscoveryEngine directly
- Keep Helmet, Logo Link inside DiscoveryPage.tsx — not in the engine
- Audit every discovery file except DiscoveryPage.tsx: remove any import of react-router or react-helmet-async
- Run build — zero errors required

Success signal: DiscoveryAddon.tsx renders the full engine when mounted. No discovery file except DiscoveryPage.tsx imports react-router. Build passes.

---

## Task 9: Add MiniResult Stage — Reposition Lead Gate

Add a MiniResult stage between Analysis and LeadCapture so users see a preview before the contact form.

Steps:

- Add `MiniResult` to the Stage enum between Analysis and LeadCapture
- Create `addons/discovery/components/MiniResultPreview.tsx`
- Props: archetype and normalizedScores
- Renders: archetype name (large serif), three key trait chips, small radar chart (reuse existing radar logic)
- Below: a single CTA button — "Reveal Your Full Blueprint"
- Update `DiscoveryEngine.tsx`: `handleAnalysisComplete` transitions to Stage.MiniResult instead of Stage.LeadCapture
- Add MiniResultPreview to the AnimatePresence render block in DiscoveryEngine
- Add `handleMiniResultComplete` handler that transitions to Stage.LeadCapture
- Update DOT_NAV_STAGES to include MiniResult
- Update LeadGatePhase.tsx heading to: "Your Spatial Blueprint is ready. Where should we send it?"
- Confirm gate_viewed analytics event fires when LeadGatePhase mounts

Success signal: After Analysis, users see archetype name, 3 traits, and radar chart before the contact form. Gate heading shows new copy. Full run shows MiniResult as a visible step.

---

## Task 10: Lazy Load Blueprint Components

ResultsReveal.tsx (1,112 lines) and BlueprintPage.tsx (1,074 lines) load on every page visit. Lazy load both.

Steps:

- In `DiscoveryEngine.tsx`, convert ResultsReveal to React.lazy() with a Suspense boundary using a dark skeleton fallback
- In `DiscoveryPage.tsx`, convert BlueprintPage to React.lazy() with a Suspense boundary
- Add preload trigger: call `import('./components/ResultsReveal')` when user enters PatternPreview (Deep mode) or when AnalysisPhase begins (Quick mode)
- Inside BlueprintPage.tsx, split into four named sub-components in the same file: BlueprintHeader, BlueprintRadar, BlueprintMoodboard, BlueprintInsights
- Run build — confirm separate chunks appear in output

Success signal: Build output shows ResultsReveal and BlueprintPage as separate JS chunks. Fresh hero page load does not load either chunk. No visible loading delay at results stage.

---

## Task 11: Stabilization — Full Test Matrix

Run the complete test matrix. Fix regressions only. No new code.

Run each scenario and confirm expected outcome:

1. Quick Mode full run: Start Quick → all Quick stages → gate → results. Mini result visible before gate. Session record created in addon_sessions.
2. Deep Mode full run: Start Deep → all 8 Reflection sections → all Deep stages → gate → full blueprint. All sections render.
3. AI failure: Disable aesthetic-ai endpoint. Complete to Analysis. Confirm toast + fallback archetype + engine continues to MiniResult.
4. Lead submit failure: Disable submit-discovery-lead. Submit gate. Confirm toast + user still reaches full results.
5. Analytics failure: Disable analytics endpoint. Complete Quick mode. Confirm engine finishes normally, no UI error, only console warning.
6. Restart flow: Complete to results. Click Start Over. Confirm full state reset, Welcome screen shown, no stale data.
7. Mobile Quick Mode at 375px: All stages render, dot nav hidden, progress bar visible, no horizontal overflow.
8. Import validation: Global search for `discovery/components/ui/` in imports. Confirm zero results.

When all 8 pass, append the completion marker to progress.txt:
ralph-done-discovery-arch-sprint
