# Phase 08: Collection Workspace — Gap-Closure Plan

## Status: Complete

**Phase goal:** Elevate collections to a first-class view in the sidebar, supporting bulk operational flows.
**Requirements:** COLL-01, COLL-02, COLL-03
**Previous attempt:** Core data layer + sidebar UI implemented. This plan closes 5 remaining gaps before verification.

---

## What's Already Complete (Do Not Re-Implement)

| Component | Status | Notes |
|---|---|---|
| `CollectionService.ts` | ✅ Complete | CRUD, counts, delete-with-unassign |
| `AssetSidebar.tsx` | ✅ Complete | 3-tab (Assets / Collections / Archived), inline create, filter |
| `AssetWorkspaceLayout.tsx` | ✅ Complete | Owns `activeCollectionId`, threads to sidebar + inspector |
| `AssetInspector.tsx` — assign mutation | ✅ Complete | `assignAssetToCollection` wired to dropdown |
| `MediaUploadZone.tsx` — prop interface | ✅ Complete | `collectionId?: string | null` is declared |
| `getArchivedAssets` query | ✅ Complete | Archived tab renders archived assets |

---

## Gaps to Close

### Gap 1 — Upload Zone: `collectionId` prop not consumed [COLL-03]

**File:** `apps/web/src/components/admin/media/MediaUploadZone.tsx`

**Problem:** Line 19 — `collectionId` is declared in `MediaUploadZoneProps` but never destructured or passed to `onUpload`. The parent that calls `onUpload` has no way to know which collection was active.

**Fix:** The prop must be threaded through to the parent's `onUpload` callback. There are two valid patterns:

**Option A (preferred — callback stays pure):** Add `collectionId` as a second argument to `onUpload`:
```ts
onUpload: (files: File[], collectionId?: string | null) => Promise<void> | void
```
And in `onDrop`, call `onUpload(acceptedFiles, collectionId)`.

**Option B (simpler — hook closure):** Pass `collectionId` through `onDrop` closure directly to the callback, without changing the `onUpload` signature, by wrapping in the parent.

Use **Option B** — it avoids a signature change across all callers. The parent (see Gap 2) will create a wrapper that captures `activeCollectionId` at call time.

**Action:** Destructure `collectionId` in the component function signature and pass it to `onUpload` as a second argument. Update the `onUpload` type signature accordingly.

---

### Gap 2 — Upload Modal: Not collection-aware [COLL-03]

**File:** `apps/web/src/pages/admin/AdminMedia.tsx`

**Problem:** The "Upload Asset" dialog's `MediaUploadZone` (line 453) exists in `AdminMedia.tsx`, which is a parent of `AssetWorkspaceLayout`. The two are siblings in the render tree — `AdminMedia.tsx` renders `<AssetWorkspaceLayout />` as a child. This means `AdminMedia.tsx` does not have access to the workspace's `activeCollectionId`.

**Architectural decision:** The upload modal should be moved INTO `AssetWorkspaceLayout.tsx` OR `AssetSidebar.tsx` so it has access to `activeCollectionId`. Moving into `AssetWorkspaceLayout` is cleanest.

