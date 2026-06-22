# Media Architecture Discovery Audit

> **Status**: Complete
> **Date**: 2026-06-21
> **Scope**: Full reverse-engineering of the Cross Angle Interior media ecosystem
> **Purpose**: Provide sufficient intelligence for DAM entity model design

---

## Part 1 — Current Media Sources

### Source Inventory

| # | Source Name | Type | Storage Location | Upload Method | Owner | Notes |
|---|---|---|---|---|---|---|
| 1 | **Hero Carousel** | Image, Video | ImageKit CDN | Admin CMS → text URL input + browse | Marketing | 15+ fields per item incl. media_url, media_type, animation_effect, duration |
| 2 | **Portfolio Projects** | Image | ImageKit CDN | Admin CMS → MediaPickerField (single) + text inputs (gallery x5) | Content Team | cover_image_url + up to 5 gallery_images |
| 3 | **Blog Posts** | Image | ImageKit CDN | Admin Blog Editor → text URL input + preview | Content Team | cover_image field, plus inline images in rich text body |
| 4 | **Services** | Image | ImageKit CDN | Admin CMS → MediaPickerField | Content Team | Single hero_image per service |
| 5 | **Testimonials** | Image | ImageKit CDN | Admin CMS → MediaPickerField | Marketing | avatar_url per testimonial |
| 6 | **Team Members** | Image | ImageKit CDN | Admin CMS → MediaPickerField | HR / Admin | image_url per member |
| 7 | **Gallery** | Image | ImageKit CDN | Admin CMS → MediaPicker dialog | Content Team | Single image per gallery item |
| 8 | **Before & After** | Image | ImageKit CDN | Admin CMS → MediaInput x2 | Content Team | Paired before_image_url + after_image_url |
| 9 | **Process Steps** | Image | ImageKit CDN | Admin CMS → MediaPickerField | Content Team | image_url per step |
| 10 | **Site Settings** | Image | ImageKit CDN | Admin Settings → upload field | Admin | logo_url, favicon_url, og_image_url |
| 11 | **Site Media Assets** | Image, Video, PDF | ImageKit CDN | Admin CMS → MediaPickerModal (FK to media_files) | Admin | 120 asset keys, references media_files table |
| 12 | **Discovery Visual Instinct** | Image | Local assets + ImageKit CDN | Hardcoded in constants file + site_media_assets | Product Team | 18 visual-*.jpg images, dual-sourced (local fallback + asset key) |
| 13 | **Discovery Lifestyle Reflection** | Image | Local assets + ImageKit CDN | Hardcoded in constants file + site_media_assets | Product Team | 9 lifestyle-*.jpg images |
| 14 | **Discovery Reflection Prompts** | Image | Local assets + ImageKit CDN | Hardcoded + site_media_assets | Product Team | 30+ reflect-*.jpg images |
| 15 | **Discovery Light Calibration** | Image | Static asset | Hardcoded `/common_bedroom_base.png` | Product Team | Not in site_media_assets |
| 16 | **Brand Assets** | Image, SVG | ImageKit CDN | Admin Settings / seeded in migration | Brand / Admin | logo_light, logo_dark, favicon, og_default |
| 17 | **OG / Social Images** | Image | ImageKit CDN | Seeded in migration | Marketing | 10 archetype OG images + style_quiz OG |
| 18 | **Blog Inline Images** | Image | ImageKit CDN | Rich text editor (Tiptap) embed | Content Team | Embedded in blog post body HTML |
| 19 | **Partner Logos** | Image | ImageKit CDN | Seeded in migration | Marketing | Asian Paints, Hafele, Godrej, Philips, Hettich, Jaquar |
| 20 | **Project Walkthrough Videos** | Video | MixKit (external) | Hardcoded fallback URLs | Content Team | Not uploaded via CMS — external MixKit URLs |
| 21 | **Portfolio Hub Images** | Image | ImageKit CDN | Seeded in migration | Content Team | hero_1/2/3, lifestyle, cta |

### Source Summary

- **ImageKit CDN**: Primary storage provider for all CMS-managed images, videos, and documents
- **Supabase Storage**: Legacy storage provider, migration to ImageKit in progress via `migrate-to-imagekit` edge function
- **Local `/assets/` directory**: Discovery engine fallback images (visual, lifestyle, reflect series) — dual-sourced with `site_media_assets`
- **External URLs**: MixKit (project walkthrough videos), Unsplash (fallback images), YouTube (about video embed)
- **Inline SVGs**: Noise patterns, decorative elements (not managed as assets)

---

## Part 2 — Public Website Media Consumption Map

### Page Inventory

---

