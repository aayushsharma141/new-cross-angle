# ImageKit Migration Plan — Refined for Approval

---

## How This Plan Addresses Your 3 Concerns

### Concern 1: Folder Structure (`home-service`, `home-process`, `service-residential`)

**Current state:** The `media_folders` table already supports full hierarchical nesting with ltree paths. The existing admin media library already has folder grids, breadcrumbs, drag-and-drop, rename/delete. However, the `MediaPicker` component (used by CMS modules) hardcodes a flat folder list `["portfolio", "services", "blogs", "general"]` — which is outdated and disconnected from the actual database folders.

**Proposed ImageKit folder hierarchy:**

```
cross-angle/
├── home/
│   ├── hero/                # Hero slideshow images/videos
│   ├── service/             # Service preview cards on homepage
│   ├── process/             # Process step images
│   ├── portfolio/           # Portfolio preview thumbnails
│   ├── testimonials/        # Testimonial avatars
│   ├── blog-preview/        # Blog post preview images
│   ├── tactile-journey/     # TactileJourney mood images
│   ├── before-after/        # Before/after comparison images
│   └── brand-partners/      # Partner logo SVGs
├── about/
│   ├── team/                # Team member photos
│   ├── timeline/            # Milestone images
│   └── hero/                # About page hero
├── services/
│   ├── residential/         # Residential service images
│   ├── commercial/          # Commercial service images
│   ├── kitchen/             # Kitchen design images
│   ├── bathroom/            # Bathroom design images
│   ├── lighting/            # Lighting design images
│   ├── furniture/           # Custom furniture images
│   └── hero/                # Services page hero
├── portfolio/
│   ├── hero/                # Project hero images
│   ├── gallery/             # Project gallery images
│   └── before-after/        # Per-project before/after
├── gallery/                 # Gallery page images (by category)
├── blog/
│   ├── covers/              # Blog cover images
│   └── inline/              # Inline blog content images
├── discovery/
│   ├── visual/              # 18 visual instinct images
│   ├── lifestyle/           # 9 lifestyle images
│   └── reflect/             # 33 reflection images
├── contact/                 # Contact page background, map
├── location/                # City-specific images
├── brand/                   # Logo, OG images, site-level assets
├── favicon/                 # Favicon variants (also stay in /public)
└── archive/                 # Pre-migration originals backup
```

**Why this structure works:**
- Every folder is prefixed by the **page/section** it belongs to — instantly recognizable
- Consistent `{page}-{content-type}` pattern matches your desired naming style
- Hierarchical: files inside `home/service/` could also have subfolders like `home/service/thumbnails/`
- New assets naturally fit into this scheme (e.g., a new "penthouse" service → `services/penthouse/`)
- Admin `MediaPicker` will render this folder tree dynamically instead of the current flat hardcoded list

**Admin UI: The existing `SidebarTreeView.tsx` component is built and ready to use — just needs to be activated. Combined with `FolderBreadcrumbs` and `FolderGrid`, admins will navigate this tree visually.**

---

### Concern 2: 4K Ultra HD Visuals for Interior Design

**Current state:** Images currently use `getOptimizedUrl()` with moderate quality settings (e.g., `quality: 72, width: 360` in MediaPicker thumbnails). Content images rely on ImageKit's default WebP/AVIF conversion.

**Proposed quality pipeline:**

| Context | Resolution | Quality | Format | Notes |
|---------|-----------|---------|--------|-------|
| Hero/Full-bleed BG | up to 3840×2160 (4K) | 90-95 | WebP/AVIF | Lossless-quality compression |
| Gallery lightbox | up to 3840×2160 (4K) | 90-95 | WebP/AVIF | Full-res on demand |
| Portfolio hero | 2560×1440 (QHD) | 90 | WebP/AVIF | Sharp, detailed |
| Service/project cards | 1200×800 | 85 | WebP/AVIF | Balanced quality |
| Blog cover | 1920×1080 | 85 | WebP/AVIF | |
| Thumbnails (grid) | 400×300 | 80 | WebP/AVIF | Fast loading |
| Admin thumbnails | 360×? | 72 | WebP/AVIF | Current — fine for admin |

