# Phase 10: Search & Intelligence

## Goal
Ensure the system scales elegantly from 100 assets to 5,000+ assets with faceted search and intelligence.

## Technical Strategy
- **Faceted Search**: Extend the `AssetService` to support querying by Domain, Role, and Tags. Add a Filters UI in the `AssetSidebar` to allow combining these filters.
- **Intelligence Dashboard**: Implement a dedicated "Intelligence" tab or expanded insight filters to display Unused Assets, Duplicate Assets (matched by file size), Recent Uploads, and Failed Uploads.

## Phase Checklist

### INT-01: Faceted Search Implementation
- [x] **Task 1: Backend Tag & Facet Support**
  - Update `AssetRow` interface in `apps/web/src/services/AssetService.ts` to include `asset_tag_links`.
  - Add `AssetService.getTags()` to fetch available `asset_tags`.
  - Modify `AssetService.getAssets()` to accept and filter by an array of `tags`. Ensure existing `domain` and `role` options work seamlessly.
- [x] **Task 2: UI for Faceted Search**
  - In `apps/web/src/components/admin/media/AssetSidebar.tsx`, add a "Filters" popover next to the search bar.
  - Include Select/Multi-select controls for `domain`, `role`, and `tags` within the popover.
  - Wire the selected filter states into the `useQuery` for `AssetService.getAssets()`.

### INT-02: Intelligence Dashboards
- [x] **Task 3: Dashboard Layout & Insight Queries**
  - Update `AssetSidebar.tsx` to include the missing intelligence metrics: "Duplicate Assets" and "Recent Uploads".
  - Implement client-side duplicate detection logic in `AssetSidebar` (e.g., grouping assets by `asset_versions[0].size_bytes` or `title` to identify duplicates).
  - Add "Recent Uploads" filter logic (e.g., assets created within the last 7 days).
  - Create a cohesive UI presentation for these insights (either expanding the existing pills or adding an "Insights" section).

## Verification criteria
- Can I filter assets by combining a specific Domain, Role, and Tag?
- Are "Duplicate Assets" accurately identified and displayed when selected?
- Are "Recent Uploads", "Unused Assets", and "Failed Uploads" correctly returning their respective lists?