**Fix:**
1. Add an "Upload" button inside `AssetWorkspaceLayout.tsx` (e.g., in the Inspector panel's empty state or as a floating action in the sidebar header when a collection is active).
2. Wire the upload flow to call `MediaService.uploadDamAsset` and then `CollectionService.assignAssetToCollection(newAssetId, activeCollectionId)` if `activeCollectionId` is set.
3. Keep the existing global upload modal in `AdminMedia.tsx` as-is for collection-agnostic uploads.

**Alternative (simpler):** Add a collection-aware upload trigger inside `AssetSidebar.tsx` specifically on the Collections tab — an "Upload to this collection" button that opens a lightweight upload zone.

Use the alternative: add an "Upload to collection" button in `AssetSidebar` when `activeCollectionId` is set (or when browsing a collection). This is a localized change with no layout refactor.

---

### Gap 3 — CollectionService: No rename/update operation

**File:** `apps/web/src/services/CollectionService.ts`

**Problem:** Users cannot rename a misnamed collection. The service has `deleteCollection` but no `renameCollection` or `updateCollection`. The sidebar has no rename UI.

**Fix:** Add to `CollectionService`:
```ts
async updateCollection(id: string, patch: { name?: string; type?: CollectionType }): Promise<CollectionRow>
```

And in `AssetSidebar.tsx`, add an inline rename interaction on the `CollectionRow` component: clicking the collection name shows an edit input (same pattern as inline create).

**Scope:** Service method + sidebar inline rename trigger. No new modal.

---

### Gap 4 — Inspector: Active collection not pre-selected in dropdown

**File:** `apps/web/src/components/admin/media/AssetInspector.tsx`

**Problem:** The `AssetCollectionPanel` receives `activeCollectionId` but doesn't use it to pre-select the dropdown. When a user is browsing "Luxury Villa Shoot" and opens an asset, the collection dropdown defaults to blank instead of pre-selecting "Luxury Villa Shoot".

**Fix:** In `AssetCollectionPanel`, when the dropdown first renders (and the asset has no `collection_id` yet), default the selected value to `activeCollectionId` from props. This is a UX convenience — it doesn't auto-assign; the user still must confirm by clicking "Assign".

---

### Gap 5 — Upload mutation: collection auto-assign after upload

**File:** `apps/web/src/pages/admin/AdminMedia.tsx` (upload mutation, lines 119–192)

**Problem:** Even if we wire up collection context to the upload zone, the actual DAM upload in `uploadMutation.mutationFn` doesn't call `CollectionService.assignAssetToCollection`. The asset gets created but never attached to the collection.

**Fix:** After a successful `MediaService.uploadDamAsset` call, if a `collectionId` is provided, call `CollectionService.assignAssetToCollection(assetId, collectionId)`. The `uploadDamAsset` return value includes the asset's new ID — use it here.

> Note: This requires `MediaService.uploadDamAsset` to return the new asset's `id`. Verify this is already returned; if not, update `AssetService.createAsset` / `MediaService.uploadDamAsset` to return `{ url, filePath, assetId }`.

---

## Implementation Order

Execute gaps in this order (each gap is independent of the others except Gap 5 depends on Gap 2):

```
Gap 3 → Gap 1 → Gap 4 → Gap 2 → Gap 5
```

Rationale:
- Gap 3 (service method) is pure data layer, no UI risk
- Gap 1 (prop threading) is a type-safe refactor
- Gap 4 (pre-select) is a one-liner
- Gap 2 (upload location) is the structural change
- Gap 5 (auto-assign after upload) requires Gap 2 to know which collection

---

## Files Modified

| File | Change |
|---|---|
| `services/CollectionService.ts` | Add `updateCollection()` method |
| `components/admin/media/AssetSidebar.tsx` | Add inline rename UI for CollectionRow + collection-context upload trigger |
| `components/admin/media/MediaUploadZone.tsx` | Destructure + pass `collectionId` through `onUpload` |
| `components/admin/media/AssetInspector.tsx` | Pre-select active collection in `AssetCollectionPanel` dropdown |
| `services/MediaService.ts` (if needed) | Verify `uploadDamAsset` returns `assetId`; add if missing |
| `pages/admin/AdminMedia.tsx` | Post-upload: call `assignAssetToCollection` if collection context active |

---

## Success Criteria

All 3 original COLL requirements must be demonstrably true:

### C1 — COLL-01: Collection navigation
- [ ] Editor can click "Collections" tab in the sidebar
- [ ] Collections list renders with name, type badge, and asset count
- [ ] Clicking a collection filters the asset grid to that collection only
- [ ] A "Clear filter" chip appears when a collection filter is active

### C2 — COLL-02: Create collection
- [ ] "+" button opens inline create form
- [ ] Form accepts name + type (shoot / campaign / moodboard_set / project_delivery)
- [ ] Enter submits; Escape cancels
- [ ] New collection appears in list immediately (React Query invalidation)
- [ ] Collection can be renamed inline after creation

### C3 — COLL-03: Assign to collection
- [ ] Upload zone auto-assigns new assets to active collection when one is selected
- [ ] Inspector "Collection" panel shows the correct collection for existing assets
- [ ] Inspector dropdown pre-selects the active workspace collection when no collection is assigned
- [ ] Editor can change assignment from Inspector and it persists

---

## Verification Tests

### V1 — Create + Filter
1. Navigate to Admin → Media → Collections tab
2. Click "+", name it "Phase 8 Test Shoot", type "Shoot", press Enter
3. Verify it appears in the list with "0 assets"
4. Click the collection — verify Assets tab activates and grid shows "No assets found"

### V2 — Upload into collection
1. With "Phase 8 Test Shoot" active (filtered), trigger upload
2. Upload 2 test images
3. Verify both appear in the filtered grid
4. Switch to All Assets tab — verify both images show "Phase 8 Test Shoot" badge
5. Switch back to Collections — verify "Phase 8 Test Shoot" now shows "2 assets"

### V3 — Inspector assignment
1. Open an asset that has no collection
2. In the Inspector's Collection panel, verify the dropdown pre-selects "Phase 8 Test Shoot" if active
3. Click "Assign" — verify the asset now appears in the collection's filtered view

### V4 — Rename
1. In the Collections tab, trigger rename on "Phase 8 Test Shoot"
2. Rename to "Phase 8 Renamed"
3. Verify the collection list updates immediately

### V5 — Delete collection
1. Delete "Phase 8 Renamed"
2. Verify it disappears from sidebar
3. Verify its 2 assets are still in All Assets but no longer have a collection badge

---

## Threat Model

| Risk | Severity | Mitigation |
|---|---|---|
| Upload auto-assign fires when no collection is active | Low | Guard: `if (activeCollectionId) { assign() }` |
| `deleteCollection` fails silently if asset update fails | Medium | The unassign is already wrapped in a separate `await`; add error propagation |
| Inline rename submits empty name | Low | Validate before mutate; disable submit if name is blank |
| N+1 on collection list re-render after rename | Low | Single `invalidateQueries(["dam", "collections"])` covers it |
