# Phase 05: Asset Workspace - Research

## Context
The goal of Phase 5 is to transition the DAM V1 "Media Library" experience (an FTP-like client) into the DAM V3 "Asset Workspace". This requires dropping the `MediaDetailsSheet` sliding panel and `AdminMedia` grid list view in favor of a cohesive, dual-pane Asset Workspace where an editor can instantly answer "Where is this used?".

## Existing Implementations Evaluated

### 1. `apps/web/src/pages/admin/AdminMedia.tsx`
This is the current root container for the Media Library.
**Deficiencies:**
- **Layout:** Operates entirely as a list/grid page with modal actions (`MediaDetailsSheet`).
- **File Entity:** `fetchMediaFiles` queries the legacy `media_files` table, manually deriving `folder` and not linking to usages. 
- **Actions:** Dual write is taking place inside `uploadMutation` (writes to DAM via `MediaService.uploadDamAsset` and then to `media_files` table).
- **Selection:** Selected files are just a set of string IDs.

### 2. `apps/web/src/components/admin/media/MediaDetailsSheet.tsx`
**Deficiencies:**
- Uses a `Sheet` component that pops over the grid.
- Contains only basic metadata fields (DisplayName, AltText, Caption) and static file info.
- No visibility into asset usages (e.g. `asset_usages`).
- Not a workspace-oriented design.

## Technical Architecture for Asset Workspace

### 1. Layout Component Structure
Based on `05-UI-SPEC.md`, we will implement a `<ResizablePanelGroup>` layout (from `shadcn`).
- **Sidebar (20%):** The `AssetGrid`. It displays thumbnails and file names. Collapsible.
- **Main View (80%):** The `AssetWorkspaceView`. It contains the selected asset's preview, metadata, relationships, and usages.

### 2. Data Fetching and Services
- Current data fetching relies on `media_files` table for backward compatibility. 
- The new `Asset Workspace` should pull directly from `assets` and `asset_versions`, using `rpc` calls or joins to fetch `asset_usages`.
- Existing `MediaService` (`apps/web/src/services/MediaService.ts`) has `uploadDamAsset` but needs robust read queries for `AssetWorkspace`.

### 3. Acceptance Criteria ("Where is this used?")
To satisfy the 2-click constraint for answering "Where is this used?":
- **Click 1:** Select the asset from the left-side `AssetGrid`.
- **Click 2:** Focus or click the "Usages / Links" tab or panel inside the `AssetWorkspaceView`.
This requires an API call to fetch `asset_usages` where `asset_id = selectedAsset.id`, joining on `entity_type` and `entity_id` to provide clickable links to the CMS editor pages for the consuming entity (e.g., Portfolio, Post).

## Plan Implications
1. **Component Replacement:** We need a new page component, e.g., `AdminAssetWorkspace.tsx` or replace `AdminMedia.tsx`. 
2. **Component Split:** 
   - `AssetSidebar` (The Grid/List)
   - `AssetInspector` (The Workspace detail view, replacing `MediaDetailsSheet`)
3. **API Updates:** Ensure `MediaService` or a new `AssetService` can query `assets` with their `asset_usages` and `asset_versions`.

## Known Constraints & Rules
- Do not overwrite previous design features without verifying the design history log (`/DESIGN_HISTORY.md`).
- Follow the exact specifications in `05-UI-SPEC.md` for spacing, colors, and fonts.
- Preserve the Dual Write to `media_files` for now so that older integrations do not break while we migrate the frontend.

## Next Step
Proceed to `gsd-plan-phase` to formulate an actionable 4-step implementation plan.