**Key quality strategies:**

1. **Lossless-quality ImageKit transforms:** Use `tr:q-95,f-auto` as default for hero/gallery images instead of aggressive compression. For 4K images: `tr:w-3840,h-2160,q-90,f-auto`.

2. **Smart srcSet with <MediaSlot>:** Generate responsive srcSets that serve 4K to large screens, 1080p to tablets, 720p to mobile — ensuring sharpness at every size without bandwidth waste.

3. **Video in 4K:** The <MediaSlot> component will pass ImageKit video transforms (`tr:w-3840,q-90`) for uploaded videos. ImageKit supports video transcoding to H.264/H.265 with quality control.

4. **ImageKit auto-format:** `f-auto` delivers WebP on Chrome, AVIF on Safari, JPEG fallback — best visual quality per format.

5. **Sharpening & enhancement:** For product shots, apply ImageKit's `e-sharpen` and `e-contrast` selectively via per-folder defaults:
   - `services/*` → `e-sharpen:3` (highlight material textures)
   - `portfolio/gallery/*` → `e-sharpen:2` (crisp room photos)
   - `home/hero/*` → no sharpening (ambient, soft)

6. **Upload workflow:** Admin upload form should **not** downscale images — preserve full resolution on upload. ImageKit handles responsive resizing on delivery.

7. **Blur-up LQIP:** First-load placeholders use heavily compressed (q-10, w-20) blurred images for instant perceived performance, replaced by full 4K on viewport entry.

---

### Concern 3: Full CRUD via Admin CMS Module

**Current state audit — modules and their media CRUD gaps:**

| Module | Media Field | Current Picker | CRUD Complete? | Gap |
|--------|-------------|---------------|----------------|-----|
| **Services** | `icon_url` / hero | Legacy `MediaPickerModal` | ❌ Partial | Uses old Supabase storage picker; no video support |
| **Portfolio** | `cover_image_url` | Legacy `MediaPickerModal` | ❌ Partial | Uses old picker; `gallery_urls` is TEXT[] array, no proper gallery management |
| **Portfolio Gallery** | `image_url` | None (direct URL) | ❌ Missing | No media picker at all — requires manual URL entry |
| **Blog Posts** | `cover_image_url` | New `MediaPicker` ✅ | ⚠️ Partial | Image only, no video; inline images in content via TipTap need media library integration |
| **Gallery** | `image_url` | New `MediaPicker` ✅ | ⚠️ Partial | Image only, no video support |
| **Transformations** | `before_media`, `after_media` | New `MediaPicker` ✅ | ✅ Good | Already uses MediaPicker |
| **Hero Carousel** | `media_url` | Custom `HeroMediaPickerModal` | ⚠️ Partial | Supports both image & video uniquely — but uses its own picker, not unified MediaPicker |
| **Team Members** | `image_url` | None | ❌ Missing | No media picker at all — manual URL entry |
| **Testimonials** | `avatar_url` | None | ❌ Missing | No media picker at all — manual URL entry |
| **Site Settings** | `logo_light_url`, `logo_dark_url`, `favicon_url`, `og_image_url`, `about_video_url` | None | ❌ Missing | All are direct text inputs |
| **Project Materials** | (color swatches only) | N/A | ✅ N/A | No images needed |
| **Service Steps** | Step images | None | ❌ Missing | No media picker |

**Proposed CRUD unification plan:**

```
                    ┌─────────────────────────────────┐
                    │       <MediaPicker> (v2)         │
                    │  - Dynamic folder tree from DB   │
                    │  - Image + Video toggle filter   │
                    │  - Upload directly in picker     │
                    │  - Search across all folders     │
                    │  - Multi-select support          │
                    └──────────┬──────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
   ┌──────────┐    ┌──────────────────┐   ┌─────────────────┐
   │ Services │    │ Portfolio        │   │ Blog, Gallery,  │
   │ Team     │    │ Hero Carousel    │   │ Transformations │
   │ Testim.  │    │ Site Settings    │   │ (already using) │
   │          │    │                  │   │                 │
   │ REPLACE  │    │ MIGRATE from     │   │ UPGRADE to      │
   │ with v2  │    │ legacy picker    │   │ support video   │
   └──────────┘    └──────────────────┘   └─────────────────┘
```

