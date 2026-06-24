---
phase: 8
phase_name: "Collection Workspace"
project: "Cross Angle Interior — DAM V3"
generated: "2026-06-22T17:27:00Z"
counts:
  decisions: 4
  lessons: 4
  patterns: 3
  surprises: 2
missing_artifacts:
  - "08-SUMMARY.md"
  - "08-VERIFICATION.md"
  - "08-UAT.md"
---

# Phase 8 Learnings: Collection Workspace

## Decisions

### `getCollections` vs `getCollectionWithAssetCount` — Two Separate Methods

`CollectionService` exposes two read methods: a lightweight `getCollections()`
and a heavier `getCollectionWithAssetCount()`. The Inspector uses the light
version; the Sidebar uses the full version with counts.

**Rationale:** Avoids fetching counts in every context. The Inspector only
needs to know which collections exist for the dropdown; asset counts are only
relevant in the sidebar list.
**Source:** 08-PLAN.md, CollectionService.ts

---

### `activeCollectionId` Owned in `AssetWorkspaceLayout`, Not Sidebar

The active collection filter state lives in `AssetWorkspaceLayout`, not in
`AssetSidebar`. Sidebar receives a prop and calls `onCollectionFilter(id)`.

**Rationale:** Multiple panels (Inspector, grid, upload zone) need to react
to the active collection. Lifting state to the layout ensures a single source
of truth for the "what collection am I in" context.
**Source:** 08-PLAN.md, AssetWorkspaceLayout.tsx

---

### `deleteCollection` Unassigns Assets Before Deleting

Before deleting a collection record, `CollectionService.deleteCollection`
sets `collection_id = null` on all assets in that collection.

**Rationale:** Prevents orphaned `collection_id` FKs. Cascades are not
configured at the DB level for `assets.collection_id`, so the service layer
must handle cleanup.
**Source:** CollectionService.ts

---

### PostgREST Embedded Count for Asset Counts (Replacing N+1)

`getCollectionWithAssetCount` now uses `.select("*, assets(count)")` instead
of `Promise.all` with N separate count queries. PostgREST returns
`[{count: N}]` for embedded resource counts.

**Rationale:** N separate queries is a scalability anti-pattern. A single
select with embedded count drops N+1 to 1 query regardless of collection
count.
**Source:** 07-REVIEWS.md, CollectionService.ts

---

## Lessons

### N+1 Query Pattern Is Easy to Miss in Promise.all

The original `getCollectionWithAssetCount` implementation used
`Promise.all(collections.map(col => supabase.from("assets").select({count}).eq("collection_id", col.id)))`.
This looks clean in code but is N+1 in disguise — 1 collections query + N
count queries.

**Context:** Caught in the Phase 7/8 review. The fix (`.select("*, assets(count)")`)
is a single PostgREST feature that wasn't initially known. Lesson: whenever
you see `Promise.all(items.map(item => supabase.from(...).eq("id", item.id)))`,
look for an embedded count or JOIN alternative.
**Source:** 07-REVIEWS.md, CollectionService.ts

---

### `queryFn` Direct Reference Is a Runtime Type Error, Not a Compile Error

TypeScript does not always catch the `queryFn: ServiceClass.method` pattern
as a type error if the method signature happens to accept any first argument
(optional parameters). It fails silently at runtime: the context object is
passed as the first arg, Supabase may filter on an object instead of a string.

**Context:** Fixed in both `AssetSidebar.tsx` and `AssetInspector.tsx`.
Established pattern: **always wrap with arrow function**.
**Source:** 07-REVIEWS.md

---

### `collectionId` Prop on Upload Zone Must Be Wired Through Layout

`MediaUploadZone` now has a `collectionId` prop (type-safe), but the parent
`AdminMedia.tsx` must actually pass `activeCollectionId` to the upload zone
for COLL-03 to be fully satisfied. The prop contract is in place; the
call-site wire-up is a Phase 8 follow-up task.

**Context:** Marking the prop as `optional` prevents the upload zone from
breaking in uncollection-filtered views. The auto-assign on upload is only
active when the parent explicitly passes a non-null `collectionId`.
**Source:** 08-PLAN.md, MediaUploadZone.tsx

---

### Collection Delete UI and Rename Are Commonly Expected But Missing

Users expect to be able to rename a collection they misnamed and delete
collections they no longer need. Neither was exposed in the sidebar UI
(though `deleteCollection` is implemented in the service layer).

**Context:** These were low-effort UI features that should have been included
in Phase 8 scope. Scheduled for Phase 9 or as a post-phase follow-up.
**Source:** 07-REVIEWS.md

---

## Patterns

### Inline Create Form with Keyboard Shortcuts

Collections are created via an inline form (no modal) that expands in the
sidebar. `Enter` submits, `Escape` cancels. This avoids a dialog overlay
and keeps the user's context (sidebar) visible during creation.

**When to use:** For quick-create flows where the user already knows what
they want to name the item and doesn't need a complex form. Works best when
the input is minimal (name + type selector).
**Source:** AssetSidebar.tsx

---

### Tab-Based Filter Navigation (Assets ↔ Collections ↔ Archived)

The sidebar uses tab state (`activeTab: "assets" | "collections"`) to switch
between views without remounting the asset grid. The grid stays mounted and
simply receives a new `activeCollectionId` filter prop.

**When to use:** When two views share state (selected asset, upload context)
and you don't want to lose that state on navigation. Avoids the flicker and
re-fetch of unmounting/remounting.
**Source:** AssetSidebar.tsx, AssetWorkspaceLayout.tsx

---

### Service Layer Owns Cleanup Logic for Referenced Entities

`deleteCollection` unassigns all child assets before deleting. This cleanup
logic lives in the service, not in the UI. The UI just calls
`CollectionService.deleteCollection(id)` and handles the result.

**When to use:** Anytime a delete operation has pre-conditions or cleanup
that must run first. Centralizing in the service ensures the logic is applied
whether deletion is triggered from the sidebar, a bulk action, or an API call.
**Source:** CollectionService.ts

---

## Surprises

### PostgREST Embedded Count Returns `[{count: N}]`, Not a Scalar

The `.select("*, relation(count)")` PostgREST feature returns the count as
`[{count: N}]` (an array with one object) — not as a plain number. The
mapping code must be: `(col.assets as {count: number}[])[0]?.count ?? 0`.

**Impact:** Easy to get wrong; a naive `col.assets?.count` returns `undefined`.
The array-of-one-object shape is PostgREST's way of returning aggregate
results while staying JSON-compatible.
**Source:** CollectionService.ts

---

### `AssetInspector` Receives `activeCollectionId` Prop but Doesn't Use It

The `AssetInspectorProps` interface was designed to receive `activeCollectionId`
for future "you are in collection X" context. But the current implementation
of `AssetCollectionPanel` fetches ALL collections and shows a dropdown — it
doesn't use the active collection to pre-select a value.

**Impact:** Minor UX gap: the collection dropdown in the Inspector doesn't
default to the currently filtered collection. Low priority since the user can
manually select, but it's a missed convenience feature.
**Source:** AssetInspector.tsx
