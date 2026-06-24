# Cross-AI Plan Review Request

You are reviewing the *implementation* of a completed software phase, not just the plan. Compare what was **planned** versus what was **actually built**. Provide structured feedback on correctness, completeness, and any gaps or risks.

## Project Context

**Cross Angle Interior Web Application** — Luxury interior design studio CMS.

**Current Milestone: v3.0 DAM V3 Workspace**
Goal: Transition the CMS Media Library from a simple "FTP client" into a true Asset Workspace with Archive & Governance.

The DAM architecture is:
- `assets` table: central asset registry with `status` enum: `uploading | processing | ready | failed | archived`
- `asset_usages` table: tracks which entities (projects, pages, etc.) reference each asset
- `asset_versions` table: version history per asset
- `asset_collections` table: grouping mechanism

## Phase 9: Archive & Governance

### Requirements

- **GOV-01:** Soft deletion — archive assets without destroying storage or usage records.
- **GOV-02:** Usage guard — prevent hard deletion of any asset that still has active `asset_usages` rows.
- **GOV-03:** "Archive by default, delete as exceptional" workflow in the UI.

### What Was Planned

1. `AssetService` — `archiveAsset(id)`, `restoreAsset(id)`, `deleteAsset(id)` with pre-flight usage check
2. `AssetInspector` — Archive (amber) as primary, Delete (red) as secondary. If archived: show Restore. Delete dialog shows usage list, blocks delete if usages > 0.
3. **Archived tab in sidebar** — shows `status=archived` assets with Restore and Delete-from-archive capability.
4. Collection delete guard — `CollectionService.deleteCollection()` checks asset usages before proceeding.
5. `DeleteConfirmDialog` — shows usage count and details, disables confirm if in-use.

---

## Actual Implementation

### AssetService.ts (COMPLETE)

```typescript
export class AssetInUseError extends Error {
  constructor(public readonly usages: AssetUsageRow[]) {
    super(`Asset is still referenced by ${usages.length} usage(s) and cannot be deleted.`);
    this.name = "AssetInUseError";
  }
}

export const AssetService = {
  async getAssets(collectionId?, opts?): Promise<AssetRow[]> {
    // By default, excludes archived assets
    if (!opts?.showArchived && !opts?.status) {
      query = query.neq("status", "archived");
    }
    // ...domain/role/unused filters also available
  },

  async getArchivedAssets(): Promise<AssetRow[]> {
    // Fetches only status=archived assets
  },

  async archiveAsset(id: string): Promise<void> {
    // Sets status='archived'
  },

  async restoreAsset(id: string): Promise<void> {
    // Sets status='ready'
  },

  async deleteAsset(id: string): Promise<void> {
    // Pre-flight: getAssetUsages() → throws AssetInUseError if usages > 0
    // Then hard-deletes from `assets` table only (NOT asset_versions or storage bucket)
  },

  async getAssetUsages(assetId: string): Promise<AssetUsageRow[]> {
    // Returns all rows from asset_usages for this asset
  },
};
```

### CollectionService.ts (COMPLETE with guard)

```typescript
async deleteCollection(collectionId: string): Promise<void> {
  // 1. Find all assets in collection
  // 2. Query asset_usages for those asset IDs
  // 3. If any usages found → throw AssetInUseError
  // 4. Unassign assets (set collection_id=null)
  // 5. Delete the collection record
},
```

### AssetInspector.tsx — AssetActionsPanel (COMPLETE)

```tsx
function AssetActionsPanel({ asset }) {
  const { data: usages = [], isLoading: usagesLoading } = useQuery({
    queryKey: ["dam", "asset_usages", asset.id],
    queryFn: () => AssetService.getAssetUsages(asset.id),
  });

  // archiveMutation: sets status=archived
  // restoreMutation: sets status=ready
  // deleteMutation: calls AssetService.deleteAsset with onError for AssetInUseError

  const isArchived = asset.status === "archived";

  return (
    <div>
      <h3>Governance</h3>
      <div>
        {isArchived ? (
          <Button onClick={restoreMutation}>Restore</Button>
        ) : (
          <Button amber onClick={archiveMutation}>Archive</Button>
        )}
        <Button destructive disabled={usagesLoading} onClick={() => setDeleteDialogOpen(true)}>
          Delete
        </Button>
      </div>
      <Dialog>
        {/* Shows usage list if usages > 0, blocks Delete button */}
        {/* If usages === 0: standard irreversible confirmation */}
      </Dialog>
    </div>
  );
}
```

### AssetSidebar.tsx — Archived Tab

**STATUS: NOT IMPLEMENTED**

The plan called for a third tab "Archived" in the sidebar. This was NOT built. The sidebar currently has only two tabs (All Assets / Collections).

No `getArchivedAssets()` call is wired into the sidebar. No "Restore" button in a grid view. No hard-delete from archived view.

---

## Review Instructions

Analyze the gap between plan and implementation, and provide:

1. **Summary** — One-paragraph assessment of overall implementation quality
2. **Strengths** — What's well-designed (bullet points)
3. **Gaps vs Plan** — What's missing compared to the original spec (bullet points, each with severity: HIGH/MEDIUM/LOW)
4. **Concerns** — Risks or bugs in the current implementation (bullet points with severity)
5. **Suggestions** — Specific improvements with approximate effort
6. **Risk Assessment** — Overall risk level (LOW/MEDIUM/HIGH) with justification

Focus on:
- User trust: can a user accidentally destroy data?
- Whether the success criteria are actually met
- Edge cases in the usage guard logic
- The impact of the missing Archived tab
- Whether `deleteAsset` only deletes from the DB but NOT storage (potential orphan files)

Output your review in markdown format.
