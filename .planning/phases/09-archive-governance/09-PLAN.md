# Phase 09: Archive & Governance

**Status:** Complete
**Goal:** Implement soft-deletion (archive), usage-guarded hard deletion, and "Archive" tab.
Archive becomes the default action. Hard delete is exceptional, guarded, and
audited. No asset can be silently removed while still referenced by another
entity.

## Requirements

- **GOV-01:** Soft deletion — archive assets without destroying storage or usage records.
- **GOV-02:** Usage guard — prevent hard deletion of any asset that still has active `asset_usages` rows.
- **GOV-03:** "Archive by default, delete as exceptional" workflow in the UI.

## Step-by-Step Implementation

### 1. AssetService — archive & guarded delete

Add to `AssetService.ts`:

- `archiveAsset(id)` — sets `status = 'archived'`; does NOT delete storage or usage records.
- `restoreAsset(id)` — sets `status = 'active'`; makes the asset visible again.
- `deleteAsset(id)` — pre-flight: queries `asset_usages` for the `asset_id`.
  - If usages exist → throws `AssetInUseError` with a list of dependent entities.
  - If no usages → hard-deletes from `assets`, `asset_versions`, and storage bucket.
- `getAssets(opts)` — by default adds `.neq("status", "archived")` filter. Add `{ includeArchived: true }` opt for the Archived tab.

### 2. AssetInspector — Archive & Delete panel

Replace the current "Danger Zone" `AssetActionsPanel`:

- **Primary action:** "Archive Asset" (amber/warning, not red) — calls `archiveAsset`.
- **Secondary action:** "Permanently Delete" (red, disabled by default).
  - Enabled only after a usage pre-check passes (zero `asset_usages`).
  - Shows a confirm dialog with the count of usages if blocked.
- If asset is already archived, show "Restore Asset" button instead.

### 3. Archived assets view in sidebar

In `AssetSidebar.tsx`, add a third sidebar tab: **Archived**.

- Shows all assets with `status = 'archived'`.
- Each card has a "Restore" button.
- Allows hard-delete from this view (since archived assets should have no active usages).

### 4. Collection delete guard

Update `CollectionService.deleteCollection()`:

- Before deleting, query `asset_usages` for all assets in this collection.
- If any usages exist → throw with a list of blocking entities.
- Show this error in the UI sidebar's delete confirmation dialog.

### 5. UI: delete confirmation dialog

Add a `DeleteConfirmDialog` component:

- Accepts `usageCount`, `usageDetails[]` props.
- If `usageCount > 0`: shows "Cannot delete — still in use by N contexts" with a table of usages.
- If `usageCount === 0`: shows a standard irreversible-action confirmation.

## Success Criteria

1. No asset can be accidentally removed while still in use — attempting to delete a referenced asset shows a clear usage list.
2. Archive becomes the default. "Delete" is only reachable after archiving or confirming zero usages.
3. The Archived tab in the sidebar allows admins to review and restore previously archived assets.
