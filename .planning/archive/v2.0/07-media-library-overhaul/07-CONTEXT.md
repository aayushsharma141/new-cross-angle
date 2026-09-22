# Phase 7 Context: Advanced Media Library

## Why This Phase Exists
The existing media library is a basic flat-list view with simple folder-string filtering. It does not support nested folders, has no recursive delete/copy logic, cannot bulk-move mixed selections, and has no import/export capability. This phase rebuilds it from the ground up against the approved architecture specification.

## Source Document
`MEDIA_LIBRARY_ARCH_SPEC.md` — approved by user on 2026-06-10.

## Key Technical Constraints
- **Database**: Supabase PostgreSQL with `ltree` extension for materialized paths.
- **Storage**: ImageKit only (no Supabase Storage for media).
- **Backend**: Supabase Edge Functions (Deno).
- **Frontend**: React, TypeScript, React Query, Zustand, @dnd-kit/core.
- **Existing Code**: Current `AdminMedia.tsx`, `MediaService.ts`, `imagekit-upload` edge function must be migrated/replaced.

## Risks
- `ltree` requires a one-time Supabase migration that alters the database schema significantly.
- ImageKit API has rate limits; bulk copy/delete must be batched.
- Zip import/export requires streaming; Deno's `fflate` library must be vendored or bundled.

## Success Criteria
- Nested folders (create/rename/delete) work end-to-end.
- Bulk move/copy/delete works for mixed file+folder selections.
- Drag-and-drop moves items between folders.
- Zip export downloads with correct folder structure.
- Zip import recreates folder tree and uploads files.
- All existing media is visible and unaffected.
