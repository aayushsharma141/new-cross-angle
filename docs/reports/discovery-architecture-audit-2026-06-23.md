# Discovery Architecture Audit

> **Date:** 2026-06-23
> **Scope:** Asset inventory, DAM role mapping, and consumption strategy for every Discovery screen across the public quiz and admin config.

---

## 1. Role Registry (Canonical Inventory)

The `asset_usages` table uses a freeform `role` string with no DB-level constraint. The canonical roles (observed in `UniversalAssetPicker.tsx`, `ArchetypesEditor.tsx` `MediaPickerField`, and `supabase/migrations/2026062200000*`) are:

| Role | Used By | entity_type |
|------|---------|-------------|
| `hero` | ArchetypesEditor, PortfolioFormDialog, sync triggers | `archetypes`, `portfolio`, `hero_media` |
| `moodboard` | ArchetypesEditor | `archetypes` |
| `gallery` | UniversalAssetPicker (filter dropdown) | various |
| `icon` | UniversalAssetPicker (filter dropdown) | various |
| `general` | UniversalAssetPicker (default) | various |
| `video` | sync triggers | `portfolio` |
| `before` | sync triggers | `transformation_stories` |
| `after` | sync triggers | `transformation_stories` |
| `logo` | sync triggers | `site_settings` |
| `favicon` | sync triggers | `site_settings` |
| `og_image` | sync triggers | `site_settings` |
| `avatar` | sync triggers | `team_members` |

**Discovery domain roles** actually in use: `hero`, `moodboard` (ArchetypesEditor). No other Discovery roles have been registered.

---

## 2. Asset Inventory — Every Discovery Screen

### 2.1 ReflectionPrompt (Quiz Step 1: Lifestyle Reflection)

| Asset | Location | Current Source | Role | Status |
|-------|----------|---------------|------|--------|
| 29 reflection images | `ReflectionPrompt.tsx:9-37` (imports from `@/assets/discovery/`) | Static JPG imports + `assetKeys` array | **No role assigned** | Dual-path: static import as `images[]` and `assetKeys[]` both passed to `ImageOption.tsx` |
| `ImageOption.tsx:62` | `components/reflection/ImageOption.tsx` | `assetKey \|\| discovery_reflect-{label}` fallback + `imageSrc` | `discovery_reflect-*` (convention) | `MediaSlot` tries assetKey first, falls back to static import |

**Role gap:** Reflection images have no formal DAM role. The `assetKey` convention `discovery_reflect-{slug}` is used in `MediaSlot` but no entity_type/entity_id/role triplet is ever created.

### 2.2 VisualInstinct (Quiz Step 3: Visual Preference)

| Asset | Location | Current Source | Role | Status |
|-------|----------|---------------|------|--------|
| 18 visual images | `constants/discovery.ts:11-39` | `url: ""` + `assetKey` via `useDamAsset()` | `visual` (inferred from `useDamAsset("discovery", "visual-{id}", "visual", "")`) | `useDamAsset` resolves via `asset_usages` lookup by assetKey |

**Role gap:** The `useDamAsset("discovery", key, "visual", fallbackUrl)` call passes `"visual"` as a role — but this role is NOT registered in UniversalAssetPicker's dropdown or any Migration sync trigger. It's used only as a freeform filter in the `useDamAsset` hook.

### 2.3 ResultsReveal (Final Result Screen)

| Asset | Location | Source | Role | Status |
|-------|----------|--------|------|--------|
| Hero background | `ResultsReveal.tsx:492-501` | `archetype.heroImageUrl` (always `undefined`) | `hero` | **DEAD CODE** — guarded by `archetype.heroImageUrl &&`, never renders because no archetype populates this field |
| Moodboard background | `ResultsReveal.tsx:801-808` | `archetype.moodboardImageUrl` (always `undefined`) | `moodboard` | **DEAD CODE** — same issue, never renders |
| Visual Mirror images (×3) | `ResultsReveal.tsx:613-659` | `visualMirrorImages[n].assetKey \|\| discovery_visual-{id}` + `fallbackUrl: ""` | `visual` | Uses `MediaSlot` with `assetKey` + empty fallback |

