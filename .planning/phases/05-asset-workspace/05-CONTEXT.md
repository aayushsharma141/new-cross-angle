# Phase 5: Asset Workspace — Context

## Domain
Replace the restrictive `MediaDetailsSheet` with a full-page Asset Workspace that orbits around a single asset's lifecycle and context. Includes Usage Panel, Versions Panel, and Metadata actions.

## Decisions

### Layout & Navigation Model
- **Split-pane Layout with Collapsible Grid:** The workspace will not be a full-screen overlay or a completely separate route. Instead, when an asset is clicked, the main media grid will collapse to a narrow strip (20% width) on the left to act as a fast visual selector. The new Asset Workspace will occupy the remaining 80% of the screen, providing ample space to display the image preview, Usage Panel, and Versions Panel.

## Code Context
- **Current Component:** `apps/web/src/components/admin/media/MediaDetailsSheet.tsx` (Needs to be deprecated/replaced).
- **Current View:** The main Media Library grid component will need a new state to handle the 20% collapsed view while maintaining scroll state.

## Canonical Refs
- `dam_workspace_prd.md`
