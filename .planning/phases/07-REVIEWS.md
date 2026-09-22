---
phase: 7,8,9
reviewers: [antigravity-internal]
reviewed_at: 2026-06-22T17:21:00Z
plans_reviewed: [07-PLAN.md, 07-SUMMARY.md, 08-PLAN.md]
---

# Cross-AI Plan Review — Phases 7, 8 & 9

> **Reviewer:** Antigravity Internal Architect Review (no external CLI flags specified; executed as direct code audit)
> **Scope:** Phase 7 (Discovery Integration), Phase 8 (Collection Workspace), Phase 9 (Archive & Governance — plan not yet written)

---

## Phase 7: Discovery Integration — Review

### Summary

Phase 7 successfully eliminated all hardcoded static image imports from `constants/discovery.ts` and wired `VisualInstinct.tsx` to resolve images dynamically via the `useDamAsset` hook. The `ArchetypesEditor.tsx` now exposes Hero and Moodboard pickers via `MediaPickerField`. The implementation is functionally correct but has three notable gaps relative to its stated requirements.

### Strengths

- ✅ All 18 `visual-N` static imports removed from bundle — DISC-04 satisfied
- ✅ `assetKey` pattern (`discovery_visual-1`) gives admins a clear convention for uploading visual prompts into the DAM
- ✅ `useDamAsset` hook is composable, reusable across domains, and decouples DB lookup from rendering
- ✅ `VisualCard` pattern cleanly separates each card's DAM fetch into a self-contained component
- ✅ Fallback URL mechanism ensures Discovery still renders even with no DAM assets uploaded

### Concerns

| Severity | Issue | File |
|----------|-------|------|
| **HIGH** | `useState(() => { ... })` used as a side-effect trigger in `VisualCard` — this is a Rules of Hooks violation; the lazy initializer only runs on mount and doesn't react to `url` changes | `VisualInstinct.tsx:197` |
| **HIGH** | `useDamAsset` uses raw `useEffect` without React Query — no caching, deduplication, or stale-while-revalidate. 18 cards × 1 fetch each = 18 concurrent Supabase calls on every Discovery session start | `useDamAsset.ts` |
| **MEDIUM** | DISC-02: `useFlowConfig` / Discovery payload not updated to serve archetype Hero/Moodboard from DAM — `ResultsReveal.tsx` still reads from the archetype JSON field, not from a `useDamAsset` lookup keyed to the archetype ID | `ResultsReveal.tsx` |
| **MEDIUM** | Lifestyle images (Step 2 of Discovery) were mentioned in DISC-03 as requiring migration, but `Lifestyle.tsx` was not refactored — still uses static imports if they exist | `Lifestyle.tsx` |
| **LOW** | `useDamAsset` has no retry logic — a transient Supabase error silently falls back to empty string, showing a broken image | `useDamAsset.ts:37-39` |
| **LOW** | `visualImages` now has `url: ""` as default. If no DAM asset is uploaded for a slot, `TiltedCard` receives an empty `imageSrc` string and renders nothing, with no placeholder | `constants/discovery.ts` |

### Suggestions

1. **Fix immediately:** Replace `useState(() => {...})` in `VisualCard` with `useEffect(() => {...}, [url])` — **done in this review session**
2. Migrate `useDamAsset` to React Query (`useQuery`) for caching — 18 calls → 0 duplicate network round-trips after first load
3. Add a placeholder skeleton or soft grey fill when `url === ""`
4. Audit `Lifestyle.tsx` — if it still has static asset imports, migrate them under the same `assetKey` pattern
5. Wire `ResultsReveal.tsx` archetype images to a `useDamAsset("archetypes", archetypeId, "hero", "")` call rather than reading from a JSON field

### Risk Assessment

**MEDIUM** — The phase goal (no hardcoded images in bundle) is achieved for Visual Prompts. However DISC-02 (archetype DAM serving in results) and the `useState` hook misuse are substantive gaps that need follow-up.

---

## Phase 8: Collection Workspace — Review

### Summary

Phase 8 delivered a well-structured Collections feature: `CollectionService` as a clean data layer, a tabbed sidebar with inline collection creation, and a live Assign-to-Collection panel in the Inspector. The architecture is sound. Three gaps remain from the written plan that need attention.

### Strengths

- ✅ `CollectionService` has clean separation of concerns — `getCollections` vs `getCollectionWithAssetCount` (avoids over-fetching in Inspector)
- ✅ Tab-switching pattern in `AssetSidebar` is clean and doesn't remount asset components
- ✅ Color-coded type badges (`shoot`, `campaign`, `moodboard_set`, `project_delivery`) aid quick visual scanning
- ✅ Collection filter is correctly threaded through `AssetWorkspaceLayout` → `AssetSidebar` → `AssetService.getAssets(collectionId)`
- ✅ `deleteCollection` safely unassigns all assets before deleting the collection record (no orphan data)
- ✅ Inline collection create form with keyboard shortcuts (`Enter`/`Escape`) is UX-friendly

### Concerns

