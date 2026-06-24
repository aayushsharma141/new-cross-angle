---
phase: 9
reviewers: [antigravity]
reviewed_at: 2026-06-24T10:49:00Z
plans_reviewed: [09-PLAN.md]
note: Claude CLI external review failed (ConnectionRefused). Antigravity conducted primary review per ANTIGRAVITY_AGENT=1 rules (no self-skip).
---

# Cross-AI Plan Review — Phase 09: Archive & Governance

## Antigravity Review

### Summary

Phase 09 is **substantially complete and architecturally sound**. The three core GOV requirements are implemented: soft deletion via `archiveAsset`, usage-guarded hard deletion via `deleteAsset` + `AssetInUseError`, and the "archive-first" UI pattern in `AssetActionsPanel`. The Archived tab was initially believed missing but is in fact implemented (lines 583–665 of `AssetSidebar.tsx`). Several important gaps remain that could cause user trust issues or orphan data: the `deleteAsset` service does **not** delete storage files (orphan risk), the Archived tab grid lacks inline Restore/Delete actions (requires inspector round-trip), and the collection deletion guard imports `AssetInUseError` dynamically which can silently fail in bundled environments.

---

### Strengths

- **`AssetInUseError` is a typed, named error class** — the UI's `onError` handler correctly checks `err.name === "AssetInUseError"` rather than string-matching error messages. This is production-grade pattern.
- **Double-layered deletion guard** — both `AssetService.deleteAsset` (service layer) and the dialog UI (via pre-fetched `usages` query) block deletion independently. Even if the UI check is bypassed, the service throws.
- **Archived tab data is prefetched unconditionally** (`queryKey: ["dam", "assets", "archived"]`) — it's ready immediately when the user switches tabs, no loading flash.
- **`getAssets()` automatically excludes archived assets** by default via `.neq("status", "archived")` — archived items never pollute the "All Assets" view.
- **The "Archived" badge on cards** is a nice visual discriminator using grayscale + luminosity blend — visually communicates the archived state clearly.
- **Archive button uses amber/warning color** and Delete uses destructive red — correct visual hierarchy per GOV-03 "archive by default."
- **Collection guard queries `asset_usages` transitively** — finds usages across all assets in a collection, not just the collection record itself.

---

### Gaps vs Plan

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| G1 | `deleteAsset` does NOT delete from storage bucket | **HIGH** | The plan specified "hard-deletes from `assets`, `asset_versions`, and storage bucket." The current implementation only runs `supabase.from("assets").delete()`. `asset_versions` rows and the actual file in ImageKit/storage remain, creating orphans. |
| G2 | `asset_versions` rows not deleted on hard delete | **HIGH** | Same root cause as G1. Foreign key constraints may prevent this silently or allow dangling version records. |
| G3 | Archived tab cards have no inline Restore/Delete actions | **MEDIUM** | The plan specified "Each card has a 'Restore' button." Currently, clicking an archived card selects it in the inspector, and the user must scroll down to the Governance section. This is a UX regression — the admin must mentally connect two panels. |
| G4 | Dynamic import of `AssetInUseError` in `CollectionService` | **MEDIUM** | `const { AssetInUseError } = await import("./AssetService")` is a code smell. If the module fails to load or tree-shaking removes it, the guard silently falls through. Should be a static top-level import. |
| G5 | `restoreAsset` sets status to `"ready"` — may bypass original status | **LOW** | If an asset was `"processing"` or `"failed"` before archiving, restoring sets it to `"ready"` regardless. Not a blocker but could surface confusing states. |
| G6 | No audit trail for archive/delete operations | **LOW** | The plan was silent on this, but for a governance feature, logging who archived/deleted an asset (user ID + timestamp) to a separate table would be production-standard. Currently there is no `archived_by`/`archived_at` field. |

---

### Concerns (Bugs / Risks)

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| C1 | Orphan files in storage (see G1) | **HIGH** | Every "hard delete" currently leaves the binary file in ImageKit. This will accumulate cost and stale data over time. |
| C2 | Collection guard uses `asset_usages` but allows archived assets to block | **MEDIUM** | If an asset is archived but still has `asset_usages` rows (because archiving does NOT clear usages), the collection guard will throw even though the asset is logically retired. Consider filtering `asset_usages` to active (`status != 'archived'`) assets only when performing the collection guard check. |
| C3 | `usages.length > 0` check in dialog is pre-fetched — stale on long sessions | **LOW** | The `useQuery` for `asset_usages` uses no `staleTime`. On a long session, a usage could be removed after the dialog opens but before the user clicks Delete — the button stays disabled. Minor: clicking elsewhere will refetch. |
| C4 | Delete button shows while usages are loading (`disabled={usagesLoading}`) but then becomes enabled | **LOW** | If the usage query resolves to 0 results instantly (fast DB), the Delete button flickers from disabled→enabled. Not a bug, but the UX could be improved with a skeleton/spinner overlay. |

