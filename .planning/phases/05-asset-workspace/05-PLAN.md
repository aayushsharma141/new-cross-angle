# Phase 05: Asset Workspace - Implementation Plan

## Overview
This phase introduces the **Asset Workspace**, a dual-pane UI that shifts the mental model from an FTP file browser to a fully-featured DAM workspace. It replaces the legacy list/grid + `MediaDetailsSheet` with a split-pane layout utilizing `shadcn/ui` `ResizablePanel`.

**Goal:** Establish the DAM V3 Workspace UI and satisfy the Acceptance Criteria: An editor must be able to answer "Where is this used?", "Can I safely delete it?", and "Which collection owns it?" without leaving the workspace.

## Architecture Guidelines
- **UI System:** `shadcn/ui`, utilizing `<ResizablePanelGroup>`, `<ResizablePanel>`, and `<ResizableHandle>`.
- **Data Model:** Fetch from `assets` table. Fetch usages from `asset_usages` where `asset_id = ?`. (If necessary, join to legacy records or proxy via dual-write DB).
- **Layout:**
  - Left Pane (20% default, min 15%, max 30%): `AssetGrid` (thumbnails, file names).
  - Right Pane (80%): `AssetInspector` (Modular composition).
- **Styling:** Colors (`bg-background`, `bg-muted`, `bg-primary`), spacing (multiples of 4), and typography (`font-inter`) strictly governed by `05-UI-SPEC.md`.
- **State Management:** URL-driven state from Day 1 (e.g. `/admin/media?asset=123`).

## Step-by-Step Implementation

### Step 1: Scaffold Workspace Layout & URL State
**Goal:** Create the container layout for the Asset Workspace using Resizable Panels and URL-driven selection.
- **Action 1:** Create `apps/web/src/components/admin/media/AssetWorkspaceLayout.tsx`.
- **Action 2:** Implement URL-driven selection state syncing `?asset={id}` so that refreshing or sharing the link retains the open asset.
- **Action 3:** Implement the split-pane layout (20% left, 80% right).
- **Verification:** Navigating to `?asset=123` opens the workspace with that asset selected. The split view can be resized.

### Step 2: Implement AssetSidebar (The Grid)
**Goal:** Render the list/grid of assets in the left pane.
- **Action 1:** Create `apps/web/src/components/admin/media/AssetSidebar.tsx`.
- **Action 2:** Fetch data using `useQuery` (wrapping `AssetService.getAssets`).
- **Action 3:** Ensure clicking an asset updates the URL state (`?asset=id`) rather than local state.
- **Verification:** The left pane displays asset thumbnails and names. Clicking an asset highlights it and updates the browser URL.

### Step 3: Implement Modular AssetInspector components
**Goal:** Build the right-side workspace using small, dedicated panel components to avoid future refactors when adding Phase 6 and 7 features.
- **Action 1:** Create `apps/web/src/components/admin/media/AssetInspector.tsx`.
- **Action 2:** Build out the modular panels:
  - `AssetPreview` (Top-level image/video preview)
  - `AssetUsagePanel` (Priority #1: Where is this used? Can I delete it?)
  - `AssetVersionPanel` (Placeholder for Phase 6 showing `v1` current version)
  - `AssetCollectionPanel` (Placeholder for Phase 7 collection relationships)
  - `AssetMetadataPanel` (DisplayName, AltText, Caption)
  - `AssetActionsPanel` (Delete, download, replace)
- **Verification:** The `AssetInspector` cleanly composes these 6 subcomponents in the specific priority order requested.

### Step 4: Hook up Usage Tracking Data ("Where is this used?")
**Goal:** Provide visibility into asset usages immediately, satisfying the core acceptance criteria.
- **Action 1:** Update `AssetService` to include a method `getAssetUsages(assetId: string)`. This queries the `asset_usages` table.
- **Action 2:** Hook `getAssetUsages` into `AssetUsagePanel`.
- **Action 3:** Render a list of entities (e.g., "Portfolio: Luxury Villa") where the asset is used, providing internal links to edit those entities if possible.
- **Verification:** Selecting an asset instantly reveals if it is safe to delete or actively used by CMS entities.

### Step 5: Replace Legacy Route and Cleanup
**Goal:** Make the new Workspace the active view for the CMS.
- **Action 1:** Update `apps/web/src/pages/admin/AdminMedia.tsx` (or route `page.tsx`) to render `AssetWorkspaceLayout`.
- **Action 2:** Integrate `MediaUploadZone` into the new workspace.
- **Action 3:** Ensure dual-write logic (from `MediaService.uploadDamAsset`) remains functional.
- **Verification:** Navigating to the media library route loads the new Asset Workspace. Uploading an asset works and it appears in the grid immediately.

## Review Gates
- **Design Review:** Does the layout strictly adhere to `05-UI-SPEC.md`?
- **Architecture Review:** Is the `AssetInspector` built compositionally (Preview, Usage, Versions, Collection, Metadata, Actions)?
- **State Review:** Is selection driven by the URL?
- **UX Review:** Can an editor answer:
  1. Where is this used?
  2. Can I safely delete it?
  3. Which collection owns it?
  ...without leaving the workspace? (If yes, Phase A succeeded).
