# Phase 06: Universal Asset Picker - Verification

## Checklist
- [x] Create `UniversalAssetPicker` component with Tabs (library, upload).
- [x] Integrate with `AssetService.getAssets` for displaying the library grid.
- [x] Integrate with `MediaService.uploadDamAsset` for direct uploads to the DAM.
- [x] Update `MediaPickerField` to use `UniversalAssetPicker`.
- [x] Replace `MediaPickerModal` usages (`AdminSiteAssets.tsx`) and delete `MediaPickerModal.tsx`.
- [x] Replace `HeroMediaPickerModal` and `MediaPicker` to act as wrappers around `UniversalAssetPicker`.
- [x] Verify URL and backwards compatibility hooks.

## Outcome
All pickers now point to the new DAM architecture, maintaining legacy backward compatibility via wrapper components while migrating selection interfaces to the single unified picker UI.