**Critical:** The archetype hero and moodboard fields are never populated in `core/archetype.ts`. The ArchetypesEditor (`components/admin/discovery-flow/ArchetypesEditor.tsx`) already supports setting these via `MediaPickerField` with `damRole="hero"` and `damRole="moodboard"` — but the data never flows back to the public app because:
1. ArchetypeEditor saves to a `useFlowConfig` data source (likely a `discovery_archetypes` table)
2. The `archetype.ts` file has hardcoded archetypes with no image fields
3. The public app imports from `core/archetype.ts`, not from any DB-backed source

### 2.4 LightCalibration

| Asset | Location | Source | Role | Status |
|-------|----------|--------|------|--------|
| Bedroom base image | `LightCalibration.tsx:40` | Hardcoded `/common_bedroom_base.png` | **None** | **Unguarded** — 404s if file missing from public dir |

### 2.5 WelcomeScreen

| Asset | Location | Source | Role | Status |
|-------|----------|--------|------|--------|
| Logo | `WelcomeScreen.tsx:224` | `settings?.company_logo_url \|\| settings?.logo_light_url \|\| logoIcon` | `logo` | Null-safe via fallback chain |
| CTA background | `WelcomeScreen.tsx:584` | Hardcoded `/images/projects/discovery/visual-2.webp` | **None** | **Unguarded** — 404s if missing |
| Fractal noise overlay | `WelcomeScreen.tsx:210` | SVG data URI | **None** | Inline, no issue |

### 2.6 DiscoveryLanding

| Asset | Location | Source | Role | Status |
|-------|----------|--------|------|--------|
| Logo | `DiscoveryLanding.tsx:260` | Same fallback chain as WelcomeScreen | `logo` | Null-safe |
| CTA background | `DiscoveryLanding.tsx:409` | Hardcoded `/images/projects/discovery/visual-2.webp` | **None** | **Unguarded** — duplicate of WelcomeScreen |
| Fractal noise overlay | `DiscoveryLanding.tsx:251` | SVG data URI | **None** | Inline, no issue |

### 2.7 DiscoveryProgressSidebar

| Asset | Location | Source | Role | Status |
|-------|----------|--------|------|--------|
| Logo | `ProgressSidebar.tsx:70` | Same fallback as above | `logo` | Null-safe |

### 2.8 Screens with Zero Visual Assets

These screens consume no images, MediaSlots, or hardcoded URLs:
- AdjectiveSelection, AnalysisPhase, BudgetAlignment, LeadGatePhase, LifestyleReflection, MaterialResonance, MiniResultPreview, PivotQuestion, PropertyReality, ReinterpretationGate, RoomPriority, ProgressBar, QuizErrorBoundary, EmotionalMapping, PatternPreview

---

## 3. Hardcoded Path Summary (Must-Fix)

| Path | Files | Risk |
|------|-------|------|
| `/images/projects/discovery/visual-2.webp` | WelcomeScreen.tsx:584, DiscoveryLanding.tsx:409 | **2 unguarded references** — 404 if file deleted |
| `/common_bedroom_base.png` | LightCalibration.tsx:40 | **1 unguarded reference** — 404 if file missing |

---

## 4. Consumption Strategy — Current vs. Proposed

### 4.1 Screen-by-Screen Strategy

**ReflectionPrompt (Quiz Step 1)**
- **Current:** Dual-path — static JPG imports (`images[]`) + `assetKeys[]` passed to `ImageOption` → `MediaSlot`. The static import is the fallback; `MediaSlot` tries `site_media_assets` first via `assetKey`.
- **Proposed (Option B):** Remove static imports. Use only `assetKey` + `MediaSlot`. Requires all 29 reflection images to be uploaded to DAM with `asset_key` matching `discovery_reflect-{slug}`. Set role to `reflection` (new role registration needed). Fallback: use existing `/images/projects/discovery/` public dir files.

**VisualInstinct (Quiz Step 3)**
- **Current:** `useDamAsset("discovery", "visual-{id}", "visual", "")` — role `"visual"` is a freeform string not in the registry. Uses `asset_usages` → `assets` → `asset_versions` chain. Fallback URL is always empty.
- **Proposed (Option B+):** Register `visual` as a canonical role in UniversalAssetPicker. Otherwise pattern is correct.