#### 1. Homepage (`/`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Hero | Image, Video (auto-play, loop) | `MediaSlot` + `<video>` | `site_media_assets` (`hero_desktop`), `hero_media_items` table | 1 hero bg + N carousel media items |
| About | Image | `Image` | Hardcoded URL | 1 |
| Services | Image | `Image` | `services.hero_image` DB field | N services |
| Portfolio | Image | `Image` | `project.heroImage` DB field | N projects |
| Process | Image | `MediaSlot` | `site_media_assets` (`process_diagram`) | 1 |
| Before/After Showcase | Image (before/after pairs) | `Image` + `Compare` | `site_before_after_stories.beforeMedia` / `.afterMedia` | N stories |
| Testimonials | Image (avatar) | `Image` | `testimonials.avatar_url` DB field | N testimonials |
| Trust | Image | `MediaSlot` | `site_media_assets` (`trust_image`) | 1 |
| Tactile Journey | Image | `MediaSlot` | `site_media_assets` (`tactile_*` — bedroom, kitchen, office) | 3 |
| Style Discovery Teaser | Image | CSS `backgroundImage` | `archetype.image` from discovery data | 1 |
| Service Locations | Image | `MediaSlot` | `site_media_assets` (location-specific keys) | 1 |
| Blog | Image | `Image` | `blog_posts.cover_image_url` | N posts |

---

#### 2. About Page (`/about`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Hero | Video (YouTube embed) | `<iframe>` | `site_settings.about_video_url` (default: YouTube) | 1 |
| Team | Image (avatar) | `Image` | `team_members.image_url` DB field | N members |
| Timeline | Image | `MediaSlot` | `site_media_assets` (`about_timeline_*` — 2012, 2016, 2020, 2024) | 4 |
| Video Modal | Video (YouTube embed) | `<iframe>` | Same as hero video | 1 |

---

#### 3. Services Overview (`/services`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Hero | Image | `MediaSlot` (x2) | `site_media_assets` (`services_blueprint`, `services_reality`) | 2 |
| Service Cards | Image | `Image` | `services.hero_image` DB field | N services |
| Service Detail (`/services/:cat/:slug`) | Image | `Image` | `service.hero_image` DB field | 1 per page |
| Related Services | Image | `Image` | Related `services.hero_image` | N sidebar links |

---

#### 4. Portfolio Hub (`/portfolio`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Featured Journeys | Image | `<img>` | `project.heroImage` DB field | N projects |
| Project Grid | Image | `Image` | `project.heroImage` / `project.gallery[0]` | N projects |
| Style Selector | Image | `Image` | `project.heroImage` | N projects |
| Light Experience | Image | `MediaSlot` | `site_media_assets` (`portfolio_hub_lifestyle`) | 1 |
| Hub CTA | Image | `MediaSlot` | `site_media_assets` (`portfolio_hub_cta`) | 1 |
| Project Archive | Image | `<img>` | `project.heroImage` + Unsplash fallbacks | N projects |
| Hero Rotator | Image | `MediaSlot` | `site_media_assets` (`portfolio_hub_hero_1/2/3`) | 3 |

---

#### 5. Project Detail (`/portfolio/:slug`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Hero | Image | `Image` | `project.heroImage` | 1 |
| Experience Canvas | Video, Images, 360 Panoramic | `<video>`, `<img>` | `assets.videoUrl`, `assets.photos[]`, `assets.panoramic` + MixKit fallbacks | 1 video + N images |
| Gallery | Video, Images (carousel, film strip) | `<video>`, `<img>`, CSS bg | Same as above | N items |
| Ambience | Images (day/evening/night) | CSS `backgroundImage` | Project ambience data + fallbacks | 3 |
| Client Story | Image | `<img>` | `project.clientStory?.image` + fallback | 1 |
| Documentation | Image | `<img>` | Steps data | N |
| Palette | Texture image | CSS inline | Palette data | N |
| Transformation | Image (before/after) | `Compare` | Gallery images + Unsplash fallbacks | N pairs |
| Hotspots | Image | `<img>` | Hotspot data | N |
| Services | Image | `Image` | `service.heroImage` | N |

---

#### 6. Blog Pages

| Page | Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|---|
| `/blog` | Featured Post | Image | `OptimizedImage` | `blog_posts.cover_image_url` | 1 featured |
| `/blog` | Post Cards | Image | `OptimizedImage` | `blog_posts.cover_image_url` | N cards |
| `/blog` | Newsletter CTA | Image | `MediaSlot` | `site_media_assets` (`blog_newsletter_bg`) | 1 |
| `/blog/:slug` | Cover | Image | `Image` | `blog_post.cover_image_url` | 1 |
| `/blog/:slug` | Content Body | Image | `Image` + raw `<img>` | Inline in rich text / Tiptap content | N inline |

---

#### 7. Gallery (`/gallery`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Grid | Image | `Image` | `gallery_images.image_url` DB field | N images |
| Lightbox | Image | `Image` | Same grid images | N images |

---

#### 8. Contact (`/contact`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| CTA / Background | Image | `MediaSlot` | `site_media_assets` (`contact_hero_bg`) | 1 |

---

#### 9. Location Page (`/location/:slug`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Hero / CTA | Image | `MediaSlot` | `site_media_assets` (`location_*`) | 1 per location |

---

#### 10. 404 Not Found

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Background | Image | `MediaSlot` | `site_media_assets` (`not_found_bg`) | 1 |

---

#### 11. Discovery / Style Quiz (`/discover`)

