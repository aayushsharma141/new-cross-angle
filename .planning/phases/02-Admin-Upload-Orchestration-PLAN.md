# Phase 2: Admin Upload Orchestration & Dual-Write

## Goal

Update `MediaService.ts` and the CMS interface to write new uploads to ImageKit AND the new `assets` and `asset_usages` tables, while ensuring dual-writes to the legacy string columns during the migration transit.

## Requirements

- **DAM-05**: Update `MediaService.ts` to perform dual-writes (uploading to ImageKit, then creating `assets` and `asset_usages` records).
- **DAM-06**: Extend Admin CMS Media Library UI to handle collection-based uploads and assign proper domains.

## Step-by-step Plan

1. **Refactor `MediaService.ts` for Dual Writes with 2-Step RPC**
   - To prevent orphaned ImageKit files if the browser crashes mid-upload, we will split the DB operation:
      1. Call a Supabase RPC (`rpc_create_uploading_asset`) to insert into `assets` with status `uploading`.
      2. Upload the file to ImageKit via Edge Function.
      3. Call a second Supabase RPC (`rpc_finalize_dam_asset`) to insert into `asset_versions`, `asset_usages`, and update the `assets` status to `ready`.
      4. Update the legacy string column (`media_files`) to keep the old UI from breaking.

2. **Admin Upload UI Adjustments**
   - Update the `MediaLibrary` upload component to accept new contextual inputs: `Domain`, `Entity`, and `Role`.
   - Add a dropdown for selecting/creating `Asset Collections` when uploading bulk images (e.g., a "Shoot").

3. **Error Handling & Rollbacks**
   - If the ImageKit upload fails, we update the `assets` status to `failed` or delete it.
   - Display structured error toasts in the admin UI if a dual-write fails.

## Verification

- Run local tests to upload an image via the CMS.
- Verify 4 items exist: ImageKit payload, `assets` row (status `ready`), `asset_usages` row, and the original legacy string URL.
