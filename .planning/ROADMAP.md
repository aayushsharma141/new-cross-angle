# Milestone v2.0 Roadmap

## Roadmap Overview

**4 phases** | **10 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | DAM Supabase Schema & Enums | Create the base database tables, relationships, and PostgreSQL enums to support the DAM model without disrupting current data. | DAM-01, DAM-02, DAM-03, DAM-04 | 3 |
| 2 | Admin Upload Orchestration & Dual-Write | Update `MediaService.ts` and the CMS interface to write new uploads to ImageKit AND the new `assets` and `asset_usages` tables. | DAM-05, DAM-06 | 3 |
| 3 | Frontend Contextual Read Fallback | Safely update the frontend UI components to read from `asset_usages` first, gracefully falling back to legacy URL fields if the usage is missing. | DAM-07, DAM-08 | 2 |
| 4 | Migration Backfill & Legacy Deprecation | Execute a backfill script to migrate all legacy URLs into the new DAM schema, then drop the old columns from the original entity tables. | DAM-09, DAM-10 | 2 |

---

## Phase Details

### Phase 1: DAM Supabase Schema & Enums
**Goal:** Create the base database tables, relationships, and PostgreSQL enums to support the DAM model without disrupting current data.
**Requirements:** DAM-01, DAM-02, DAM-03, DAM-04
**Success criteria:**
1. Supabase SQL migration script runs successfully without errors.
2. `assets`, `asset_collections`, and `asset_usages` tables are created with proper foreign keys and constraints.
3. RLS policies restrict modifications to authenticated CMS admins.

### Phase 2: Admin Upload Orchestration & Dual-Write
**Goal:** Update `MediaService.ts` and the CMS interface to write new uploads to ImageKit AND the new `assets` and `asset_usages` tables.
**Requirements:** DAM-05, DAM-06
**Success criteria:**
1. Uploading a file in the Admin Media Library successfully creates an ImageKit file, an `assets` row, and an `asset_usages` row if attached to an entity.
2. Legacy uploads still function (dual-write to the old string URL fields) as a safety mechanism during transit.
3. Collection UI allows users to upload multiple files as a logical "Shoot" or "Batch".

### Phase 3: Frontend Contextual Read Fallback
**Goal:** Safely update the frontend UI components to read from `asset_usages` first, gracefully falling back to legacy URL fields if the usage is missing.
**Requirements:** DAM-07, DAM-08
**Success criteria:**
1. Portfolio and Services pages successfully render images fetched via joined queries to `asset_usages`.
2. If `asset_usages` is empty for an entity, the UI safely falls back to rendering the string URL column to prevent broken images.

### Phase 4: Migration Backfill & Legacy Deprecation
**Goal:** Execute a backfill script to migrate all legacy URLs into the new DAM schema, then drop the old columns from the original entity tables.
**Requirements:** DAM-09, DAM-10
**Success criteria:**
1. A migration script reads all legacy URLs (`heroImage`, `gallery`, etc.) and automatically populates `assets` and `asset_usages` for them.
2. After verification, legacy URL columns are safely dropped from Supabase.