| Stage | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Welcome | Image (logo) | `<img>` | `logoIcon` from assets | 1 |
| Visual Instinct | Image | Preload via `new Image()` + `MediaSlot` | `discovery_visual-1` through `-18` (asset keys) + local fallbacks | 18 images (select 1) |
| Lifestyle Reflection | Icon (Lucide) | SVG icons | Lucide icon library | 0 images |
| Reflection Prompt | Image | `ImageOption` → `MediaSlot` | `discovery_reflect-*` asset keys + local fallbacks | 33 images (select 1 per question) |
| Light Calibration | Base image | Hardcoded `<img>` | `/common_bedroom_base.png` (local asset, not in site_media_assets) | 1 |
| Material Resonance | Icon (Lucide) | SVG icons | Lucide icon library | 0 images |
| Results Reveal | Image | `MediaSlot` | Visual instinct asset keys | 1 per result |

---

#### 12. Estimator (`/estimator`)

| Section | Media Type | Render Component | Source | Quantity |
|---|---|---|---|---|
| Header | SVG (logo) | `<img>` | `useSiteSettings()` → `logoUrl` | 1 |

---

#### 13. Other Pages

| Page | Media Usage | Notes |
|---|---|---|
| `/privacy` | None | Text-only |
| `/terms` | None | Text-only |
| `/our-process` | None (structural only) | Placeholder divs, no actual media rendered |

---

### Consumption Summary

| Metric | Count |
|---|---|
| Total public pages/routes | ~22 |
| Pages consuming media | ~18 |
| Primary image renderer | `Image` component (40-50 instances) |
| DB-driven asset renderer | `MediaSlot` component (~15 instances) |
| Before/after slider | `Compare` component (~3 instances) |
| Video rendering | Raw `<video>` tags (~5 instances) + YouTube `<iframe>` (~2) |
| CDN optimization path | `getOptimizedUrl()` in `cdn.ts` (used by all Image/MediaSlot/Compare) |
| Hardcoded fallback domains | Unsplash, MixKit, YouTube |

---

## Part 3 — CMS Media Consumption Map

### Module: Hero Carousel (`AdminHero.tsx`)
**Route**: `/admin/cms/hero-carousel`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `media_url` | Image/Video URL | Single | Yes | None | Text input + browse |
| `media_type` | `"video" \| "image"` | Single | Yes | None | Select dropdown |
| `thumbnail_url` | Image URL | Single | No | None | Auto-generated? |
| `animation_effect` | Enum string | Single | No | None | Select from `ANIMATION_EFFECTS` |
| `duration_ms` | Number | Single | No | None | Number input |

### Module: Portfolio (`AdminPortfolio.tsx`)
**Route**: `/admin/cms/portfolio`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `cover_image_url` | Image URL | Single | No | Zod: optional string | `MediaPickerField` |
| `gallery_images[0..4]` | Image URL | Multiple (up to 5) | No | None | 5x text inputs |

### Module: Blog Posts (`BlogEditorForm.tsx`)
**Route**: `/admin/blog/posts`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `cover_image` | Image URL | Single | No | Zod: optional string | Text input + preview |
| Inline images | Image URL | Multiple | No | None | Tiptap rich text editor |

### Module: Services (`AdminServices.tsx`)
**Route**: `/admin/cms/services`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `image_url` | Image URL | Single | No | Zod: optional string | `MediaPickerField` |

### Module: Testimonials (`AdminTestimonials.tsx`)
**Route**: `/admin/cms/testimonials`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `avatar_url` | Image URL | Single | No | Zod: optional string | `MediaPickerField` |

### Module: Team Members (`AdminTeam.tsx`)
**Route**: `/admin/cms/team-members`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `image_url` | Image URL | Single | No | None | `MediaPickerField` |

### Module: Gallery (`AdminGallery.tsx`)
**Route**: `/admin/cms/gallery`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `image_url` | Image URL | Single | Yes (inferred) | None | `MediaPicker` dialog |

### Module: Before & After (`AdminBeforeAndAfter.tsx`)
**Route**: `/admin/cms/before-and-after`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `before_image_url` | Image URL | Single | Yes | None | `MediaInput` wrapper |
| `after_image_url` | Image URL | Single | Yes | None | `MediaInput` wrapper |

### Module: Process Steps (`AdminProcessSteps.tsx`)
**Route**: `/admin/cms/process-steps`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `image_url` | Image URL | Single | No | None | `MediaPickerField` |

### Module: Site Assets (`AdminSiteAssets.tsx`)
**Route**: `/admin/cms/site-assets`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `media_file_id` | UUID (FK → `media_files`) | Single | No | None | `MediaPickerModal` |

### Module: Site Settings (`GeneralSettingsForm.tsx`)
**Route**: `/admin/settings`

| Field | Type | Cardinality | Required | Validation | UI Control |
|---|---|---|---|---|---|
| `logo_url` | Image URL | Single | No | Zod: optional string | Upload field |
| `favicon_url` | Image URL | Single | No | Zod: optional string | Upload field |
| `og_image_url` | Image URL | Single | No | Zod: optional string | Upload field |

### CMS Modules WITH NO Media Fields

| Module | Route | Notes |
|---|---|---|
| Discovery Config | `/admin/discovery/*` | Archetypes, adjectives, materials, lighting editors — all text-only. VisualImage type exists but unused in forms. |
| Estimator Config | `/admin/estimator/*` | Property types, details, addons, services editors — all text/number only |
| Pricing Config | `/admin/estimator/pricing` | Text/number only |
| Estimate Rates | `/admin/estimator/rates` | Text/number only |
| Milestones | `/admin/cms/milestones` | Text-only (year, title, description) |

### Key Observations

