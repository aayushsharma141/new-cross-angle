# Phase 9: Discovery Engine v2 — Surgical Upgrade Plan

## Reality Assessment
The Discovery Engine is far more advanced than expected. This is NOT a build-from-scratch. 
It is a surgical upgrade targeting 6 specific gaps between the current system and the locked directives.

## The 6 Surgical Upgrades

---

### Wave 1 — Core Logic (No UI required, pure TypeScript)

#### Task 1.1: Replace Archetypes in `core/archetype.ts`
Replace the current 10 archetypes with the 5 locked archetypes:
1. The Refined Modernist
2. The Warm Contemporary
3. The Quiet Luxury Collector
4. The Functional Family Planner
5. The Urban Minimalist

Each archetype must define:
- `name`: exact string as above
- `tagline`: 1–2 sentence client identity statement (NOT a style label)
- `traits`: 4 behavioral traits (e.g., "Precise", "Intentional", "Function-forward")
- `materialBias`: 3 materials (e.g., "Oak · Travertine · Linen")
- `designDirection`: a direction string (e.g., "Warm Contemporary")
- `lightingApproach`: a lighting approach string (e.g., "Layered Ambient")
- `priorities`: top 3 home priorities (e.g., ["Calm", "Function", "Longevity"])
- `strategy`: 100–150 word personalized explanation template
- `match`: scoring function using current `AestheticScores` axes (keep these — they map well)

**Mapping design:**
- The Refined Modernist → high structure + high minimalism + low social
- The Warm Contemporary → high warmth + moderate structure + moderate social
- The Quiet Luxury Collector → high minimalism + high structure + low novelty + high warmth
- The Functional Family Planner → high social + low novelty + high structure + moderate warmth
- The Urban Minimalist → high minimalism + low warmth + low social + moderate structure

#### Task 1.2: Add "What Matters Most?" pivot question to `flow/transitions.ts` and `types/discovery.ts`
Add a new Stage: `PivotQuestion` (between `AdjectiveSelection` and `MaterialResonance`)
Add to `UserSignals`:
```ts
primaryValue?: 'beauty' | 'practicality' | 'impression' | 'longevity' | 'identity';
```

Add weight mapping: this single answer provides a +3.0 multiplier to the winning archetype's match score.

#### Task 1.3: Build Tier Calculation Engine
Add `core/tiering.ts` with a `calculateRecommendedTier` function:
```ts
function calculateRecommendedTier(
  archetype: Archetype,
  carpetArea?: number,
  budgetBracket?: string,
  materialChoice?: string,
  luxuryResolution?: string
): 'Essential' | 'Signature' | 'Bespoke'
```
Logic:
- `Essential`: Small area (<800sqft) OR low budget (≤₹15L) AND no premium materials
- `Bespoke`: Budget ≥₹60L AND (Quiet Luxury Collector OR premium material choice)  
- `Signature`: All other cases
This ensures archetype ≠ tier mapping.

---

### Wave 2 — New UI Component: PivotQuestion Stage

#### Task 2.1: Create `components/PivotQuestion.tsx`
A text-card-based stage presenting 5 options:
- "A Beautiful Home" (maps to `beauty`)
- "A Practical Home" (maps to `practicality`)
- "A Home That Impresses" (maps to `impression`)
- "A Home That Ages Well" (maps to `longevity`)
- "A Home That Reflects Me" (maps to `identity`)

Visual treatment: same elegant typography-based card pattern as `AdjectiveSelection.tsx`.
Must call `onComplete({ primaryValue: selectedValue })`.

---

### Wave 3 — ResultsReveal Blueprint Output Upgrade

#### Task 3.1: Add Blueprint Summary Section to `components/ResultsReveal.tsx`
**Location**: Insert new section between `identity-reveal` (S1) and `emotional-mirror` (S2).
**Section ID**: `blueprint-summary`
**Section Number**: 01.5 (or renumber accordingly)

