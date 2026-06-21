# Phase 05: Asset Workspace - Implementation Plan

## Overview
This phase introduces the **Asset Workspace**, a dual-pane UI that shifts the mental model from an FTP file browser to a fully-featured DAM workspace. It replaces the legacy list/grid + `MediaDetailsSheet` with a split-pane layout utilizing `shadcn/ui` `ResizablePanel`.

**Goal:** Establish the DAM V3 Workspace UI and satisfy the Acceptance Criteria: An editor must be able to answer "Where is this used?" within 2 clicks of selecting an asset.

## Architecture Guidelines
- **UI System:** `shadcn/ui`, utilizing `<ResizablePanelGroup>`, `<ResizablePanel>`, and `<ResizableHandle>`.
- **Data Model:** Fetch from `assets` table. Fetch usages from `asset_usages` where `asset_id = ?`. (If necessary, join to legacy records or proxy via dual-write DB).
- **Layout:**
  - Left Pane (20% default, min 15%, max 30%): `AssetGrid` (thumbnails, file names).
  - Right Pane (80%): `AssetInspector` (Preview, Metadata, Asset Usages/Links).
- **Styling:** Colors (`bg-background`, `bg-muted`, `bg-primary`), spacing (multiples of 4), and typography (`font-inter`) strictly governed by `05-UI-SPEC.md`.

## Step-by-Step Implementation

### Step 1: Scaffold Workspace Layout Components
**Goal:** Create the container layout for the Asset Workspace using Resizable Panels.
- **Action 1:** Ensure `shadcn` `resizable` component is installed or accessible.
- **Action 2:** Create `apps/web/src/components/admin/media/AssetWorkspaceLayout.tsx`.
- **Action 3:** Implement the split-pane layout:
  - Left panel: `AssetSidebar` (Placeholder for grid/list).
  - Right panel: `AssetInspector` (Placeholder for details and usages).
- **Verification:** The page renders a split view that can be resized by dragging the handle, honoring the 20/80 default ratio.

### Step 2: Implement AssetSidebar (The Grid)
**Goal:** Render the list/grid of assets in the left pane.
- **Action 1:** Create `apps/web/src/components/admin/media/AssetSidebar.tsx`.
- **Action 2:** Fetch data using `useQuery` (can start by wrapping `fetchMediaFiles` temporarily, but should migrate to an `AssetService.getAssets` that fetches from the `assets` table).
- **Action 3:** Implement a selection state that passes the `selectedAssetId` up to the workspace context.
- **Verification:** The left pane displays asset thumbnails and names. Clicking an asset highlights it and updates the selection state.

### Step 3: Implement AssetInspector (The Details)
**Goal:** Build the right-side workspace for the selected asset.
- **Action 1:** Create `apps/web/src/components/admin/media/AssetInspector.tsx`.
- **Action 2:** Build the top preview area (similar to `MediaDetailsSheet` but expanded and workspace-native).
- **Action 3:** Build the metadata editor section (DisplayName, AltText, Caption) mapping to the correct schema.
- **Verification:** When an asset is selected in the Sidebar, the Inspector displays its full preview and editable metadata.

### Step 4: Implement Usage Tracking UI ("Where is this used?")
**Goal:** Provide visibility into asset usages (the 2-click requirement).
- **Action 1:** Update `AssetService` to include a method `getAssetUsages(assetId: string)`. This queries the `asset_usages` table.
- **Action 2:** In `AssetInspector`, add a dedicated "Usages" or "References" section/tab.
- **Action 3:** Render a list of entities (e.g., "Portfolio: Luxury Villa", "Blog Post: Interior Trends") where the asset is used, providing internal links to edit those entities if possible.
- **Verification:** An editor can upload/select `Luxury Villa Hero.jpg`, click it once, and see the usages listed in the right pane, completely satisfying the 2-click constraint.

### Step 5: Replace Legacy Route and Hook up Data
**Goal:** Make the new Workspace the active view for the CMS.
- **Action 1:** Update `apps/web/src/pages/admin/AdminMedia.tsx` (or route `page.tsx`) to render `AssetWorkspaceLayout`.
- **Action 2:** Integrate `MediaUploadZone` into the new workspace (perhaps as a floating action or a top bar action).
- **Action 3:** Ensure dual-write logic (from `MediaService.uploadDamAsset`) remains functional.
- **Verification:** Navigating to the media library route loads the new Asset Workspace. Uploading an asset works and it appears in the grid immediately.

## Review Gates
- **Design Review:** Does the layout strictly adhere to `05-UI-SPEC.md`?
- **Functional Review:** Can I find where `Asset X` is used in 2 clicks?
- **Architecture Review:** Is the legacy `MediaDetailsSheet` fully decoupled/removed from the new workspace?
