# Phase 06: Universal Asset Picker - UI Spec

## 1. Visual Layout
The `UniversalAssetPicker` is a dialog modal (`shadcn/ui` Dialog) with a fixed height and width (e.g., `max-w-4xl h-[80vh]`).

### Header
- Title: "Select Asset"
- Tabs: "Library" (default) and "Upload"
- Close button.

### Library Tab (Default)
- **Top Bar**: Search input, Filter dropdowns (Domain, Role), and View Toggle (Grid/List).
- **Content Area**: Scrollable grid of `AssetCard` components or a list view.
  - Assets visually show their thumbnail, file name, and a small badge indicating `usage_count` (e.g. "Used 3 times").
- **Footer**: Cancel button and "Select Asset" button (disabled until an asset is selected).

### Upload Tab
- Standard drag-and-drop zone.
- Fields to define metadata (Alt text, Domain, Role) before uploading.

## 2. Interactions & States
- **Selection**: Clicking an asset in the grid selects it (shows a blue/gold border and a checkmark icon).
- **Double Click**: Instantly selects the asset and closes the modal.
- **Empty State**: If no assets match the search/filter, show a friendly illustration and "No assets found. Try adjusting your filters or upload a new one."
- **Loading State**: Skeleton grid while `AssetService.getAssets()` is fetching.

## 3. Brand Compliance
- Dark-themed modal (`bg-background/95 backdrop-blur`).
- Gold accents for the selected state border and the primary "Select Asset" button.
- Clean typography for asset metadata, matching the UHNW aesthetic described in `docsRegistry.ts`.
