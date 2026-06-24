# Phase 07: Discovery Integration — DAM Consumer Architecture

> **Revised:** 2026-06-23
> **Architecture Decision:** Discovery is a DAM Consumer, not a DAM Manager.
> Discovery cannot upload, delete, or create assets. It can only select existing
> assets from the Media Library and replace fixed media slots.

---

## Goal

Wire all Discovery Engine media slots to the DAM relationship graph.
Every Discovery visual becomes a named, replaceable slot resolved from `asset_usages`.
No upload workflow exists inside Discovery. No hardcoded asset paths remain.

---

## Mental Model

```
Media Library        Discovery Module
      ↓                     ↓
 Owns Assets           Uses Assets
      ↓                     ↓
  asset_usages  ←───  replaceUsage()
```

Discovery stores only **asset usage relationships**, never file ownership.

---

## Phase Boundaries

### In Scope

- D1: Fix `useDamAsset` anti-pattern → `useDiscoveryAsset` hook (React Query)
- D2: Fix `ArchetypesEditor` entity ID to be name-slug-based (stable, not index-based)
- D3: Build `DiscoveryAssetsPanel` — a fixed-slot grid for all Discovery media (new tab in Admin)
- D4: Migrate `VisualInstinct.tsx` from `useDamAsset` to `useDiscoveryAsset` + add placeholder
- D5: Update `ResultsReveal.tsx` to read archetype images from DAM, not JSON field
- D6: Collection-aware picker — when opening from Discovery, pre-filter to `domain=discovery`
- D7: Add "Media Slots" tab to `AdminDiscoveryConfig`

### Out of Scope

- Uploading assets from inside Discovery
- Creating/deleting collections from Discovery
- Discovery asset versioning
- Phase 9 governance features (archive/deletion guards)
- Uploading the 18 visual images (operational task for content editors, not a code task)

---

## Architecture

### Fixed Slot Registry

Discovery has three slot types with a deterministic `entity_id` per slot:

| Slot Type | Entity Type | Entity ID Pattern | Role | Count |
|-----------|-------------|-------------------|------|-------|
| Archetype Hero | `archetype` | `arch_{slug}` | `hero` | N archetypes |
| Archetype Moodboard | `archetype` | `arch_{slug}` | `moodboard` | N archetypes |
| Visual Prompt | `discovery_visual` | `visual-{1..18}` | `visual` | 18 |

### Admin Write Path

```
DiscoveryAssetsPanel / ArchetypesEditor
    ↓
MediaPickerField (library-only, domain=discovery)
    ↓
onAssetSelect(asset)
    ↓
AssetUsageService.replaceUsage({ entityType, entityId, role })
    ↓
asset_usages ← updated
```

### Runtime Read Path (Discovery Engine)

```
VisualInstinct / ResultsReveal
    ↓
useDiscoveryAsset(entityType, entityId, role)
    ↓
useQuery(['dam', 'discovery-asset', entityType, entityId, role])
    ↓
asset_usages JOIN assets → url
    ↓
Rendered image (or grey placeholder skeleton if url is empty)
```

---

## Task List

### T1 — Create `useDiscoveryAsset` Hook (React Query Migration)

**File:** `src/hooks/useDiscoveryAsset.ts` (new)

Replace the raw `useEffect` anti-pattern in `useDamAsset` with a proper `useQuery`:

```ts
export function useDiscoveryAsset(
  entityType: string,
  entityId: string,
  role: string,
  fallbackUrl = ''
): { url: string; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['dam', 'discovery-asset', entityType, entityId, role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_usages')
        .select('assets(url)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('role', role)
        .single();
      if (error || !data) return fallbackUrl;
      return (data.assets as { url: string } | null)?.url ?? fallbackUrl;
    },
    staleTime: 1000 * 60 * 5, // 5 min — DAM assets are stable
    enabled: Boolean(entityType && entityId && role),
  });
  return { url: data ?? fallbackUrl, isLoading };
}
```

**Why:** 18 raw `useEffect` fetches = 18 concurrent Supabase calls on every Discovery load.
React Query deduplicates and caches across components.

---

### T2 — Fix `ArchetypesEditor` Entity ID (Stable Slug)

**File:** `src/components/admin/discovery-flow/ArchetypesEditor.tsx`

Current problem: `_id: \`arch_${i}_${a.name}\`` changes if archetypes are reordered → orphaned `asset_usages`.