**ResultsReveal (Final Screen)**
- **Current:** Archetype hero/moodboard images are hardcoded to `undefined`. Visual mirror images use `MediaSlot` with `assetKey` + empty fallback.
- **Proposed (Option B):** Two-part fix:
  1. Archetype hero/moodboard: data already flows through ArchetypesEditor (admin) → `useFlowConfig("discovery_archetypes")`. Build a `getArchetype()` that merges static defaults with DB-stored archetypes including `heroImageUrl`/`moodboardImageUrl` from the stored data. Remove dead code guard.
  2. Visual mirror: already using correct pattern, but ensure assets exist in DAM for all 18 visual images.

**LightCalibration**
- **Current:** Hardcoded `/common_bedroom_base.png`.
- **Proposed (Option B):** Register a new role `base` and use `MediaSlot` with `assetKey="discovery_base-bedroom"`. Upload to DAM.

**WelcomeScreen / DiscoveryLanding CTA Background**
- **Current:** Hardcoded `/images/projects/discovery/visual-2.webp`.
- **Proposed:** Use `MediaSlot` with appropriate assetKey, register role `cta-background`.

---

### 4.2 Role Registry — New Registrations Needed

| New Role | Used By | entity_type |
|----------|---------|-------------|
| `visual` | VisualInstinct, ResultsReveal | `discovery` |
| `reflection` | ReflectionPrompt (ImageOption) | `discovery` |
| `base` | LightCalibration | `discovery` |
| `cta-background` | WelcomeScreen, DiscoveryLanding | `discovery` |

These must be added to:
1. `UniversalAssetPicker.tsx` filter dropdown (line 160-166)
2. `UniversalAssetPicker.tsx` upload dropdown (line 285-289)
3. `MediaService.ts` domain mapping if needed
4. Any migration that creates canonical role entries

---

## 5. Critical Issues

### C1: Dead Code — Archetype Hero and Moodboard Images
- `archetype.ts` defines 10 archetypes with zero `heroImageUrl` or `moodboardImageUrl`
- `ResultsReveal.tsx:492` and `:801` guard these with `&&` — never renders
- ArchetypesEditor already has `MediaPickerField` with `damRole="hero"` and `damRole="moodboard"` wired to `AssetUsageService.replaceUsage()`
- **Fix:** Archetype definitions need to merge DB-stored data from `useFlowConfig("discovery_archetypes")` with static defaults, so `heroImageUrl` and `moodboardImageUrl` are resolved from `asset_usages` at runtime.

### C2: 3 Unguarded Hardcoded Paths
- `/images/projects/discovery/visual-2.webp` (×2 — WelcomeScreen, DiscoveryLanding)
- `/common_bedroom_base.png` (LightCalibration)
- **Fix:** Migrate to DAM-based pattern with `MediaSlot` + assetKey.

### C3: 29 Static Imports — Build-Time Breakage
- `@/assets/discovery/` directory is empty — 29 imports in `ReflectionPrompt.tsx:9-37` will fail at build time
- These serve as fallbacks in the `ImageOption` → `MediaSlot` dual-path pattern
- **Fix:** Either restore the files to `@/assets/discovery/` (keep as fallbacks) or remove static imports and ensure all images exist in the DAM with matching `asset_key` values.

### C4: `visualImages` Have Empty `url` — No Fallback
- All 18 entries in `constants/discovery.ts` have `url: ""`
- If `useDamAsset()` fails to resolve an asset, the fallback is empty
- `VisualInstinct.tsx` guards with `if (!url) return`, so images fail silently
- **Fix:** Either populate `url` with public path fallbacks, or ensure all 18 assets exist in DAM.

### C5: `lifestyleOptions.ts` Missing
- `types/discovery.ts` defines `LifestyleOption` with `image: string` and `assetKey?: string`
- `apps/web/src/addons/discovery/data/lifestyleOptions.ts` does not exist
- LifestyleReflection component exists but has no image assets to work with

---

## 6. The `useDamAsset` Hook — How It Works

Path: `apps/web/src/hooks/useDamAsset.ts`

