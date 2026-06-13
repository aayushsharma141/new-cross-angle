# Phase 7: Advanced Media Library Overhaul

## Goal
Replace the existing flat-list media library with a full-featured hierarchical system supporting nested folders, recursive bulk operations, drag-and-drop, and ZIP import/export — as specified in `MEDIA_LIBRARY_ARCH_SPEC.md`.

## Execution Steps

---

### Step 1 — Database Migration (ltree schema)
**Target**: Supabase SQL Editor / `supabase/migrations/`
**Action**:
- Enable the `ltree` extension.
- Create `media_folders` table with `parent_id` (adjacency list) + `path` (ltree materialized path).
- Create `media_files` table with full metadata columns: `folder_id`, `display_name`, `file_name`, `storage_path`, `mime_type`, `size_bytes`, `width`, `height`.
- Add UNIQUE constraints: `(parent_id, name)` on folders, `(folder_id, display_name)` on files.
- Add GiST index on `media_folders.path` for subtree queries.
- Seed a root-level "general" folder and migrate all existing flat-folder string values to proper folder records.

**Files Created**:
- `supabase/migrations/20260610_media_library_schema.sql`

---

### Step 2 — MediaService.ts Overhaul
**Target**: `apps/web/src/services/MediaService.ts`
**Action**:
- Rewrite entirely to use the new `media_folders` and `media_files` tables.
- Add typed interfaces: `MediaFolder`, `MediaFile` (with full metadata).
- Implement methods:
  - `getFolderTree(parentId)` — recursive folder listing using ltree.
  - `getFolderContents(folderId)` — files + sub-folders in one call.
  - `createFolder(name, parentId)` — POST to Supabase.
  - `renameFolder(id, name)` — PATCH display name.
  - `deleteFolder(id)` — CASCADE handles children in DB.
  - `renameFile(id, displayName)` — PATCH only `display_name`.
  - `bulkMove(fileIds, folderIds, targetFolderId)` — calls Edge Function.
  - `bulkCopy(fileIds, folderIds, targetFolderId)` — calls Edge Function.
  - `bulkDelete(fileIds, folderIds)` — calls Edge Function.

---

### Step 3 — Edge Function: `media-operations`
**Target**: `supabase/functions/media-operations/index.ts`
**Action**:
- Single multi-action Edge Function routing on `action` query param.
- Implement `bulk-move`: update `folder_id` on files, update `parent_id` + recalculate `ltree` path for folders and all descendants.
- Implement `bulk-copy`: use ltree subtree fetch, map old→new IDs, bulk insert folders + files in DB, call ImageKit Copy API per file.
- Implement `bulk-delete`: fetch all descendant `storage_path`s first, delete DB records (CASCADE handles rest), issue ImageKit delete in batches.
- Include `resolveCollision()` utility for name deduplication.

**Files Created**:
- `supabase/functions/media-operations/index.ts`

---

### Step 4 — Edge Function: `media-export`
**Target**: `supabase/functions/media-export/index.ts`
**Action**:
- Accept POST body: `{ fileIds: string[], folderIds: string[] }`.
- Fetch all selected files + recursively all files under selected folders from DB.
- Stream each file from its ImageKit URL into a ZIP (using `fflate` library).
- Maintain folder structure inside the ZIP using the `ltree` paths.
- Return the ZIP as `application/zip` binary response with `Content-Disposition: attachment; filename="media-export.zip"`.

**Files Created**:
- `supabase/functions/media-export/index.ts`

---

### Step 5 — Edge Function: `media-import`
**Target**: `supabase/functions/media-import/index.ts`
**Action**:
- Accept multipart POST with a `.zip` file.
- Unzip in memory using `fflate`.
- Parse internal paths to reconstruct folder hierarchy.
- For each folder path, `upsert` a `media_folders` record (creating parents first, top-down).
- For each file, upload to ImageKit (preserving path structure), then insert `media_files` record.
- Return a summary: `{ created: number, skipped: number, errors: string[] }`.

**Files Created**:
- `supabase/functions/media-import/index.ts`

---

