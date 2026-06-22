---
status: "issues_found"
files_reviewed: 6
critical: 0
warning: 1
info: 2
total: 3
---

# Code Review: Phase 05 (Asset Workspace)

## Overview
The Asset Workspace refactor successfully introduces the foundational elements of DAM V3. The split-pane layout with `AssetSidebar` and `AssetInspector` is functional. URL-driven asset selection via search params ensures robust routing behavior, and the `AssetUsagePanel` correctly prioritizes usage visibility for editors. Dual-writes to `media_files` are maintained for legacy support.

## Findings

### WR-01: Use of `any` type in AssetInspector subcomponents
**Severity:** Warning
**File:** `apps/web/src/components/admin/media/AssetInspector.tsx`
**Description:** Subcomponents such as `AssetPreview`, `AssetVersionPanel`, `AssetCollectionPanel`, `AssetMetadataPanel`, and `AssetActionsPanel` use `any` for the `asset` prop type.
**Recommendation:** Import `AssetRow` from `AssetService` and use it to type the `asset` prop.

### IN-01: AssetSidebar uses placeholder icons
**Severity:** Info
**File:** `apps/web/src/components/admin/media/AssetSidebar.tsx`
**Description:** The sidebar does not display actual thumbnails because the URL resides in `asset_versions` or legacy `media_files`, which are not joined in the primary `AssetService.getAssets` call. This is noted via a TODO comment.
**Recommendation:** In a future optimization phase, either join the `current_version_id` URL at the DB level via a view or fetch thumbnails asynchronously.

### IN-02: Legacy Dual-Write lacks transactional rollback
**Severity:** Info
**File:** `apps/web/src/pages/admin/AdminMedia.tsx`
**Description:** During the upload mutation, if the legacy `media_files` dual-write fails after the primary DAM upload succeeds, the process logs an error but does not rollback the DAM upload.
**Recommendation:** Acceptable for a transitional phase, but consider standardizing upload transactions via an Edge Function if data inconsistency becomes an issue.

## Next Steps
- Address **WR-01** by properly typing the asset props.
- Keep **IN-01** and **IN-02** as technical debt to be resolved in later phases or optimizations.