- **3 different media picker UX patterns** exist: `MediaPickerField` (text + browse + preview), `MediaPicker` (folder dialog), `MediaPickerModal` (upload + search + select)
- **7 of 12 CMS modules have NO Zod validation** for media fields
- **Portfolio gallery** has the weakest UX: 5 plain text inputs with no picker
- **Site Assets** is the only module using FK `media_file_id`; all others store raw URLs
- **Discovery editors** accept no images, despite the `VisualImage` type existing in types

---

## Part 4 — Media Relationship Graph

### Entity Relationship Map

```
site_media_assets (120 asset keys)
  │
  ├── media_file_id ──────► media_files (UUID FK)
  │                              │
  │                              ├── folder_id ──────► media_folders (ltree hierarchy)
  │                              │
  │                              └── storage_provider: "imagekit" | "supabase" | "external"
  │
  ├──► Consumed by: MediaSlot component
  │     ├── Homepage (hero, process, trust, tactile, locations)
  │     ├── About (timeline)
  │     ├── Services (hero blueprint/reality)
  │     ├── Portfolio Hub (hero, lifestyle, cta)
  │     ├── Blog (newsletter bg)
  │     ├── Contact (hero bg)
  │     ├── Location (hero bg)
  │     ├── 404 (bg)
  │     ├── Discovery (visual-*, reflect-*, lifestyle-*)
  │     └── Brand (logo light/dark, favicon, og)
  │
  └──► Archetype OG images (10 keys)
       └──► Social sharing meta tags


project_gallery
  ├── image_url ──────────► ImageKit URL (raw URL stored, no FK)
  ├── project_id ─────────► projects (FK)
  └──► Consumed by: ProjectGallery, ProjectExperienceCanvas


gallery_items
  ├── image_url ──────────► ImageKit URL (raw URL)
  ├── video_url ──────────► ImageKit URL (raw URL, optional)
  └──► Consumed by: GalleryPage (grid + lightbox)


blog_posts
  ├── cover_image ────────► ImageKit URL (raw URL)
  ├── content (rich text) ─► Inline <img> tags with ImageKit URLs
  └──► Consumed by: BlogPage, BlogDetailPage


services
  ├── hero_image ─────────► ImageKit URL (raw URL)
  └──► Consumed by: ServicesPage, ServiceCategoryPage, ServiceDetailPage, ProjectPage


testimonials
  ├── avatar_url ─────────► ImageKit URL (raw URL)
  └──► Consumed by: Homepage Testimonials section


team_members
  ├── image_url ──────────► ImageKit URL (raw URL)
  └──► Consumed by: AboutPage Team section


hero_media_items
  ├── media_url ──────────► ImageKit URL (raw URL)
  ├── media_type ─────────► "video" | "image"
  └──► Consumed by: Homepage Hero carousel


site_before_after_stories
  ├── before_media ───────► ImageKit URL (raw URL)
  ├── after_media ────────► ImageKit URL (raw URL)
  └──► Consumed by: Homepage BeforeAfterShowcase


design_process_steps
  ├── image_url ──────────► ImageKit URL (raw URL)
  └──► Consumed by: Process section (limited usage)


site_settings
  ├── company_logo_url ───► ImageKit URL
  ├── about_video_url ────► YouTube URL
  └──► Consumed by: Navbar, AboutPage


media_files (new v2 media library)
  ├── url ────────────────► ImageKit / Supabase URL
  ├── storage_provider ───► "imagekit" | "supabase" | "external"
  ├── folder_id ──────────► media_folders (ltree hierarchical folder)
  ├── mime_type
  ├── width, height
  ├── size_bytes
  ├── alt_text, caption
  └──► Consumed by: AdminMedia (library view), MediaPickerModal, MediaSlot (via site_media_assets)
```

### Cardinality Summary

| Relationship | Type | Example |
|---|---|---|
| `site_media_asset` → `media_files` | **Many-to-One** | 120 asset keys → 1 media file each (at most) |
| `media_files` → `media_folders` | **Many-to-One** | Many files in one folder |
| `project` → `project_gallery` | **One-to-Many** | One project → many gallery images |
| `project` → `heroImage` | **Many-to-One** (via raw URL) | Logical: 1 hero image per project |
| `testimonial` → `avatar_url` | **One-to-One** | 1 avatar per testimonial |
| `team_member` → `image_url` | **One-to-One** | 1 image per member |
| `service` → `hero_image` | **One-to-One** | 1 hero per service |
| `blog_post` → `cover_image` | **One-to-One** | 1 cover per post |
| `hero_carousel_item` → `media_url` | **One-to-One** | 1 media per carousel slot |
| `gallery_item` → `image_url` | **One-to-One** | 1 image per gallery entry |
| `before_after_story` → `before` + `after` | **One-to-Two** | Exactly 2 images per story |
| `blog_post` → inline images | **One-to-Many** | N inline images in rich text body |

### Cross-Entity Reuse

- **No media currently crosses entity boundaries** (a portfolio image is never reused as a service image). Every CMS module stores its own raw URL independently.
- `site_media_assets` is the only system for deliberate cross-page reuse (e.g., `home_hero_bg` used only on homepage hero).
- **No usage tracking exists** — if an image is deleted from ImageKit, there is no way to know which pages would break.

