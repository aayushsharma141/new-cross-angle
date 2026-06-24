# Phase 06: Universal Asset Picker - Plan

## 1. Create `UniversalAssetPicker` Component
**File:** `apps/web/src/components/admin/media/UniversalAssetPicker.tsx`
- Build a new `Dialog` component that receives `open`, `onOpenChange`, and `onSelect(asset: Asset)` props.
- Implement `Tabs` for "library" and "upload".
- In the "library" tab, fetch assets using `useQuery` and `AssetService.getAssets`.
- Display assets in a grid. Support selection state (single select).
- Add "Select Asset" and "Cancel" buttons in the footer.
- Double-click an asset to auto-select and close.

## 2. Create `UniversalAssetPickerField` (or update existing)
**File:** `apps/web/src/components/admin/media/MediaPickerField.tsx`
- Refactor the existing `MediaPickerField` to render the new `UniversalAssetPicker` instead of the legacy `MediaPickerModal`.
- Ensure it handles the form `onChange` properly. Since `onSelect` from the new picker returns an `Asset` object, we need to extract `asset.url` or whatever the form expects, OR update the forms to expect the new structure. (For safety and minimal blast radius, we will extract `asset.url` to maintain backwards compatibility with existing forms).

## 3. Deprecate Legacy Pickers
**Files:** 
- `apps/web/src/components/admin/media/MediaPicker.tsx`
- `apps/web/src/components/admin/MediaPickerModal.tsx`
- `apps/web/src/components/admin/hero/HeroMediaPickerModal.tsx`
- Delete or mark these files with a deprecation notice depending on usage, or update their imports to use `UniversalAssetPicker`.
- We will replace usages in `AdminHero.tsx`, `AdminGallery.tsx`, etc., to use `UniversalAssetPicker`.

## 4. Hook up Search and Filters
- Add state for `searchTerm`, `domain`, and `role` within the `UniversalAssetPicker`.
- Pass these filters to `AssetService.getAssets` to allow server-side filtering.

## 5. Review & Testing
- Ensure the modal opens correctly from a form.
- Ensure "Choose Existing" is the default tab.
- Ensure uploading a new asset via the "upload" tab selects it automatically.
