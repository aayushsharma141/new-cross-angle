# Phase 4: Migration Backfill & Legacy Deprecation

## Objective
Port legacy media records into the new DAM schema (`assets`, `asset_versions`, and `asset_usages`) and clean up deprecated URL-based columns from entity tables.

## Context
Now that Phase 3 has successfully routed frontend read operations to `asset_usages` with graceful fallbacks, we must permanently migrate the legacy data. This achieves a single source of truth for media relationships and removes the schema debt from `projects`, `services`, `blog_posts`, and `project_gallery`.

## Implementation Steps

1.  **Migration Script Generation:**
    *   Create a SQL script (`20260622000002_dam_v3_migration.sql`) to handle the backfill.
    *   Define a PL/pgSQL function to take a URL, parse it, and insert records into `assets`, `asset_versions`, and `asset_usages`.
    
2.  **Backfill Execution:**
    *   Iterate over `projects` (`cover_image_url`, `hero_image`).
    *   Iterate over `project_gallery` (`image_url`).
    *   Iterate over `services` (`icon_url`, `hero_image`).
    *   Iterate over `blog_posts` (`cover_image_url`).
    
3.  **Schema Cleanup:**
    *   Drop `cover_image_url`, `hero_image`, `cover_image` from `projects`.
    *   Drop `image_url` from `project_gallery`.
    *   Drop `icon_url`, `hero_image` from `services`.
    *   Drop `cover_image_url` from `blog_posts`.

4.  **Types Cleanup (Frontend):**
    *   Update `api.ts` types to no longer depend on these fields existing in the database payload. (Handled gracefully via SupabaseItem `?` fields).

## Verification
*   Verify the data is successfully ported into `asset_usages`.
*   Ensure that UI pages (Project Grid, Project Details, Service Grid, Blogs) continue to render without errors.