---

## Part 5 — Current Storage Architecture

### Architecture Diagram

```
                         ┌──────────────────────────────────────────┐
                         │              BROWSER (Client)             │
                         │  Image component → getOptimizedUrl()      │
                         │  MediaSlot → Supabase query → getOptimized│
                         │  Admin Media: Upload → base64 encode      │
                         └──────────┬──────────────────────┬────────┘
                                    │                      │
                          CDN fetch │              Upload  │
                                    v                      v
                    ┌───────────────────┐      ┌──────────────────────┐
                    │   ImageKit CDN    │      │  Edge Functions       │
                    │  ik.imagekit.io   │      │  (Supabase Deno)      │
                    │                   │      │                       │
                    │  ┌─────────────┐  │      │  imagekit-upload      │
                    │  │ Transforms  │  │      │  sync-imagekit        │
                    │  │ - quality   │  │      │  migrate-to-imagekit  │
                    │  │ - format    │  │      │  media-operations     │
                    │  │ - resize    │  │      │  media-export/import  │
                    │  │ - srcset    │  │      │  generate-caption     │
                    │  └─────────────┘  │      └──────────┬───────────┘
                    └────────┬──────────┘                 │
                             │                            │
                             │ ImageKit API               │ ImageKit API
                             │ (HTTP Basic Auth)          │ (PRIVATE_KEY)
                             v                            v
                    ┌──────────────────────────────────────────────┐
                    │              ImageKit Storage                 │
                    │  (Primary media storage for all admin-media)  │
                    └──────────────────────────────────────────────┘
                             ^
                             │ Supabase Storage (legacy, migrating)
                    ┌──────────────────────────────────────────────┐
                    │         Supabase Storage (migrating out)     │
                    │  Bucket: "media"                             │
                    │  Some gallery items still reference this     │
                    └──────────────────────────────────────────────┘

                    ┌──────────────────────────────────────────────┐
                    │         Supabase PostgreSQL Database          │
                    │                                              │
                    │  media_files (v2 media library)              │
                    │    ├─ url (ImageKit CDN URL)                 │
                    │    ├─ storage_provider: "imagekit"           │
                    │    ├─ folder_id → media_folders (ltree)      │
                    │    └─ mime_type, width, height, size         │
                    │                                              │
                    │  site_media_assets (logical asset registry)  │
                    │    ├─ asset_key (unique text key)            │
                    │    └─ media_file_id → media_files            │
                    │                                              │
                    │  Feature tables (store raw URLs directly):   │
                    │    services.hero_image                       │
                    │    blog_posts.cover_image                    │
                    │    project_gallery.image_url                 │
                    │    testimonials.avatar_url                   │
                    │    team_members.image_url                    │
                    │    gallery_items.image_url                   │
                    │    site_before_after_stories.before/after    │
                    │    design_process_steps.image_url            │
                    │    hero_media_items.media_url                │
                    │    site_settings.company_logo_url            │
                    └──────────────────────────────────────────────┘
```

### Upload Flow (Admin Media Library — New Path)

```
1. User drops file in MediaUploadZone
2. MediaService.upload() called
3. FileReader reads as base64 data URL
4. POST to Supabase edge function `imagekit-upload` with action: "upload"
5. Edge function authenticates with IMAGEKIT_PRIVATE_KEY
6. ImageKit API receives base64 → stores file → returns {fileId, url, name, size, fileType, thumbnailUrl}
7. Edge function returns ImageKit URL to client
8. Client inserts record into `media_files` table (Supabase)
   - storage_provider: "imagekit"
   - url: ImageKit CDN URL
   - mime_type, size_bytes, etc.
9. MediaGrid refreshes, shows new file
```

### Upload Flow (Legacy — Direct to Supabase Storage)

```
1. MediaPicker.tsx uses supabase.storage.from("media").upload()
2. File goes to Supabase Storage bucket "media"
3. URL returned: supabase.co/storage/v1/object/public/media/{filename}
4. DB record created in legacy `media` table
```

### Migration Flow (Supabase → ImageKit)

```
1. Admin triggers "Migrate to ImageKit" action
2. POST to `migrate-to-imagekit` edge function
3. Edge function queries `media_files` WHERE storage_provider = "supabase"
4. For each file:
   a. Download from Supabase Storage (adminClient.storage.download())
   b. Upload to ImageKit via ImageKit API
   c. Update DB: storage_provider = "imagekit", url = ImageKit CDN URL
   d. Optionally delete from Supabase Storage
```

### Sync Flow (ImageKit → Database)

```
1. Admin triggers "Sync from ImageKit" action
2. POST to `sync-imagekit` edge function
3. Edge function fetches all files from ImageKit API (GET /v1/files)
4. Upserts into `media_files` table
```

### CDN Delivery Flow

```
1. Image component receives URL (ImageKit or Supabase)
2. getOptimizedUrl() processes the URL:
   a. If ImageKit URL → append transformation params (?tr=w-800,q-80,fo-auto)
   b. If Supabase URL → prefix ImageKit endpoint as proxy
   c. If local /images/ → prefix ImageKit endpoint as proxy
3. Browser requests optimized URL from ik.imagekit.io CDN
4. ImageKit applies transformations, serves webp/avif with quality tuning
```

### Security

