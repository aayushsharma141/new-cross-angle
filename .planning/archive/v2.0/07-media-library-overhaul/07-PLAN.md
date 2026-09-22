# Phase 7: Advanced Media Library Overhaul

## 1. Goal
Implement a fully functional hierarchical Media Library with drag-and-drop support, bulk operations (move/delete), and ImageKit integration, replacing the legacy flat-list view.

## 2. Technical Stack
- Frontend: React, Tailwind CSS, Zustand, @dnd-kit/core.
- Backend: Supabase PostgreSQL (ltree extension) & Edge Functions.
- Storage: ImageKit.

## 3. Execution Plan

### Step 1: Database Migration & Schema
- Enable `ltree` extension.
- Create `media_folders` table (id, name, parent_id, path (ltree)).
- Create `media_files` table (id, folder_id, display_name, file_name, storage_provider, storage_path, mime_type, size_bytes).
- *Status: Already completed.*

### Step 2: MediaService Overhaul
- Rewrite `MediaService.ts` to use `media_folders` and `media_files`.
- Implement `createFolder`, `getFolders`, `renameFolder`, `deleteFolder`.
- Ensure types match `types.ts` correctly.
- *Status: Partially completed, needs finalization for Bulk Operations.*

### Step 3: Frontend - Zustand Store
- Create `useMediaStore.ts` to manage:
  - `currentFolderId`
  - `selectedFiles` and `selectedFolders`
  - `breadcrumbs`
- *Status: Completed.*

### Step 4: Frontend - Component Architecture
- **AdminMedia.tsx Layout**: CSS grid with SidebarFolderTree (optional, or just breadcrumbs) and MediaGridMain. Remove legacy sync clutter.
- **Folder Grid View**: Implement folder-like view for subfolders.
- **Compact Upload Zone**: Adjust `MediaUploadZone` so it does not take too much area. Make it the same size as a folder item or a compact top bar.
- **Drag & Drop**: Implement `@dnd-kit/core` to allow dragging files into folders.
- *Status: Completed.*

### Step 5: Backend - Edge Functions for Bulk Actions
- Implement `media-operations` edge function.
- Actions: `bulk-move`, `bulk-delete`.
- (Optional) `bulk-copy`.
- *Status: Completed.*

### Step 6: Frontend - Bulk Actions UI
- Floating toolbar or context menu when items are selected.
- Add "Bulk Move" allowing users to select destination folder.
- Add "Bulk Delete".
- *Status: Completed.*

### Step 7: Zip Import/Export (Future/Optional)
- Edge functions `media-export` and `media-import`.

## 4. Acceptance Criteria
- [x] Folder-like view is visually distinct and functional.
- [x] Upload zone is compact.
- [x] Users can drag & drop files into folders.
- [x] Users can bulk move files to another folder.
- [x] Unwanted legacy sync buttons are removed.
- [x] Storage relies only on ImageKit (no Supabase Storage).