**Specific CRUD tasks for each module:**

| Task | Module | Change |
|------|--------|--------|
| **C.1** | All modules | Update `MediaPicker` v2 to load folders dynamically from `media_folders` table (remove hardcoded `FOLDERS` array) |
| **C.2** | All modules | Migrate from `MediaPickerModal` (legacy) to `MediaPicker` v2 — affects Services, Portfolio |
| **C.3** | Team Members | Add `MediaPicker` trigger to `image_url` field |
| **C.4** | Testimonials | Add `MediaPicker` trigger to `avatar_url` field |
| **C.5** | Site Settings | Add `MediaPicker` to logo/favicon/OG/video URL fields |
| **C.6** | Portfolio Form | Replace `gallery_urls TEXT[]` manual array with `project_gallery` table entries via MediaPicker |
| **C.7** | MediaPicker v2 | Add `type` filter toggle (images / videos / all) and `media_type` support |
| **C.8** | Blog Editor | Integrate MediaPicker with TipTap editor for inline image insertion |
| **C.9** | JSONB content fields | Ensure rich text editors (blog, services, projects) show inline images from ImageKit |
| **C.10** | All image-only fields | Add note/indicator in admin UI when switching to a field that now supports video too |

---

## Implementation Phases

### Phase 0: Prep — Schema & Foundation (Day 1)
- Regenerate Supabase types (`npx supabase gen types`)
- Fix edge function dual-write bug (writes to old `media` table instead of `media_files`)
- Create seed folders matching the proposed hierarchy in a migration
- Upload existing static assets to ImageKit via batch script, organized into the new folder structure

### Phase 1: Folder-Aware MediaPicker v2 (Day 1-2)
- Rewrite `MediaPicker.tsx` to load folders dynamically from `media_folders`
- Integrate `SidebarTreeView.tsx` into `AdminMedia.tsx`
- Add type filter (image/video/all) to MediaPicker
- Allow upload directly from picker dialog
- Add "Copy URL" and "Copy ImageKit Path" actions

### Phase 2: Universal <MediaSlot> Component (Day 2)
- Build `<MediaSlot>` with auto-detection (mime type, extension)
- Support responsive srcSet via ImageKit transforms
- Implement LQIP blur-up with crossorigin-friendly base64
- Support video transforms (quality, resolution, format)
- Replace `<img>`, `<video>`, `<OptimizedImage>` across all 19 public pages

### Phase 3: Static Asset Migration (Day 2-3)
- Upload 65+ bundled assets + 30 public/ assets to ImageKit folders
- Create `media-registry.ts` with typed mappings
- Replace all import statements and hardcoded paths with registry lookups
- **Discovery page (56 images)**: Biggest bundle savings (~1.5 MB)

### Phase 4: Admin CRUD Unification (Day 3-5)
Execute tasks C.1 through C.10 from the table above systematically.

### Phase 5: Quality Tuning & Cleanup (Day 5-6)
- Set per-folder ImageKit quality defaults in `cdn.ts`
- Configure sharpening for material texture photography
- Delete migrated images from bundle (`src/assets/`) and `public/`
- Update schema OG URLs to ImageKit
- Performance benchmark

---

## What I Need From You

1. **Does the proposed folder hierarchy** look right? Any folders to add/rename/remove?
2. **4K approach**: Is 4K delivery for hero + gallery + full-bleed sufficient, or do you want 4K for every image (including cards/thumbnails)?
3. **Video specifics**: Do you have existing 4K video files to upload, or will videos be created fresh? What format (MP4 H.264, or also HEVC)?
4. **CRUD priority**: Any specific admin module you want fully CRUD-capable first (before I tackle others)?
5. **Upload script**: Should I write a bulk upload script, or will you upload the static assets manually via the ImageKit dashboard?