- **No signed URLs** are currently in use. All media is publicly accessible.
- CSP allows `*.imagekit.io` for images, media, and connect-src
- Edge functions require admin authentication (JWT + `verifyAdmin` middleware)
- ImageKit Private Key stored as Supabase secret, never exposed to client
- `imagekit-upload` edge function has `getAuth` action but it's unused in frontend

### Webhooks

- **No media-specific webhooks** exist. The `retry-webhooks` and `handle-new-lead` edge functions are for lead processing only.
- No ImageKit webhook handler is configured to sync uploads back to the DB automatically.

---

## Part 6 — Asset Context Analysis

### Business Role Inventory

Grouped by business purpose, NOT by file type.

| Role | Used In | CMS Source | Cardinality | Example Assets |
|---|---|---|---|---|
| **Hero Background** | Homepage, Services, About, Contact, Location, 404 | `site_media_assets` | 1 per page | `home_hero_bg`, `services_blueprint`, `about_hero_bg`, `contact_hero_bg`, `not_found_bg` |
| **Hero Carousel Item** | Homepage hero slider | `hero_media_items` | N (multiple items rotate) | Media items with video/image, animation, CTA |
| **Project Hero** | Portfolio grid, Project detail hero | `projects` (raw URL) | 1 per project | `project.heroImage` |
| **Project Gallery Image** | Project detail gallery/carousel | `project_gallery` | N per project (up to 5) | `project_gallery.image_url` |
| **Project Walkthrough Video** | Project detail experience canvas | `assets.videoUrl` (MixKit) | 1 per project (optional) | MixKit embed URL |
| **Project Ambience** | Project detail ambience section | Project ambience data | 3 per project (day/evening/night) | CSS background images |
| **Project Documentation** | Project detail documentation | Steps data | N per project | Step images |
| **Service Card Image** | Services overview grid, service detail hero | `services` (raw URL) | 1 per service | `service.hero_image` |
| **Before/After Image** | Homepage showcase, project transformation | `site_before_after_stories` | 2 per story (before + after) | `before_media`, `after_media` |
| **Testimonial Avatar** | Homepage testimonials carousel | `testimonials` (raw URL) | 1 per testimonial | `testimonial.avatar_url` |
| **Blog Cover Image** | Blog index cards, blog detail hero | `blog_posts` (raw URL) | 1 per post | `blog_post.cover_image` |
| **Blog Inline Image** | Blog post rich text body | Blog content (HTML) | N per post | Images embedded in Tiptap content |
| **Team Avatar** | About page team grid | `team_members` (raw URL) | 1 per member | `team_member.image_url` |
| **Gallery Image** | Gallery page grid + lightbox | `gallery_items` (raw URL) | N total | `gallery_item.image_url` |
| **Process Step Image** | Homepage process, our-process page | `design_process_steps` (raw URL) | 1 per step (optional) | `step.image_url` |
| **Brand Logo** | Navbar, footer, schema markup | `site_media_assets` | Light + Dark variant | `brand_logo_light`, `brand_logo_dark` |
| **Favicon** | Browser tab icon | `site_settings` | 1 | `site_settings.favicon_url` |
| **OG / Social Image** | Social sharing previews | `site_media_assets` | 1 per page/archetype | `brand_og_default`, `og_archetype_*` |
| **Discovery Visual Instinct** | Style quiz stage | `site_media_assets` + local fallback | 18 images, user selects 1 | `discovery_visual-1` through `-18` |
| **Discovery Reflection Prompt** | Style quiz stage | `site_media_assets` + local fallback | 33 images, user selects per prompt | `discovery_reflect-*` |
| **Discovery Lifestyle** | Style quiz stage | `site_media_assets` + local fallback | 9 images | `discovery_lifestyle-*` |
| **Discovery Light Calibration** | Style quiz stage | Local asset (not in DB) | 1 hardcoded base image | `/common_bedroom_base.png` |
| **Process Diagram** | Homepage process section | `site_media_assets` | 1 | `home_process_*` (5 images) |
| **Tactile Mood Image** | Homepage tactile journey section | `site_media_assets` | 3 (bedroom, kitchen, office) | `home_tactile_*` |
| **Trust Image** | Homepage trust section | `site_media_assets` | 1 | `trust_image` |
| **Partner Logo** | Homepage brand strip | `site_media_assets` | 6 brand logos | `home_brand_asian_paints`, etc. |
| **Location Image** | Location page hero + cards | `site_media_assets` | 1 per location | `location_jamshedpur`, etc. |
| **Timeline Image** | About page milestones | `site_media_assets` | 4 timeline markers | `about_timeline_*` |
| **Portfolio Hub Hero** | Portfolio page hero rotator | `site_media_assets` | 3 rotating images | `portfolio_hub_hero_1/2/3` |
| **Portfolio Hub Feature** | Portfolio page feature sections | `site_media_assets` | 2 (lifestyle, cta) | `portfolio_hub_lifestyle`, `portfolio_hub_cta` |
| **About Video** | About page hero + modal | `site_settings` | 1 YouTube embed | `site_settings.about_video_url` |

---

## Part 7 — Usage Intelligence Requirements

### What Every Asset Currently Knows

