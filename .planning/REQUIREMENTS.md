# Milestone v2.0 Requirements

## Active Requirements

### Schema & Data Architecture
- [ ] **DAM-01**: Implement `assets` table with `parent_asset_id` for lineage tracking.
- [ ] **DAM-02**: Implement `asset_collections` table to group related uploads.
- [ ] **DAM-03**: Implement polymorphic `asset_usages` table (`entity_type`, `entity_id`, `role`, `domain`).
- [ ] **DAM-04**: Add PostgreSQL enums for `AssetDomain`, `AssetStatus`, `AssetType`.

### Storage & Upload Pipeline
- [ ] **DAM-05**: Update `MediaService.ts` to perform dual-writes (uploading to ImageKit, then creating `assets` and `asset_usages` records).
- [ ] **DAM-06**: Extend Admin CMS Media Library UI to handle collection-based uploads and assign proper domains.

### Frontend Integration
- [ ] **DAM-07**: Update the Discovery Engine components to read media via `asset_usages`.
- [ ] **DAM-08**: Update Portfolio and Services components to securely fall back to legacy URL fields if `asset_usages` are not found.

### Migration & Deprecation
- [ ] **DAM-09**: Write and execute a Supabase Edge Function or local script to backfill legacy `project_hero` and `service_hero` URLs into the new `assets` and `asset_usages` tables.
- [ ] **DAM-10**: Deprecate and remove legacy URL columns from `services` and `portfolio` tables.

## Out of Scope
- **DAM-OOS-01**: AI generation features (e.g., generating new discovery moodboards). This milestone only creates the schema fields (`parent_asset_id`) to support it later.
- **DAM-OOS-02**: Client Portal integrations. The domain `ClientPortal` is added to enums but not actively used in the UI yet.

## Traceability
*To be filled by ROADMAP.md*
