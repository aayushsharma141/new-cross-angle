# Phase 06: Universal Asset Picker - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous)

<domain>
## Phase Boundary

Redesign the contextual media selection flow to prioritize reuse over re-uploading. 
This phase will replace the old `MediaPicker` and `MediaPickerModal` components with a single, highly integrated `UniversalAssetPicker` built on the new V3 `assets` schema.
</domain>

<decisions>
## Implementation Decisions

### 1. Unified Picker Component
Create `UniversalAssetPicker.tsx` that functions as a dialog modal. It should reuse the core UI patterns from the `AssetWorkspace` (grid view, list view, search by tag/role/domain) but be optimized for *selection* rather than *management*.

### 2. "Choose Existing" First
The default tab in the modal must be the "Asset Library" instead of "Upload". The user must intentionally switch to the "Upload" tab to add a new file.

### 3. Drop-in Replacement for `MediaPickerField`
Update `MediaPickerField.tsx` to use the new `UniversalAssetPicker` internally, so that forms across the app (Blogs, Portfolio, Hero) instantly get the new experience without changing their `Control` setups.

### 4. Integration with V3 Schema
The picker must fetch from the `assets` table via `AssetService`, rather than the legacy `media_files` table, completing the read-path migration for content selection.
</decisions>

<code_context>
## Existing Code Insights
- Legacy components: `MediaPicker`, `MediaPickerModal`, `MediaPickerField`
- Data source: `AssetService.ts` provides `getAssets` which we should use for the picker.
</code_context>

<specifics>
## Specific Ideas
- Allow double-clicking an asset to instantly select it.
- Show usage count badges on assets so editors know if they are selecting a highly reused asset.
</specifics>

<deferred>
## Deferred Ideas
- AI-based similarity search for assets.
</deferred>
