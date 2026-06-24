---
phase: 7
phase_name: "Discovery Integration"
project: "Cross Angle Interior — DAM V3"
generated: "2026-06-22T17:27:00Z"
counts:
  decisions: 4
  lessons: 4
  patterns: 3
  surprises: 2
missing_artifacts:
  - "07-VERIFICATION.md"
  - "07-UAT.md"
---

# Phase 7 Learnings: Discovery Integration

## Decisions

### Use `assetKey` Convention for DAM Slot Addressing

The `useDamAsset(domain, entityId, role, fallback)` API was chosen as the
resolution pattern. Visual cards use keys like `discovery/visual-1/visual`.
This is an implicit namespace — not stored in any config, just a convention.

**Rationale:** Avoids a separate lookup table or enum; admins can upload
assets with matching `domain`/`entity_id`/`role` values to "slot" them into
the correct position without any code changes.
**Source:** 07-PLAN.md, useDamAsset.ts

---

### Keep Static `img.url` as Fallback, Not Error State

When the DAM returns no result for a slot, `useDamAsset` returns
`fallbackUrl` (the original static URL or empty string). This keeps Discovery
functional even with an unpopulated DAM.

**Rationale:** Discovery is a revenue-generating flow; a broken image on
first launch would be critical. Gradual migration (DAM overrides static) is
safer than a hard cutover.
**Source:** 07-PLAN.md, useDamAsset.ts

---

### `VisualCard` as a Per-Image Component with Its Own Hook Call

Instead of bulk-fetching all 18 visual image URLs in the parent component,
each `VisualCard` calls `useDamAsset` independently. This means 18 separate
Supabase queries.

**Rationale:** Simpler component architecture. The trade-off (N queries) was
accepted as a Phase 7 pragmatic choice; identified in the Phase 7 review as
a future concern to address via React Query caching.
**Source:** 07-PLAN.md, VisualInstinct.tsx

---

### Archetype Hero + Moodboard Stored in `asset_usages`, Not in Archetype JSON

Archetype images are linked via `asset_usages(entity_type="archetypes",
entity_id={archetypeId}, role="hero|moodboard")` rather than embedding a
`heroImageUrl` JSON field in the archetype record.

**Rationale:** Preserves the DAM's usage tracking graph. Every image
reference flows through `asset_usages`, enabling future garbage collection
and usage audits.
**Source:** 07-PLAN.md, ArchetypesEditor.tsx

---

## Lessons

### `useState` Lazy Initializer Is Not a Side-Effect Mechanism

`VisualCard` initially used `useState(() => { new Image().src = url; })` as
a lazy initializer to preload images. This fires once on mount but does NOT
react to the `url` changing (when `useDamAsset` resolves asynchronously).
Discovered during Phase 7 review.

**Context:** The lazy initializer runs before `useDamAsset` has returned a
DAM URL, so the preload always used the fallback URL. When the DAM URL
resolved, no image was preloaded. Fixed by replacing with
`useEffect([url, img.id, markLoaded])`.
**Source:** 07-REVIEWS.md, VisualInstinct.tsx

---

### `queryFn` Must Be Wrapped — Never Pass Service Methods Directly

Passing `queryFn: ServiceClass.method` causes React Query to inject its
`QueryFunctionContext` object as the first argument to the method. Methods
with optional parameters silently treat the context as the parameter value,
causing type mismatches or wrong DB queries. Affected: `AssetService.getAssets`,
`CollectionService.getCollectionWithAssetCount`.

**Context:** This was caught during Phase 8 implementation. The rule: always
wrap with `() => ServiceClass.method(args)`.
**Source:** 07-REVIEWS.md, AssetSidebar.tsx, AssetInspector.tsx

---

### Static Asset Imports Must Be Removed Explicitly — They Don't Self-Prune

The build does not automatically tree-shake image imports that are no longer
referenced in rendering paths. `constants/discovery.ts` had 18 `import
visual1 from "..."` statements that remained in the bundle even after the
rendering was migrated to DAM URLs.

**Context:** Required a deliberate audit and deletion step. Also required
physically deleting the image files from `assets/discovery/` to prevent
future accidental re-imports.
**Source:** 07-PLAN.md, 07-SUMMARY.md

---

### `useDamAsset` Does Not Cache — 18 Supabase Calls Per Discovery Session

Because `useDamAsset` uses raw `useEffect` + `useState` instead of React Query,
each `VisualCard` component makes an independent `supabase.from(...).select()`
call. With 18 cards, that's 18 round-trips on every Discovery session start
with no deduplication.

**Context:** Acceptable for an early prototype. Identified in Phase 7 review
as requiring migration to `useQuery` with a shared query key like
`["dam", "asset-usage", domain, entityId, role]`.
**Source:** 07-REVIEWS.md

---

## Patterns

### Slot-Based DAM Resolution with `(domain, entityId, role)` Triplet

Any static image in the app can be "upgraded" to a DAM-managed image by:
1. Defining a `(domain, entityId, role)` triplet for the slot
2. Calling `useDamAsset(domain, entityId, role, fallbackUrl)`
3. Uploading a matching asset via the admin with those three values set

**When to use:** Anytime a static hardcoded image needs to become
admin-configurable without changing component code. Works for backgrounds,
archetype images, lifestyle photos, etc.
**Source:** useDamAsset.ts, VisualInstinct.tsx, ArchetypesEditor.tsx

---

### `VisualCard` Subcomponent Pattern for Per-Item Data Fetching

Extract a per-item subcomponent (`VisualCard`, `LifestyleCard`, etc.) that
owns its own data-fetching hook call. The parent only maps over the data
array and renders subcomponents. Each card's loading state is isolated.

**When to use:** When rendering a grid of N items where each needs an
independent async lookup (DAM URL, pricing, availability). Prevents the
parent from managing N separate loading states.
**Source:** VisualInstinct.tsx

---

### Fallback-First DAM Integration

Start with `fallbackUrl = originalStaticUrl`. Migrate to DAM uploads
gradually. The UI degrades gracefully to static until the DAM is populated.

**When to use:** When migrating existing static assets to DAM without
requiring all assets to be uploaded before the feature is deployed.
**Source:** useDamAsset.ts, constants/discovery.ts

---

## Surprises

### `ResultsReveal.tsx` Uses Archetype JSON, Not DAM at Runtime

The plan stated DISC-02 required updating `useFlowConfig`/the Discovery
payload to serve DAM assets for Archetypes. In practice, `ResultsReveal.tsx`
reads `heroImageUrl` from the archetype JSON returned by the flow config —
this field is populated when the admin saves an archetype with an asset
picker, so it works. But it's a different mechanism than the `useDamAsset`
hook used by `VisualInstinct.tsx`.

**Impact:** Two different DAM resolution patterns now exist in the same
feature. The archetype path stores the URL in the archetype record; the
visual path resolves at runtime via `asset_usages`. This divergence should
be normalized in a future phase.
**Source:** 07-REVIEWS.md

---

### Lifestyle Images Were Not Present as Static Imports — Nothing to Migrate

The plan assumed `Lifestyle.tsx` had static image imports similar to
`VisualInstinct.tsx`. On review, `Lifestyle.tsx` uses text-based lifestyle
questions, not images. No image migration was needed.

**Impact:** Saved ~30 minutes of expected work. The DISC-03 requirement for
Lifestyle was already satisfied by the data architecture (questions are text,
not images).
**Source:** 07-SUMMARY.md
