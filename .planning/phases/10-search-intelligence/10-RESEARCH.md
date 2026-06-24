# Phase 10: Search & Intelligence

## Goal
Ensure the system scales elegantly from 100 assets to 5,000+ assets with faceted search and intelligence.

## Requirements
*   **INT-01**: Implement faceted search by Tag, Role, Collection, and Domain.
*   **INT-02**: Build intelligence dashboards for Unused Assets, Duplicate Assets, Recent Uploads, Failed Uploads.

## Current State Analysis
1.  **Faceted Search (INT-01)**:
    *   `AssetSidebar.tsx` currently only supports search by `title` (`searchQuery`) and a collection filter (`activeCollectionId`).
    *   `AssetService.getAssets` currently accepts `domain` and `role` filtering which works by checking `asset_usages`, but the UI doesn't expose these facets yet.
    *   `AssetService.getAssets` does NOT support Tag filtering yet.
    *   The database has `asset_tags` and `asset_tag_links` tables according to `20260622000000_dam_v3_schema.sql`, so the backend model exists, but `AssetService` needs updating to fetch and filter by tags.

2.  **Intelligence Dashboard (INT-02)**:
    *   The `AssetSidebar` has a basic pill filter for "Unused" and "Failed Uploads".
    *   It lacks "Duplicate Assets" and "Recent Uploads".
    *   "Recent Uploads" can easily be implemented by sorting by `created_at` or `updated_at`.
    *   "Duplicate Assets" can be identified by finding assets with the same `size_bytes` (from `asset_versions`) or same `title` + `mime_type`.
    *   The UI might need a dedicated "Intelligence" tab or an expansion of the existing insight filters to better present these specific dashboard queries.

## Technical Strategy
1.  **Tag Support**:
    *   Update `AssetRow` interface in `AssetService.ts` to include tags.
    *   Update `AssetService.getAssets` to support a `tags` array parameter for filtering.

2.  **Faceted Search UI**:
    *   Add a "Filters" popover or accordion in `AssetSidebar.tsx` to allow selecting Domain, Role, and Tags.
    *   Wire these UI controls to the `getAssets` query options.

3.  **Intelligence Dashboards**:
    *   Add "Recent Uploads" insight filter (which defaults to sorting by `created_at` DESC within the last 7 days).
    *   Add "Duplicate Assets" insight filter. Implement a check on the client or server to group assets by `size_bytes` to flag potential duplicates.
    *   Alternatively, create a dedicated "Intelligence" view if the sidebar becomes too cluttered. Given the current pill structure, adding more pills or a dedicated dropdown for "Insights" makes sense.
