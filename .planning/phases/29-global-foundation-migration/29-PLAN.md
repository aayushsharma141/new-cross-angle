# Phase 29: Incremental Global Foundation Migration

## Objective
Migrate the existing application infrastructure and shared components to the new Primitive Architecture (P001–P015 + Patterns) in an incremental, risk-averse manner.

## Sub-phases

### Phase 29A — Core Infrastructure
Migrate the underlying CSS and token environment. **No page components are touched.**
* `index.css`
* Global CSS variables
* Tailwind configuration (`tailwind.config.ts`)
* Theme providers
* Base typography
* Reset styles

### Phase 29B — Shared Shell
Migrate the global layouts that affect every page but carry low business risk.
* Header
* Footer
* Navigation
* Layout wrappers
* Global overlays

### Phase 29C — Shared UI
Replace legacy shared components with their Pattern/Primitive equivalents.
* Buttons
* Forms
* Cards
* Modals
* Drawers
* Tables
* Badges
*Note: Keep old components temporarily behind compatibility wrappers if needed.*

### Phase 29C.5 — Compatibility & Regression Validation
Before deleting legacy code, prove that the new system is functionally equivalent.
* Visual regression against all migrated shared components.
* Keyboard navigation (Tab, Shift+Tab, Enter, Esc, Arrow keys where applicable).
* Screen reader semantics (aria-*, roles, labels).
* Dark/Light (or Gallery/Workspace) environment switching.
* Focus ring consistency.
* Responsive behavior.
* Portal behavior (Dialog, Drawer, Select).
* Form validation states.
* Browser smoke test (Chrome, Firefox, Safari, Edge).
* Audit and catalogue temporary `any` casts.

### Phase 29D — Legacy Cleanup
Execute only after adoption reaches ~90% and Phase 29C.5 criteria are met.
* Remove deprecated tokens (FROZEN: Kept as protected legacy for unmigrated Rooms)
* Remove duplicate utilities
* Remove obsolete CSS
* Remove compatibility wrappers
* Delete legacy components like `button.tsx` (FROZEN: Retained due to live runtime references in unmigrated Rooms)

> **Phase 29D.4 Update:** Mass deletion of legacy tokens and legacy interactive primitives (`button.tsx`) has been intentionally frozen. A dependency audit confirmed these tokens and components still have active "Critical" and "Migratable" references in unmigrated Room components. Deleting them now would break those Rooms. The legacy tokens and components have been tagged as `@deprecated [PROTECTED LEGACY]` and will be deleted in Phase 30, where each room/page/component can be migrated with visual context and ownership boundaries intact.

## Migration Governance Rule
Every migrated file must improve **Design System Compliance** and must **never decrease** it.

**Per-PR Tracking Requirements:**
1. Compliance percentage before migration
2. Compliance percentage after migration
3. Total legacy values removed
4. New token/primitive adoption metrics

## Next Step
Initialize Phase 29A by analyzing and updating `index.css`, global CSS variables, and the Tailwind configuration to strictly align with the `DESIGN_GENOME.md` findings.