| Severity | Issue | File |
|----------|-------|------|
| **HIGH** | COLL-03 gap: `MediaUploadZone` does not accept a `collectionId` prop — uploading from within a filtered collection view does NOT auto-assign the new asset to that collection. Success criterion #2 ("Editor can upload 10 images and they all land in the same collection") is **not met** | `MediaUploadZone.tsx` |
| **HIGH** | `CollectionService.getCollectionWithAssetCount` uses `Promise.all` with N separate `.select count` queries — for 50 collections this is 50 sequential Supabase calls. Should use a single `GROUP BY` query or Supabase RPC | `CollectionService.ts:34-44` |
| **MEDIUM** | `queryFn: CollectionService.getCollectionWithAssetCount` (direct reference) was passed without wrapping — React Query injects QueryFunctionContext as first arg, which TypeScript rejects and causes runtime type mismatch. **Fixed in this review session.** | `AssetSidebar.tsx:72` |
| **MEDIUM** | No delete button in the Collections sidebar — `deleteCollection` is implemented but never exposed in UI. Editor cannot remove an empty/misnamed collection | `AssetSidebar.tsx` |
| **MEDIUM** | No rename capability for collections. Name typos are permanent after creation | — |
| **LOW** | `asset_count` in sidebar is not reactive to asset assignment changes — collection card count doesn't update when you assign an asset from the Inspector unless the full sidebar re-mounts | `AssetSidebar.tsx` |

### Suggestions

1. **Fix immediately (COLL-03):** Add `collectionId?: string | null` prop to `MediaUploadZone` and pass it through to `assignAssetToCollection` after upload succeeds
2. **Fix `N+1` query:** Replace `Promise.all` count queries with a Supabase `.rpc()` or use `.select("*, assets(count)")` with the Supabase PostgREST embedded resource count
3. Add delete (trash icon) and rename (pencil icon) controls to collection rows in sidebar
4. Invalidate `["dam", "collections"]` query in `AssetSidebar` after `assignMutation` in `AssetInspector` succeeds (cross-component cache invalidation)

### Risk Assessment

**MEDIUM** — Core browsing UX is complete. The upload-into-collection gap (COLL-03) blocks the primary workflow. The N+1 query is a scalability time bomb at production asset volumes.

---

## Phase 9: Archive & Governance — Pre-Review (Plan Not Yet Written)

### Summary

Phase 9 does not yet have a `09-PLAN.md`. This pre-review outlines the expected scope from the ROADMAP and flags known risks to consider when writing the plan.

### Roadmap Requirements

- **GOV-01:** Soft deletion — archive assets without destroying them
- **GOV-02:** Usage guard — prevent deletion of assets still referenced by `asset_usages`
- **GOV-03:** "Archive by default, delete as exceptional" workflow

### Known Risks to Address in the Plan

| Severity | Risk | Notes |
|----------|------|-------|
| **HIGH** | `status` enum on `assets` table already has `archived` — but there is no UI to trigger it, no RLS policy change, and no query-level filter to exclude archived assets from normal views | Schema exists; UI + filtering layer missing |
| **HIGH** | Usage guard requires a check against `asset_usages` table before any delete/archive operation — this must be a DB-level constraint or a pre-flight check in `AssetService` | Currently zero enforcement |
| **HIGH** | `deleteCollection` in `CollectionService` directly calls `.delete()` with no usage guard — a collection containing assets still referenced by Discovery archetypes can be hard-deleted today | `CollectionService.ts:67-80` |
| **MEDIUM** | `AssetActionsPanel` in Inspector has a "Delete Asset" button that fires with no confirmation beyond the UI — no usage pre-check, no soft-delete logic | `AssetInspector.tsx:204-224` |
| **MEDIUM** | There is no "Archived" view in the sidebar — once an asset is archived, it becomes invisible with no recovery path in current UI | — |
| **LOW** | `asset_status_enum` likely includes `deleted` — need to verify RLS policies treat this as soft-delete vs hard-delete | `dam_v3_schema.sql` |

### Suggested Plan Structure for Phase 9

1. **`AssetService.archiveAsset(id)`** — sets `status = 'archived'`, never hard-deletes
2. **`AssetService.deleteAsset(id)`** — pre-flight check against `asset_usages`; throws if references exist; otherwise hard-deletes
3. **`AssetService.getAssets()`** — add `status !== 'archived'` filter by default; add `showArchived` flag for admin view
4. **Archive toggle in Inspector** — replace "Delete Asset" danger button with "Archive" primary action + "Permanently Delete" (only enabled when no usages)
5. **Archived tab in sidebar** — shows soft-deleted assets with restore option
6. **Usage guard for collections** — before deleting a collection, check if any of its assets have active `asset_usages`

---

## Consensus Summary

### Agreed Strengths (across all phases)

- Consistent service-layer pattern (`AssetService`, `CollectionService`) — clean separation of concerns
- React Query used correctly throughout (after fixes) for data fetching
- DAM `assetKey` convention is well-thought-out and scalable
- The `useDamAsset` hook's fallback mechanism is a good resilience pattern

### Agreed Concerns (highest priority)

1. **N+1 query pattern in `CollectionService.getCollectionWithAssetCount`** — will degrade at scale
2. **Upload-into-collection gap** — COLL-03 success criterion not met
3. **Phase 9 urgency** — `deleteCollection` and Inspector's Delete button have zero usage guards today; real data can be destroyed accidentally

### Divergent Views / Tradeoffs

- The `useDamAsset` hook vs React Query: using raw `useEffect` is simpler but foregoes caching. At 18 cards × multiple sessions, caching matters — but for now it works.
- `activeCollectionId` kept in component state (not URL) by design — intentional tradeoff for simplicity; revisit if users need shareable collection URLs.