### Step 6 — Zustand Store: `useMediaStore`
**Target**: `apps/web/src/stores/useMediaStore.ts`
**Action**:
- Create Zustand store with:
  - `selectedFiles: Set<string>`, `selectedFolders: Set<string>` — tracks selected IDs.
  - `currentFolderId: string | null` — active directory.
  - `viewMode: 'grid' | 'list'`.
  - `breadcrumbs: { id: string, name: string }[]`.
  - Actions: `toggleFile`, `toggleFolder`, `selectAll`, `clearSelection`, `setCurrentFolder` (auto-clears selection on navigation).

**Files Created**:
- `apps/web/src/stores/useMediaStore.ts`

---

### Step 7 — Component: `SidebarFolderTree`
**Target**: `apps/web/src/components/admin/media/SidebarFolderTree.tsx`
**Action**:
- Recursive component that renders the folder hierarchy as a collapsible tree.
- Each node: folder icon, name, expand/collapse chevron, context menu (Rename, Delete, New Subfolder).
- Clicking a folder sets `currentFolderId` in the Zustand store.
- Droppable target for `@dnd-kit/core` drag events.
- Animated expand/collapse using Framer Motion.

---

### Step 8 — Component: `MediaBreadcrumb`
**Target**: `apps/web/src/components/admin/media/MediaBreadcrumb.tsx`
**Action**:
- Renders breadcrumb trail from Zustand `breadcrumbs` state.
- Clicking a crumb navigates to that folder.
- Last crumb is non-clickable (current location).
- Includes a "New Folder" button inline at the end.

---

### Step 9 — Component: `MediaGridMain` (Overhaul)
**Target**: `apps/web/src/components/admin/media/MediaGridMain.tsx`
**Action**:
- Replace current `MediaGrid.tsx` with full overhaul.
- Renders sub-folders as folder cards and files as media thumbnails in the same grid.
- Folder cards: double-click to navigate into, right-click for context menu.
- File cards: click to select, double-click to preview.
- Every item wrapped as a `@dnd-kit/core` Draggable.
- Folder cards are also Droppable targets.

---

### Step 10 — Component: `FolderContextMenu` + `FileContextMenu`
**Target**: `apps/web/src/components/admin/media/ContextMenus.tsx`
**Action**:
- Right-click context menus built with Radix UI `ContextMenu`.
- **Folder menu**: Open, Rename, Copy, Move, Delete, New Subfolder.
- **File menu**: Preview, Copy URL, Rename, Move, Copy, Delete.
- Actions dispatch to the Zustand store or trigger mutations directly.

---

### Step 11 — Overhaul `AdminMedia.tsx`
**Target**: `apps/web/src/pages/admin/AdminMedia.tsx`
**Action**:
- Rebuild layout with CSS Grid: `[sidebar] [main-content]`.
- Integrate `SidebarFolderTree` (left panel).
- Integrate `MediaBreadcrumb` + `MediaGridMain` + `MediaUploadZone` (right panel, stacked).
- Wire up Zustand store for all state.
- Add "Import ZIP" button → triggers file input → calls `media-import` Edge Function.
- Add "Export ZIP" button (enabled when selection > 0) → calls `media-export` Edge Function → triggers browser download.

---

### Step 12 — Deploy & Migrate
**Action**:
- Run SQL migration against Supabase.
- Deploy all 3 new Edge Functions.
- Run migration script to seed existing ImageKit files into the new `media_files` table.
- Smoke-test end-to-end in browser.

---

## Verification
- [ ] Nested folder creation and navigation work (3+ levels deep).
- [ ] Rename folder/file updates display name only, URLs remain valid.
- [ ] Bulk select files + folders → Move to different folder → Both appear in target.
- [ ] Bulk delete triggers ImageKit cleanup and removes from DB.
- [ ] Bulk copy creates duplicate records and copies assets in ImageKit.
- [ ] Export ZIP of a nested folder preserves the folder structure inside the archive.
- [ ] Import ZIP recreates folder tree and files are visible in the media library.
- [ ] Drag a file from grid onto a folder in the sidebar → file moves to that folder.
- [ ] All existing media remains accessible and unbroken.