| Property | Currently Tracked? | Where? |
|---|---|---|
| URL | Yes | Every entity stores raw URL |
| File type / MIME type | Partial | `media_files.mime_type` |
| File size | Partial | `media_files.size_bytes` |
| Dimensions | Partial | `media_files.width`, `media_files.height` |
| Alt text | Partial | `media_files.alt_text` (new) |
| Caption | Partial | `media_files.caption` (new) |
| Storage provider | Yes | `media_files.storage_provider` |
| Folder | Yes | `media_files.folder_id` → `media_folders` |
| Asset key | Yes | `site_media_assets.asset_key` |

### What Every Asset SHOULD Know (Intelligence Gaps)

**1. Usage Location — Where is this asset used?**

| Gap | Current State | Required Intelligence |
|---|---|---|
| Which pages use this asset? | None. No reverse lookup exists. | Asset record should list every page/section that renders it. |
| Which CMS entities reference this asset? | None. URLs are stored as raw strings — no FK tracking. | If a gallery image is used as a project hero AND a testimonial avatar, both relationships should be recorded. |
| Is this asset unused? | None. Orphan detection is impossible. | Assets should know if zero entities reference them. |

**2. Business Role — What job does this asset do?**

| Gap | Current State | Required Intelligence |
|---|---|---|
| Role classification | Implicit by the field name (`hero_image`, `avatar_url`) but not stored as data | Each usage should be tagged with a role: Hero, Gallery, Before, After, Thumbnail, Avatar, Logo, Cover, Inline, etc. |
| Role priority | None | Assets should know their primary role vs secondary roles |

**3. Asset Lifecycle**

| Gap | Current State | Required Intelligence |
|---|---|---|
| Draft/Published/Archived status | `site_media_assets` has no status field. `media_files` has no status field. | Assets should have a lifecycle state independent of their storage existence. |
| Replace history | None. URL-overwrite is destructive. | Assets should support replacement without breaking existing references. |
| Version history | None. Overwriting an ImageKit URL loses the previous version. | Previous versions should be accessible. |

**4. Relationship Tracking**

| Gap | Current State | Required Intelligence |
|---|---|---|
| Parent entity | None. `services.image_url = "..."` has no FK back to the service. | System should track which entity (type + ID) owns each media reference. |
| Derivative assets | None | Auto-generated thumbnails, webp variants, responsive sizes should be linked to original. |
| AI-generated derivatives | None | AI-captioned, AI-cropped, AI-upscaled versions should be traceable. |

**5. Content Intelligence**

| Gap | Current State | Required Intelligence |
|---|---|---|
| Alt text for accessibility | New column exists on `media_files` but not populated for most assets | Every image should have alt text (ideally automatically suggested via `generate-caption` edge function) |
| Dominant colors | None | Color palette extraction for design-system-aware rendering |
| Content tags / labels | None | Auto-tagging (room type, style, mood, color scheme) |
| AI description | Partial (generate-caption exists but not integrated into workflows) | AI-generated descriptions should be stored and editable |

---

## Part 8 — Future Media Requirements

### Implicit Requirements from Product Roadmap

**1. Video Management**
- Current: Videos are hardcoded MixKit URLs, YouTube embeds, or hero carousel items
- Required: Admin-uploadable video with streaming support, poster frames, duration metadata, captioning
- Implied by: Project walkthroughs, hero carousel video support, about page video

**2. Discovery Engine Assets**
- Current: 60+ discovery images dual-sourced (local + site_media_assets), Light Calibration image not in DB
- Required: All discovery images should be admin-manageable. Archetypes should have hero images. Material options should have texture images. Lighting options should have preview images.
- Implied by: Discovery config admin editors exist but are text-only — the VisualImage type is defined but unused

**3. Estimator Assets**
- Current: Zero media in estimator (single logo via site settings)
- Required: Property type images, service level illustrations, add-on previews, result visualizations
- Implied by: Estimator is text-only but will likely need visual aids for property selection, service comparison

**4. AI-Generated Assets**
- Current: `generate-caption` edge function exists for alt-text generation
- Required: AI-generated images (archetype visualizations, mood boards, design previews), AI-upscaled assets, AI-cropped variants
- Implied by: AI infrastructure is in place (OpenRouter, Claude), discovery engine already uses AI for scoring

**5. Asset Version History**
- Current: URL overwrite is destructive — no version tracking
- Required: Every asset replacement should preserve previous versions with ability to roll back
- Implied by: Content team will need to iterate on hero images, gallery images without losing originals

**6. Asset Replacement Without URL Breakage**
- Current: Changing an image URL in a CMS field requires updating every entity that references it
- Required: Assets should have stable logical identifiers. Replacing the binary should not require updating URLs in dozens of CMS records.
- Implied by: The `site_media_assets` → `media_files` pattern (FK-based) already points in this direction, but feature tables (services, projects, etc.) still store raw URLs

**7. Asset Archiving / Soft Delete**
- Current: No status field. Deleting an ImageKit URL will 404 on all pages that reference it.
- Required: Assets should be soft-deletable with a status transition (Draft → Published → Archived) that respects existing references
- Implied by: Content lifecycle management, seasonal hero images, completed project galleries

**8. Content Reuse / Cross-Entity References**
- Current: Zero cross-entity reuse. Same image uploaded separately for different purposes.
- Required: An asset should be selectable as a project hero AND a service card image AND a testimonial background
- Implied by: Portfolio and Services share the same project images; Hero carousel and Project hero could share