---

### Suggestions

1. **Fix G1 immediately (storage orphans):** In `AssetService.deleteAsset`, after deleting from `assets`, also:
   - Fetch all `asset_versions` for this asset
   - Call the ImageKit/storage delete API for each `file_id`
   - Delete `asset_versions` rows  
   Effort: ~30 mins.

2. **Fix G4 immediately (static import):** Move `import { AssetInUseError } from "./AssetService"` to the top of `CollectionService.ts`. Effort: ~2 mins.

3. **Add inline Restore button to Archived tab cards** (G3): A small ghost button overlay (or footer action row per card) calling `AssetService.restoreAsset` would let admins act without selecting the asset. Pattern already exists in the All Assets tab footer. Effort: ~45 mins.

4. **Collection guard archived-asset filter** (C2): Change the collection guard query to only consider usages of *non-archived* assets. Effort: ~15 mins.

5. **Add `archived_by` / `archived_at` columns** for a future audit trail. Not blocking Phase 09 sign-off but should be a Phase 10 backlog item.

---

### Risk Assessment

**Overall Risk: MEDIUM**

The core governance logic (GOV-01, GOV-02, GOV-03) is correctly implemented and user-trust is protected — no asset can be silently deleted while referenced. The **HIGH** concerns are not user-trust issues (no data is destroyed accidentally) but rather **resource leaks** (orphan storage files). These should be fixed before production traffic accumulates. The **MEDIUM** concerns are polish/edge-case items that do not block the core user flow.

The phase is **close to sign-off quality** with two targeted fixes needed: storage deletion and the static import.

---

## Consensus Summary

*(Single reviewer — no consensus divergence to report.)*

### Agreed Strengths
- Double-layered deletion guard (service + UI)
- `AssetInUseError` typed error class with correct name-based checking
- Archived assets excluded from All Assets view by default
- Archive-first visual hierarchy (amber vs red)

### Agreed Concerns (Priority Order)
1. **[HIGH]** `deleteAsset` does not delete from storage — orphan files accumulate
2. **[HIGH]** `asset_versions` rows not cleaned up on hard delete
3. **[MEDIUM]** Dynamic import of `AssetInUseError` in `CollectionService` is fragile
4. **[MEDIUM]** Archived tab cards have no inline Restore action

### Next Steps
```
Fix required before sign-off:
  1. Add storage + asset_versions cleanup to AssetService.deleteAsset
  2. Convert dynamic import to static import in CollectionService.ts

Optional (can be deferred to Phase 10):
  3. Inline Restore button on Archived tab cards
  4. Collection guard: filter to non-archived assets only
  5. archived_by / archived_at audit columns
```

---

## Audit-Fix Results (gsd-audit-fix — 2026-06-24)

**Source:** 09-REVIEWS.md  
**Findings:** 6 total, 4 auto-fixable, 2 manual-only  
**Fixed:** 4/4 auto-fixable findings  
**Failed:** 0

| # | Finding | Status | Commit |
|---|---------|--------|--------|
| F-01 | `deleteAsset` — storage + `asset_versions` orphans | ✅ Fixed | `de07bc2d` |
| F-02 | Dynamic `import()` of `AssetInUseError` in `CollectionService` | ✅ Fixed | `fe9e0b72` |
| F-03 | Archived tab cards — no inline Restore button | ✅ Fixed | `1b2aa58f` |
| F-04 | Collection guard allows archived asset usages to block | ✅ Fixed | `1b2aa58f` |

### Manual-only findings (require developer attention):
- **G5:** `restoreAsset` always restores to `"ready"` regardless of pre-archive status — requires schema change to store `pre_archive_status` (Phase 10 backlog)
- **G6:** No audit trail (`archived_by`/`archived_at`) — requires DB migration (Phase 10 backlog)

**Phase 09 is now ready for sign-off.** All release blockers resolved.