**Fix:** Name-slug-based entity ID (stable as long as name doesn't change):

```ts
const toEntityId = (name: string) =>
  'arch_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

// In onAssetSelect handlers:
void AssetUsageService.replaceUsage({
  assetId: asset.id,
  entityType: 'archetype',
  entityId: toEntityId(item.name), // ← was: item._id
  role: 'hero',
});
```

---

### T3 — Build `DiscoveryAssetsPanel` + `DiscoveryMediaSlot`

**Files:** 
- `src/components/admin/discovery-flow/DiscoveryAssetsPanel.tsx` (new)
- `src/components/admin/discovery-flow/DiscoveryMediaSlot.tsx` (new)

A fixed-slot grid UI. Shows all 18 Visual Prompt slots and all Archetype slots.

**`DiscoveryMediaSlot` per slot:**
1. Calls `useDiscoveryAsset(entityType, entityId, role)` for current image URL
2. Shows current image preview or grey `animate-pulse` skeleton if empty
3. **Replace** button → opens `UniversalAssetPicker` with `domain="discovery"` pre-filter
4. On asset selected → `AssetUsageService.replaceUsage()` + `queryClient.invalidateQueries(['dam', 'discovery-asset', ...])`
5. **Open In Library** link → `/admin/media` (no upload here)

**Rules enforced in the UI:**
- ❌ No upload button
- ❌ No delete button
- ❌ No collection creation
- ✅ Replace from Library only

---

### T4 — Migrate `VisualInstinct.tsx` to `useDiscoveryAsset`

**File:** `src/components/discovery-flow/VisualInstinct.tsx`

```tsx
// Before (broken useState anti-pattern from prior implementation)
const [url, setUrl] = useState(() => { useEffect(() => {...}); });

// After
const { url, isLoading } = useDiscoveryAsset(
  'discovery_visual',
  `visual-${id}`,
  'visual',
  fallbackUrl
);

// Add placeholder when url is empty:
if (isLoading || !url) {
  return <div className="animate-pulse bg-neutral-800 rounded-lg w-full aspect-square" />;
}
```

---

### T5 — Update `ResultsReveal.tsx` to Read from DAM

**File:** `src/components/discovery-flow/ResultsReveal.tsx`

Current: reads `archetype.heroImageUrl` from JSONB config.
Target: resolves from `asset_usages` with fallback to JSON field.

```tsx
const archetypeEntityId = toEntityId(archetype.name);
const { url: heroUrl } = useDiscoveryAsset(
  'archetype',
  archetypeEntityId,
  'hero',
  archetype.heroImageUrl // fallback to JSON field during migration
);
const { url: moodUrl } = useDiscoveryAsset(
  'archetype',
  archetypeEntityId,
  'moodboard',
  archetype.moodboardImageUrl
);
```

Export `toEntityId` from a shared `src/lib/discovery-utils.ts` so T2 and T5 use the exact same slug logic.

---

### T6 — Collection-Aware Picker Filter in Discovery Context

**File:** `src/components/admin/media/UniversalAssetPicker.tsx`

Add `defaultCollectionFilter?: string` prop. When set, the picker pre-selects that collection on open.

In `DiscoveryMediaSlot`:

```tsx
<UniversalAssetPicker
  domain="discovery"
  role={slot.role}
  defaultCollectionFilter="discovery" // pre-select Discovery collection
  onSelect={handleReplace}
  onClose={() => setPickerOpen(false)}
/>
```

This prevents editors from browsing all portfolio images when looking for a Discovery visual.

---

### T7 — Add "Media Slots" Tab to `AdminDiscoveryConfig`

**File:** `src/pages/admin/AdminDiscoveryConfig.tsx`

Add tab to the existing tab bar:

```tsx
{
  id: 'media',
  label: 'Media Slots',
  icon: ImageIcon,
  description: 'Assign images to Discovery slots from Media Library',
}
```

Tab renders `<DiscoveryAssetsPanel />`.
Tab order: Adjectives · Materials · Lighting · Archetypes · **Media Slots**

---

## Acceptance Criteria

| # | Criterion | Verified By |
|---|-----------|-------------|
| AC-1 | Discovery cannot upload | No upload button visible in Media Slots tab or any slot |
| AC-2 | Visual Prompt resolves from DAM | After Replace: `asset_usages` row exists; Discovery Engine renders the selected image |
| AC-3 | Archetype images resolve from DAM | `ResultsReveal` renders image from `useDiscoveryAsset`, not from JSON `heroImageUrl` |
| AC-4 | Replace updates Asset Workspace | After Replace: `/admin/media` Inspector "Used In" shows Discovery slot |
| AC-5 | Picker pre-filters to discovery | Default picker filter is `domain=discovery` when opened from `DiscoveryMediaSlot` |
| AC-6 | No useEffect fetch anti-pattern | All Discovery DAM lookups use `useQuery` via `useDiscoveryAsset` |
| AC-7 | Empty slot shows placeholder | When no asset assigned, slot shows grey animate-pulse skeleton, not broken image |

---

## Files Created / Modified

| File | Change |
|------|--------|
| `src/hooks/useDiscoveryAsset.ts` | NEW — React Query hook |
| `src/lib/discovery-utils.ts` | NEW — `toEntityId()` shared slug helper |
| `src/components/admin/discovery-flow/DiscoveryAssetsPanel.tsx` | NEW — Fixed-slot grid |
| `src/components/admin/discovery-flow/DiscoveryMediaSlot.tsx` | NEW — Individual slot |
| `src/components/admin/discovery-flow/ArchetypesEditor.tsx` | Fix entity ID to name-slug |
| `src/components/discovery-flow/VisualInstinct.tsx` | Migrate to `useDiscoveryAsset` |
| `src/components/discovery-flow/ResultsReveal.tsx` | Read archetype images from DAM |
| `src/pages/admin/AdminDiscoveryConfig.tsx` | Add Media Slots tab |
| `src/components/admin/media/UniversalAssetPicker.tsx` | Add `defaultCollectionFilter` prop |

---

## What This Phase Intentionally Does NOT Do

- ❌ Upload assets from within Discovery
- ❌ Delete or archive assets  
- ❌ Create collections inside Discovery
- ❌ Replace hardcoded constants with file uploads (operational task, not code task)

These belong to Phase 8 (Collection Workspace), Phase 9 (Governance), or content operations.

