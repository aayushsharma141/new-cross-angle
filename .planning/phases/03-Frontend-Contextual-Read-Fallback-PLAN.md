# Phase 3: Frontend Contextual Read Fallback

## Objective
Safely update the frontend `api.ts` data fetching layer to read from the new DAM `asset_usages` table. It must gracefully fall back to legacy URL columns (`cover_image_url`, `hero_image`, `project_gallery`, etc.) if no `asset_usages` exist for an entity.

## Context
In Phase 2, we established the ability to write to the new `assets`, `asset_versions`, and `asset_usages` tables when an Admin uploads a file. We kept dual-writes to the old string URL columns as a safety mechanism. 
Now, we must update the frontend queries to consume from `asset_usages` natively. Because `asset_usages` uses polymorphic linkage (`entity_type` and `entity_id`), we will fetch the usages for the requested entities and stitch the URLs into the `Project` or `ServiceDetail` objects before returning them to the UI components.

## Implementation Steps

1.  **Update `api.getProjects` and `api.getMinimalProjects`:**
    *   After fetching the `projects` rows, fetch `asset_usages` where `entity_type = 'project'`.
    *   Stitch the `asset_usages` into the project data based on `entity_id`.
    *   If a `cover_image` role exists, use its `file_id` (ImageKit URL) over the legacy `cover_image_url`.
    *   If a `hero_image` role exists, use it.
    *   If `gallery` roles exist, build the gallery array from them.

2.  **Update `api.getProjectBySlug`:**
    *   Fetch the specific project.
    *   Fetch `asset_usages` where `entity_id = project.id`.
    *   Map the `hero_image` and `gallery` roles, falling back to legacy `cover_image_url` or `project_gallery` if the roles don't exist.

3.  **Update `api.getServices` and `api.getServiceBySlug`:**
    *   Apply the same pattern for `entity_type = 'service'`.
    *   Map `hero_image` and `icon` roles.

4.  **Helper Function:**
    *   Create a helper `fetchAndStitchDamUsages(items, entityType)` in `api.ts` to avoid code duplication. It will query the `asset_usages` table with a nested join to `assets` and `asset_versions` to get the `file_id`.

## Verification
*   Visit `/portfolio` and ensure the Grid Cover Images load successfully.
*   Visit `/portfolio/:slug` and ensure the Hero Image and Canvas images load correctly.
*   Upload a new image via the Admin Panel, wait for the dual-write, and ensure the frontend displays the new image (sourced from the DAM).
