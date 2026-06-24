# Phase 8: Discovery Engine Results UI/UX Polish

## Context & Intent
A critical founder review revealed that while the Discovery Engine pipeline works architecturally, the visual experience of the `ResultsReveal` component feels incomplete and off-brand. Specifically, the heavy use of the brand's primary `site-crimson` color clashes with the "conscious luxury" vibe, and hardcoded captions break the illusion of AI personalization.

The priority is to execute the high-impact visual and UX polish items mapped out below.

## Execution Plan

### 1. Aesthetic Corrections (Color Palette)
- **File**: `apps/web/src/addons/discovery/components/ResultsReveal.tsx`
- **Task**: Replace all instances of `site-crimson` with `site-gold`, bronze, or muted cream tailwind classes. This affects borders, background gradients, text accents, and the final share card. This eliminates the "error state" feeling described in the review.

### 2. Deep Personalization
- **File**: `apps/web/src/addons/discovery/components/ResultsReveal.tsx`
- **Task**: Replace the hardcoded `Emotional Mirror` captions (currently lines ~677 and ~698) with dynamic text generated either by the AI or derived safely from `normalizedScores`. 
- **Task**: Enhance the Cognitive Profile summary block to explicitly display the choices the user made, like `signals.materialChoice` and `lightPreference`, instead of relying purely on default placeholders.

### 3. Component Architecture & Simplification
- **File**: `apps/web/src/addons/discovery/components/ResultsReveal.tsx`
- **Task**: The file is 1114 lines long. Extract the heavy visual sections into smaller sub-components:
  - `IdentityReveal` (the top archetype section)
  - `EmotionalMirror`
  - `AestheticDNA`
  - `SensoryBlueprint`
- **Task**: Consolidate duplicate CTAs at the bottom of the page to reduce choice paralysis, focusing on a primary "Book Strategy Call".

### 4. UX & Mobile Enhancements
- **File**: `apps/web/src/addons/discovery/components/ResultsReveal.tsx`
- **Task**: Implement a subtle scroll-progress indicator or sticky navigation so users understand the length of the blueprint.
- **Task**: Fix any right-aligned or overlapping UI elements breaking at the `375px` mobile viewport (as flagged by the mobile audit).

## Verification Strategy
- **Visual Check**: Open the engine locally, skip to the Results view, and verify that the color palette is devoid of `site-crimson` bleeding.
- **Data Check**: Ensure the Emotional Mirror text references the active score or actual material choices.
- **Mobile Check**: Shrink browser to 375px width and ensure text remains readable and CTAs do not stack poorly.