Output fields to render:
- **Your Home Priorities** — from `archetype.priorities[]` (top 3, numbered)
- **Design Direction** — from `archetype.designDirection`
- **Material Palette** — from `archetype.materialBias` (split on `·` and render as chips)
- **Lighting Approach** — from `archetype.lightingApproach`
- **Recommended Tier** — from `calculateRecommendedTier(...)` using live signals (dynamic, NOT hardcoded)
- **Why This Fits You** — from `archetype.strategy` (personalized 100–150 word explanation)

Style: Dark luxury card on the existing `#1a1410` background. Gold accent for labels. Same motion pattern (`whileInView`) used throughout ResultsReveal.

#### Task 3.2: Add "Estimate This Blueprint" CTA to `components/ResultsReveal.tsx`
**Location**: At the bottom of the new `blueprint-summary` section AND in the existing `final-cta` section.

CTA button behavior:
- Navigates to `/estimator` with query params: `?tier=Signature&archetype=The+Refined+Modernist`
- The Estimator page should read these params and pre-fill the UI.

---

### Wave 4 — Estimator Handoff & Wiring

#### [x] Task 4.1: Estimator Initialization
In `addons/calculators/pages/PriceEstimator.tsx` (or equivalent), read URL search params:
```ts
const params = new URLSearchParams(location.search);
const tier = params.get('tier');
const archetype = params.get('archetype');
```
If present, render a "Based on your Blueprint" personalization banner at the top of the estimator showing:
- Archetype name
- Recommended tier (pre-selected)
- 1-line context: "Your profile suggests a Signature-level approach."

---

### Wave 5 — Final Wiring & Verification

#### [x] Task 5.1: Wire `PivotQuestion` into `DiscoveryEngine.tsx`
Ensure `Stage.PivotQuestion` is part of the `getNextStage` transition flow and renders the component properly. Update signals state `onComplete`.

#### [x] Task 5.2: Update `WelcomeScreen.tsx` archetype preview cards
Replace the 4 current archetype previews with the 5 locked archetypes (Refined Modernist, Warm Contemporary, Quiet Luxury Collector, Functional Family Planner, Urban Minimalist). Update names, colors, and descriptions accordingly.

#### [x] Task 5.3: Update `SECTIONS` array in `ResultsReveal.tsx`
Ensure `{ id: 'blueprint-summary', label: 'Design Blueprint' }` is present so the side-nav rail anchors properly.
for the progress rail to reflect the new section.

---

## Dependency Map (for wave sequencing)
```
Wave 1 (Task 1.1, 1.2, 1.3) — Pure logic, no dependencies
     ↓
Wave 2 (Task 2.1) — Depends on Stage enum from 1.2
     ↓
Wave 3 (Task 3.1, 3.2) — Depends on new archetype fields from 1.1 + tier engine from 1.3
     ↓
Wave 4 (Task 4.1) — Independent (can run parallel with Wave 3)
     ↓
Wave 5 (Task 5.1, 5.2, 5.3) — Depends on all Waves 1–4
```

## Files to Touch
- `src/addons/discovery/core/archetype.ts` — Replace archetypes
- `src/addons/discovery/core/tiering.ts` — New file
- `src/addons/discovery/flow/transitions.ts` — Add PivotQuestion stage
- `src/types/discovery.ts` — Add Stage.PivotQuestion + primaryValue to UserSignals
- `src/addons/discovery/components/PivotQuestion.tsx` — New file
- `src/addons/discovery/components/ResultsReveal.tsx` — New blueprint section + CTA
- `src/addons/discovery/components/WelcomeScreen.tsx` — Update archetype preview cards
- `src/addons/discovery/components/DiscoveryEngine.tsx` — Wire PivotQuestion handler
- `src/addons/calculators/pages/PriceEstimator.tsx` — Read Blueprint params

## Files to NOT touch
- `AnalysisPhase.tsx` — Already cinematic and correct
- `scoring.ts`, `weights.ts` — Keep existing 5 axes (they work)
- `DiscoveryBackground.tsx` — Untouched
- `ResultsReveal.tsx` radar chart, CognitiveProfile, TransformationReadiness — Keep as-is
- Supabase `aesthetic-ai` edge function — Keep as fallback; scoring logic stays client-side