**9. Multi-Location Asset Usage**
- Current: An image can only be associated with one location page
- Required: Assets should be usable across multiple location pages with different roles
- Implied by: Location pages share brand imagery, hero patterns

**10. Responsive Image Variants**
- Current: `getOptimizedSrcSet()` generates responsive URLs via ImageKit transformation params at render time
- Required: Pre-generated, cached responsive variants with explicit storage and management
- Implied by: Performance optimization, reducing ImageKit transformation compute

**11. Bulk Import/Export**
- Current: ZIP import/export edge functions exist but are admin-only
- Required: Import from Google Drive, Dropbox, Figma; Export for client delivery
- Implied by: Content team workflows, client asset delivery

**12. Asset Usage Analytics**
- Current: No tracking of which assets are most viewed, which pages serve the most media
- Required: View counts, bandwidth usage, most-used assets, orphan detection
- Implied by: Performance optimization, content strategy decisions

**13. Signed URLs / Access Control**
- Current: All media publicly accessible via CDN
- Required: Private assets (client mood boards, draft projects, internal documents) behind signed URLs
- Implied by: Client portal requirements, draft/publish workflow, premium content gating

---

## Appendix A: File Reference Index

| Component | Path | Role |
|---|---|---|
| CDN utility | `apps/web/src/lib/cdn.ts` | ImageKit URL optimization layer |
| Image component | `apps/web/src/components/ui/enhanced/image.tsx` | General-purpose CDN image |
| OptimizedImage | `apps/web/src/components/ui/enhanced/OptimizedImage.tsx` | Simplified CDN image with blur |
| MediaSlot | `apps/web/src/components/ui/enhanced/MediaSlot.tsx` | `assetKey` → media resolver |
| Compare | `apps/web/src/components/ui/enhanced/compare.tsx` | Before/after slider |
| MediaService | `apps/web/src/services/MediaService.ts` | Full media CRUD (upload, delete, bulk) |
| Admin Media | `apps/web/src/pages/admin/AdminMedia.tsx` | Media library management page |
| Upload Zone | `apps/web/src/components/admin/media/MediaUploadZone.tsx` | Drag-and-drop upload |
| Media Grid | `apps/web/src/components/admin/media/MediaGrid.tsx` | Grid/list view |
| Details Sheet | `apps/web/src/components/admin/media/MediaDetailsSheet.tsx` | Metadata editor |
| Media Picker (legacy) | `apps/web/src/components/admin/media/MediaPicker.tsx` | Supabase storage picker |
| Media Picker Field | `apps/web/src/components/admin/media/MediaPickerField.tsx` | Form field with browse |
| Media Picker Modal | `apps/web/src/components/admin/MediaPickerModal.tsx` | Reusable selection dialog |
| Hero Picker Modal | `apps/web/src/components/admin/hero/HeroMediaPickerModal.tsx` | Hero-specific picker |
| Valdation schemas | `apps/web/src/lib/validation/validations.ts` | Zod schemas for CMS forms |
| ImageKit upload EF | `supabase/functions/imagekit-upload/index.ts` | Upload/delete proxy |
| Sync ImageKit EF | `supabase/functions/sync-imagekit/index.ts` | ImageKit → DB sync |
| Migrate EF | `supabase/functions/migrate-to-imagekit/index.ts` | Supabase → ImageKit migration |
| Media operations EF | `supabase/functions/media-operations/index.ts` | Bulk move/copy/delete |
| Media export EF | `supabase/functions/media-export/index.ts` | ZIP export |
| Media import EF | `supabase/functions/media-import/index.ts` | ZIP import |
| Generate caption EF | `supabase/functions/generate-caption/index.ts` | AI alt-text generation |

## Appendix B: Database Table Reference (Media-Related)

| Table | Media Column(s) | FK to media? | Status |
|---|---|---|---|
| `media_files` | `url`, `storage_provider`, `mime_type` | Self (folder_id) | ✅ Active (v2) |
| `media_folders` | `path` (ltree) | Self (parent_id) | ✅ Active (v2) |
| `site_media_assets` | `media_file_id` → `media_files` | ✅ FK | ✅ Active |
| `hero_media_items` | `media_url` | ❌ Raw URL | Active |
| `project_gallery` | `image_url` | ❌ Raw URL | Active |
| `gallery_items` | `image_url`, `video_url` | ❌ Raw URL | Active |
| `blog_posts` | `cover_image` | ❌ Raw URL | Active |
| `services` | `hero_image` | ❌ Raw URL | Active |
| `testimonials` | `avatar_url` | ❌ Raw URL | Active |
| `team_members` | `image_url` | ❌ Raw URL | Active |
| `design_process_steps` | `image_url` | ❌ Raw URL | Active |
| `site_before_after_stories` | `before_media`, `after_media` | ❌ Raw URL | Active |
| `site_settings` | `company_logo_url`, `about_video_url` | ❌ Raw URL | Active |
| `media` (legacy) | `url` | ❌ Raw URL | 🗑️ Dropped |
| `hero_media` (archived) | — | — | 🗑️ Archived |

---

*End of discovery audit. This document provides the complete map for a DAM architect to design the correct entity model.*