```
useDamAsset(domain, assetKey, role, fallbackUrl)
  → queries asset_usages WHERE entity_type=? AND role=? AND entity_id=?
  → joins to assets → asset_versions
  → returns resolved url or fallbackUrl
```

Called as:
- `VisualInstinct.tsx:194`: `useDamAsset("discovery", "visual-{id}", "visual", "")`
  - `domain="discovery"`, `role="visual"`, `entity_id="visual-{id}"`
  - This means `visual-{id}` is used as the `entity_id` in `asset_usages`, NOT the `asset_key`
  - The entity_id convention is `discovery_visual-{id}` (from `constants/discovery.ts`)

**Key distinction:** The `useDamAsset` hook looks up by `entity_id`, while `MediaSlot` looks up by `asset_key` in `site_media_assets`. These are **two separate resolution paths**:
- `useDamAsset` → `asset_usages` (entity_type + entity_id + role) → `assets` → `asset_versions`
- `MediaSlot` → `site_media_assets` (asset_key) → `media_files`

---

## 7. MediaSlot — How It Compares

```
MediaSlot({ assetKey, fallbackUrl })
  → queries site_media_assets WHERE asset_key = ?
  → joins to media_files(url, mime_type)
  → returns url or fallbackUrl
```

Used by:
- `ImageOption.tsx:62` — `assetKey || "discovery_reflect-{slug}"` + fallback `imageSrc` (static import)
- `ResultsReveal.tsx:494, 616, 637, 655, 803` — assets keys `discovery_visual-{id}`, empty fallbacks

**Note:** `site_media_assets` is the OLD table (pre-DAM v3 migration). The new path is `assets → asset_versions` via `asset_usages`. `MediaSlot` was NOT updated in the DAM v3 migration.

---

## 8. Discovery Admin — Existing Infrastructure

| Admin Page | Route | Purpose | Asset Integration |
|-----------|-------|---------|------------------|
| Quiz Analytics | `/admin/discovery/quiz-analytics` | Funnel, retention, lead tracking | PostHog only, no media |
| Quiz Configuration | `/admin/discovery/quiz-configuration` | Edit adjectives, materials, lighting, archetypes | Archetypes tab uses `MediaPickerField` with `damRole="hero"` / `moodboard` |

The ArchetypesEditor (`components/admin/discovery-flow/ArchetypesEditor.tsx:180-227`) already implements the correct pattern:
1. User selects asset via `MediaPickerField` (which uses `UniversalAssetPicker`)
2. `onAssetSelect` callback fires → `AssetUsageService.replaceUsage({ assetId, entityType: "archetype", entityId, role: "hero" })`
3. The `asset_usages` record is created linking the asset to the archetype entity

This means the **admin write path is already correct**. The problem is entirely in the **public read path**: `core/archetype.ts` returns hardcoded archetypes instead of the DB-backed ones with images.

---

## 9. Decision Matrix — Consumption Strategy Option B (Recommended)

| Screen | Strategy | Work Required | Dependency |
|--------|----------|--------------|------------|
| ReflectionPrompt | Option B: `assetKey` + `MediaSlot` only | Upload 29 images to DAM with `asset_key: discovery_reflect-*`, register `reflection` role | DAM upload |
| VisualInstinct | Keep current (Option B+) | Register `visual` role in picker | Role registry update |
| ResultsReveal hero | Option B: merge DB data | Build DB-backed `getArchetype()` that merges static + stored data | ArchetypesEditor already writes data |
| ResultsReveal moodboard | Option B: same as hero | Same as above | Same as above |
| LightCalibration | Option B: `MediaSlot` | Upload base image, register `base` role | DAM upload |
| WelcomeScreen CTA | Option B: `MediaSlot` | Upload visual-2.webp to DAM, register `cta-background` role | DAM upload |

**Total new roles to register:** `visual`, `reflection`, `base`, `cta-background` (4 roles)
**Total assets to upload to DAM:** 29 (reflection) + 1 (base) + 1 (CTA) = 31 new DAM assets
**Total hardcoded paths to eliminate:** 3 (×2 for visual-2.webp counted once)
**Files to delete after migration:** `apps/web/src/assets/discovery/` (29 unused imports → entire dir)
