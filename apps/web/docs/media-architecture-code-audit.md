# Media Architecture Code-Level Audit

> **Status**: Complete
> **Date**: 2026-06-21
> **Scope**: Every code-level fact about media storage, retrieval, and management
> **No recommendations. No schema proposals. Only reality.**

---

## 1. Database Inventory

### Active Media-Core Tables

#### `media_files` — Primary media record
**Source**: `supabase/migrations/20260610000000_media_library_schema.sql`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `folder_id` | `UUID` | — | FK → `media_folders(id)` ON DELETE CASCADE |
| `display_name` | `VARCHAR(255)` | — | NOT NULL |
| `file_name` | `VARCHAR(255)` | — | NOT NULL |
| `storage_provider` | `VARCHAR(50)` | `'imagekit'` | — |
| `storage_path` | `VARCHAR(500)` | — | NOT NULL |
| `url` | `VARCHAR(1000)` | — | NOT NULL |
| `mime_type` | `VARCHAR(100)` | `'application/octet-stream'` | NOT NULL |
| `size_bytes` | `BIGINT` | `0` | NOT NULL |
| `width` | `INTEGER` | — | nullable |
| `height` | `INTEGER` | — | nullable |
| `alt_text` | `TEXT` | — | added by `20260610085228`, nullable |
| `caption` | `TEXT` | — | added by `20260610085228`, nullable |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | — |

**Constraints**: `UNIQUE(folder_id, display_name)`
**FKs**: `folder_id` → `media_folders(id)` ON DELETE CASCADE
**URL column**: `VARCHAR(1000)` — no CHECK constraint on format
**Note**: `uploaded_by` column NOT present — `AdminMedia.tsx:169` tries to insert it into the new table, which will fail

#### `media_folders` — Hierarchical folder tree
**Source**: `supabase/migrations/20260610000000_media_library_schema.sql`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `name` | `VARCHAR(255)` | — | NOT NULL |
| `parent_id` | `UUID` | — | FK → `media_folders(id)` ON DELETE CASCADE |
| `path` | `ltree` | — | NOT NULL, GIST index |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | — |

**Constraints**: `UNIQUE(parent_id, name)`
**Indexes**: `path_gist_idx` GIST ON `(path)`

#### `site_media_assets` — Logical asset key registry
**Source**: `supabase/migrations/20260611000000_create_site_media_assets.sql`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `asset_key` | `TEXT` | — | NOT NULL, UNIQUE |
| `description` | `TEXT` | — | nullable |
| `media_file_id` | `UUID` | — | FK → `media_files(id)` ON DELETE SET NULL |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL |

**The ONLY FK to `media_files` in the entire schema.**

---

### Active Feature Tables with Media Columns

#### `hero_media` — Hero carousel slides
**Source**: `supabase/migrations/_archive/20260321_create_hero_media.sql`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK |
| `media_url` | `TEXT` | NOT NULL. **Raw URL. No FK.** |
| `media_type` | `TEXT` | NOT NULL, CHECK IN ('video','image') |
| `title` | `TEXT` | nullable |
| `display_order` | `INTEGER` | DEFAULT 0 |
| `is_active` | `BOOLEAN` | DEFAULT true |
| `duration_ms` | `INTEGER` | DEFAULT 3000 |

#### `project_gallery` — Per-project gallery images
**Source**: `supabase/migrations/20260313000001_project_relations.sql`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK |
| `project_id` | `UUID` | FK → `projects(id)` ON DELETE CASCADE |
| `image_url` | `TEXT` | NOT NULL. **Raw URL. No FK to media_files.** |
| `room_name` | `TEXT` | nullable |
| `display_order` | `INTEGER` | DEFAULT 0 |

#### `gallery_items` — CMS gallery images
**Source**: `supabase/migrations/_archive/20260404_gallery_cms.sql`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK |
| `category_id` | `UUID` | FK → `gallery_categories(id)` ON DELETE SET NULL |
| `title` | `TEXT` | NOT NULL |
| `image_url` | `TEXT` | NOT NULL. **Raw URL. No FK.** |
| `subtitle` | `TEXT` | nullable |
| `location` | `TEXT` | nullable |
| `year` | `INTEGER` | nullable |

#### `transformation_stories` — Before & after pairs
**Source**: `supabase/migrations/20260515000000_create_transformation_stories.sql`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK |
| `before_media` | `TEXT` | NOT NULL. **Raw URL. No FK.** |
| `after_media` | `TEXT` | NOT NULL. **Raw URL. No FK.** |

#### `projects` — Portfolio projects
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `cover_image_url` | `TEXT` | nullable. **Raw URL. No FK.** |
| `gallery_urls` | `TEXT[]` | nullable. **Raw URL array. No FK.** |

#### `services` — Services
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `icon_url` | `TEXT` | nullable. **Raw URL. No FK.** |

#### `blog_posts` — Blog posts
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `cover_image_url` | `TEXT` | nullable. **Raw URL. No FK.** |
| `author_id` | `UUID` | FK → `team_members(id)` ON DELETE SET NULL |

#### `testimonials` — Testimonials
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `avatar_url` | `TEXT` | nullable. **Raw URL. No FK.** |
| `project_id` | `UUID` | FK → `projects(id)` ON DELETE SET NULL |

#### `team_members` — Team
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `image_url` | `TEXT` | nullable. **Raw URL. No FK.** |

#### `design_process_steps` — Process steps
**Source**: `supabase/migrations/20260530020100_add_studio_milestones_process.sql`
| Column | Type | Notes |
|--------|------|-------|
| `image_url` | `TEXT` | nullable. **Raw URL. No FK.** |
| `image_alt` | `TEXT` | nullable |

#### `profiles` — User profiles
**Source**: `supabase/migrations/20260221100000_refine_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `avatar_url` | `TEXT` | nullable. **Raw URL. No FK.** |
| `id` | `UUID` | FK → `auth.users(id)` ON DELETE CASCADE |

#### `page_sections` — CMS sections
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `image_url` | `TEXT` | nullable. **Raw URL. No FK.** |

#### `site_settings` — Site-wide config
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql` + `20260612000001`
| Column | Type | Notes |
|--------|------|-------|
| `company_logo_url` | `TEXT` | nullable. Added by `20260612000001`. **Raw URL. No FK.** |
| `logo_light_url` | `TEXT` | nullable |
| `logo_dark_url` | `TEXT` | nullable |
| `favicon_url` | `TEXT` | nullable |
| `og_image_url` | `TEXT` | nullable |
| `about_video_url` | `TEXT` | nullable |

#### `awards` — Awards
**Source**: `supabase/migrations/_archive/20260218_blueprint_schema.sql`
| Column | Type | Notes |
|--------|------|-------|
| `image_url` | `TEXT` | nullable. **Raw URL. No FK.** |

---

### Deprecated Tables

| Table | Dropped/Renamed By | Data Migrated To |
|-------|-------------------|------------------|
| `media` | Dropped `20260610000000` | `media_files` |
| `media_assets` | Renamed `20260529180300` | → `media` → `media_files` |
| `blogs` | Renamed `20260529180300` | `blog_posts` |
| `estimate_leads` | Dropped `20260411121000` | `leads` |
| `leads_master` | Dropped `20260411120000` | `leads` |
| `milestones` | Dropped `20260221100000` | `studio_milestones` |
| `hero_media` | (archived `_archive/20260321_create_hero_media.sql`) | Still active, migration file archived |

---

### FK Relationship Map (only existing FKs)

```
media_folders
  parent_id ──► media_folders(id) ON DELETE CASCADE [self]

media_files
  folder_id ──► media_folders(id) ON DELETE CASCADE

site_media_assets
  media_file_id ──► media_files(id) ON DELETE SET NULL  ★ ONLY FK TO media_files

projects
  category_id ──► project_categories(id) ON DELETE SET NULL

project_gallery
  project_id ──► projects(id) ON DELETE CASCADE

testimonials
  project_id ──► projects(id) ON DELETE SET NULL

blog_posts
  author_id ──► team_members(id) ON DELETE SET NULL

profiles
  id ──► auth.users(id) ON DELETE CASCADE
deleted_by ──► auth.users(id) ON DELETE SET NULL

leads
  quiz_results.lead_id ──► leads(id) ON DELETE SET NULL
  lead_activities.lead_id ──► leads(id) ON DELETE CASCADE
  lead_tasks.lead_id ──► leads(id) ON DELETE CASCADE
  lead_objections.lead_id ──► leads(id) ON DELETE CASCADE
  crm_pipeline_history.lead_id ──► leads(id) ON DELETE CASCADE
  raw_payload.lead_id ──► leads(id) ON DELETE CASCADE
```

---

## 2. Media Field Inventory

### Database Columns (37 total across 17 tables)

| Table | Field | DB Type | Req/Opt | Array? |
|-------|-------|---------|---------|--------|
| `awards` | `image_url` | `TEXT` | optional | single |
| `blog_posts` | `cover_image_url` | `TEXT` | optional | single |
| `blogs` (dep) | `cover_image` | `TEXT` | optional | single |
| `blogs` (dep) | `featured_media_id` | `TEXT` | optional | single |
| `design_process_steps` | `image_url` | `TEXT` | optional | single |
| `design_process_steps` | `image_alt` | `TEXT` | optional | single |
| `gallery_items` | `image_url` | `TEXT` | **required** | single |
| `hero_media` | `media_url` | `TEXT` | **required** | single |
| `media_files` | `url` | `VARCHAR(1000)` | **required** | single |
| `media_files` | `file_name` | `VARCHAR(255)` | **required** | single |
| `media_files` | `display_name` | `VARCHAR(255)` | **required** | single |
| `media_files` | `storage_path` | `VARCHAR(500)` | **required** | single |
| `media_files` | `mime_type` | `VARCHAR(100)` | **required** | single |
| `media_files` | `alt_text` | `TEXT` | optional | single |
| `media_files` | `caption` | `TEXT` | optional | single |
| `media_files` | `storage_provider` | `VARCHAR(50)` | optional | single |
| `page_sections` | `image_url` | `TEXT` | optional | single |
| `portfolio` (dep) | `image_url` | `TEXT` | optional | single |
| `portfolio` (dep) | `video_url` | `TEXT` | optional | single |
| `profiles` | `avatar_url` | `TEXT` | optional | single |
| `project_gallery` | `image_url` | `TEXT` | **required** | single |
| `projects` | `cover_image_url` | `TEXT` | optional | single |
| `projects` | `gallery_urls` | `TEXT[]` | optional | **array** |
| `services` | `icon_url` | `TEXT` | optional | single |
| `site_content` (dep) | `image_url` | `TEXT` | optional | single |
| `site_settings` | `company_logo_url` | `TEXT` | optional | single |
| `site_settings` | `logo_light_url` | `TEXT` | optional | single |
| `site_settings` | `logo_dark_url` | `TEXT` | optional | single |
| `site_settings` | `favicon_url` | `TEXT` | optional | single |
| `site_settings` | `og_image_url` | `TEXT` | optional | single |
| `site_settings` | `about_video_url` | `TEXT` | optional | single |
| `site_settings` | `map_embed_url` | `TEXT` | optional | single |
| `team_members` | `image_url` | `TEXT` | optional | single |
| `testimonials` | `avatar_url` | `TEXT` | optional | single |
| `transformation_stories` | `before_media` | `TEXT` | **required** | single |
| `transformation_stories` | `after_media` | `TEXT` | **required** | single |
| `page_sections` | `image_url` | `TEXT` | optional | single |

**Key fact**: Only `projects.gallery_urls` is an array. All others are single-value TEXT columns. Only `site_media_assets.media_file_id` has an FK to `media_files`.

### Zod Validation Schemas (7 media fields validated)

**File**: `apps/web/src/lib/validation/validations.ts`

| Schema | Field | Validator | Line |
|--------|-------|-----------|------|
| `blogPostSchema` | `cover_image` | `z.string().url().optional().or(z.literal(""))` | 14 |
| `portfolioSchema` | `cover_image_url` | `z.string().url().optional().or(z.literal(""))` | 73 |
| `portfolioSchema` | `video_url` | `z.string().url().optional().or(z.literal(""))` | 76 |
| `serviceSchema` | `hero_image` | `z.string().url().optional().or(z.literal(""))` | 44 |
| `testimonialSchema` | `avatar_url` | `z.string().url().optional().or(z.literal(""))` | 91 |
| `siteSettingsSchema` | `company_logo_url` | `z.string().url().optional().or(z.literal(""))` | 221 |
| `siteSettingsSchema` | `about_video_url` | `z.string().url().optional().or(z.literal(""))` | 225 |

**Modules WITH NO Zod validation for media fields**: Team Members, Gallery Items, Hero Media, Page Sections, Project Gallery, Awards, Before & After, Process Steps (8 modules).

### TypeScript Interface Fields (~55 in app types + ~30 in component types)

**Key interfaces**:
- `MediaFile` (`MediaService.ts`): `id, folderId, name, url, size, createdAt, provider, mimeType, width?, height?, altText?, caption?`
- `HeroMediaItem` (`admin/hero/types.ts`): `media_url, media_type`
- `VisualImage` (`types/discovery.ts`): `url, assetKey, tags`
- `LifestyleOption` (`types/discovery.ts`): `image`
- `GalleryItem` (`AdminBeforeAndAfter.tsx`): `before_media, after_media`
- `Project` (`data/projects.ts`): `heroImage, gallery: { room: string; images: string[] }[]`
- `TransformationStory` (`data/transformationStories.ts`): `beforeMedia, afterMedia`
- `ProcessStage` (`data/process.ts`): `image`
- `BlogPost` (`types/blog.ts`): `cover_image_url`
- `ServiceDetail` (`packages/types/src/index.ts`): `hero_image`

---

## 3. Admin Media Flow

### Upload Flow — PATH A (AdminMedia.tsx, direct Supabase Storage)

```
MediaUploadZone.tsx                // Drag-drop zone, react-dropzone
  │  onUpload(acceptedFiles)
  ▼
AdminMedia.tsx (line 113-183)     // Main admin page
  │
  ├─ supabase.auth.getUser()       // line 121
  ├─ Build path: `${folder}/${file.name}`  // line 135 — NO sanitization
  ├─ supabase.storage.from("media").upload(path, file, { upsert: true })  // line 137 — Supabase Storage
  ├─ supabase.storage.from("media").getPublicUrl(path)  // line 156
  ├─ supabase.from("media_files").upsert({               // line 157
  │     url: publicUrlObj.publicUrl,
  │     storage_provider: "supabase",
  │     storage_path: path,
  │     uploaded_by: user.id,           // ← COLUMN DOES NOT EXIST on media_files
  │     ...
  │   }, { onConflict: "file_name" })
  │
  ▼
media_files table                    // storage_provider = "supabase"
```

**Bug**: `uploaded_by` column does not exist on `media_files` table. This INSERT will fail at runtime with a column-not-found error. The column existed on the old `public.media` table but was never added to `media_files`.

### Upload Flow — PATH B (MediaService.ts, ImageKit edge function)

```
MediaPickerField.tsx               // Form field: text input + Browse button
  │  onClick → opens modal
  ▼
MediaPickerModal.tsx               // Dialog modal with file list + upload button
  │  onClick "Upload" → hidden <input type="file">
  │  calls uploadMutation.mutate(fileList)
  ▼
MediaService.ts (line 160-209)     // Service layer
  │
  ├─ supabase.auth.getSession()     // line 164
  ├─ FileReader.readAsDataURL(file) // line 170 — reads entire file to base64 in memory
  ├─ supabase.functions.invoke("imagekit-upload", {  // line 172
  │     action: "upload",
  │     fileName, fileData: base64, folder: "media", useUniqueName: true
  │   })
  │
  ▼
supabase/functions/imagekit-upload/index.ts  // Edge function
  │
  ├─ verifyAdmin(req) from _lib/security.ts  // JWT + role check
  ├─ Generate unique name: `${Date.now()}-${crypto.randomUUID().slice(0,8)}-${fileName}`
  ├─ Normalize folder path
  ├─ POST https://upload.imagekit.io/api/v1/files/upload  // ImageKit API
  │     Basic Auth: IMAGEKIT_PRIVATE_KEY
  │     FormData: file (base64), fileName, folder
  │
  ▼  ImageKit returns { fileId, url, name, size, fileType, thumbnailUrl, filePath }
  │
  ▼
MediaService.ts (line 187-196)     // Back in service
  │
  ├─ supabase.from("media_files").insert({
  │     url: data.url,
  │     storage_provider: "imagekit",
  │     storage_path: data.filePath || data.name,
  │     ...
  │   })
  │
  ▼
media_files table                    // storage_provider = "imagekit"
```

### Upload Flow — PATH C (Legacy MediaPicker, Supabase Storage read-only)

```
MediaPicker.tsx                    // Legacy picker
  │
  ├─ supabase.storage.from("media").list(folder, { limit: 50 })  // SEARCHES STORAGE DIRECTLY
  ├─ supabase.storage.from("media").getPublicUrl(`${folder}/${file.name}`)
  │
  ▼  Returns URL string — NO DB WRITE
```

### Delete Flow

```
AdminMedia.tsx / MediaService.ts
  │
  ├─ IF storage_provider === "imagekit":
  │     supabase.functions.invoke("imagekit-upload", { action: "delete", filePath })
  │       → Edge function: DELETE https://api.imagekit.io/v1/files/${fileId}
  │       ** BUG: Code passes filePath, but API needs fileId **
  │       ** Comment in code: "Our edge function for 'delete' requires fileId, but we didn't store it" **
  │
  ├─ IF storage_provider === "supabase":
  │     supabase.storage.from("media").remove([storage_path])
  │
  ├─ supabase.from("media_files").delete().eq("id", id)
  │
  ▼  Storage errors are console.warn only — DB delete proceeds regardless
```

### Files involved in admin media operations (22 files):

| Step | File | Role |
|------|------|------|
| UI | `apps/web/src/components/admin/media/MediaUploadZone.tsx` | Drag-drop zone |
| UI | `apps/web/src/pages/admin/AdminMedia.tsx` | Admin media page (Path A) |
| UI | `apps/web/src/components/admin/media/MediaPicker.tsx` | Legacy picker (Path C) |
| UI | `apps/web/src/components/admin/media/MediaPickerField.tsx` | Form field |
| UI | `apps/web/src/components/admin/MediaPickerModal.tsx` | Upload modal (Path B) |
| UI | `apps/web/src/components/admin/hero/HeroMediaPickerModal.tsx` | Hero picker |
| UI | `apps/web/src/components/admin/media/MediaGrid.tsx` | File grid |
| UI | `apps/web/src/components/admin/media/MediaDetailsSheet.tsx` | Metadata editor |
| Service | `apps/web/src/services/MediaService.ts` | Service layer (Path B) |
| CDN | `apps/web/src/lib/cdn.ts` | URL optimization |
| Cache | `apps/web/src/lib/queryKeys.ts` | React Query keys |
| Edge | `supabase/functions/imagekit-upload/index.ts` | ImageKit proxy |
| Edge | `supabase/functions/sync-imagekit/index.ts` | ImageKit sync |
| Edge | `supabase/functions/media-operations/index.ts` | Bulk ops |
| Edge | `supabase/functions/media-export/index.ts` | ZIP export |
| Edge | `supabase/functions/media-import/index.ts` | ZIP import |
| Edge | `supabase/functions/generate-caption/index.ts` | AI captions |
| Security | `supabase/functions/_lib/security.ts` | Auth middleware |
| DB | `supabase/migrations/20260610000000_media_library_schema.sql` | media_files schema |
| DB | `supabase/migrations/20260611000000_create_site_media_assets.sql` | site_media_assets |
| DB | `supabase/migrations/20260609000000_media_provider_metadata.sql` | Provider metadata |
| DB | `supabase/migrations/20260610085228_add_alt_and_caption_to_media_files.sql` | Alt/caption |

---

## 4. Public Rendering Flow

### Rendering Architecture

All images route through `cdn.ts` for ImageKit CDN optimization:

```
URL (any source)
  │
  ▼
getOptimizedUrl(url, options)    // apps/web/src/lib/cdn.ts
  │
  ├─ ImageKit URL?    → append transformation params (?tr=w-800,q-80,fo-auto)
  ├─ Supabase URL?    → extract path, rebuild as ImageKit proxy URL
  ├─ /images/ path?   → prefix ImageKit endpoint (proxied through CDN)
  ├─ data: / blob:?   → pass through unmodified
  │
  ▼
<img src={optimizedUrl} />       // Rendered via Image / OptimizedImage / MediaSlot
```

### Per-Page Rendering Chains

#### Homepage (`/`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Hero | `Hero.tsx` | `hero_media` DB → `media_url` + `site_media_assets` (`hero_desktop`) | `cdn.ts` | `MediaSlot` + `<video>` |
| About | `About.tsx` | Hardcoded | `cdn.ts` | `Image` |
| Services | `Services.tsx` | `services.hero_image` DB field | `cdn.ts` | `Image` |
| Portfolio | `Portfolio.tsx` | `project.heroImage` from `data/projects.ts` | `cdn.ts` | `Image` |
| Process | `Process.tsx` | `site_media_assets` (asset key) | `cdn.ts` | `MediaSlot` |
| BeforeAfter | `BeforeAfterShowcase.tsx` | `transformation_stories.before_media`/`after_media` DB | `cdn.ts` | `Image` + `Compare` |
| Testimonials | `Testimonials.tsx` | `testimonials.avatar_url` DB | `cdn.ts` | `Image` |
| Trust | `TrustSection.tsx` | `site_media_assets` (`trust_image`) | `cdn.ts` | `MediaSlot` |
| Tactile | `TactileJourney.tsx` | `site_media_assets` (`tactile_bedroom`, etc.) | `cdn.ts` | `MediaSlot` |
| Discovery Teaser | `StyleDiscoveryTeaser.tsx` | `archetype.image` + Unsplash fallback | none (CSS bg) | CSS `backgroundImage` |
| Locations | `ServiceLocations.tsx` | `site_media_assets` (location keys) | `cdn.ts` | `MediaSlot` |
| Blog | `HomeBlog.tsx` | `blog_posts.cover_image_url` DB | `cdn.ts` | `Image` |

#### About (`/about`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Hero | `AboutHero.tsx` | `site_settings.about_video_url` (YouTube embed) | none | `<iframe>` |
| Team | `AboutTeam.tsx` | `team_members.image_url` DB | `cdn.ts` | `Image` |
| Timeline | `AboutTimeline.tsx` | `site_media_assets` (timeline keys) | `cdn.ts` | `MediaSlot` |

#### Services (`/services`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Hero | `ServicesHero.tsx` | `site_media_assets` (`services_blueprint`, `services_reality`) | `cdn.ts` | `MediaSlot` |
| Cards | `ServicesTransformations.tsx` | `project.heroImage` from `projects` DB | `cdn.ts` | `Image` |

#### Portfolio (`/portfolio`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Featured | `FeaturedJourneys.tsx` | `project.heroImage` DB | none | `<img loading="lazy">` |
| Grid | `ProjectGrid.tsx` | `project.heroImage` DB | `cdn.ts` | `Image` |
| Light Exp | `HubLightExperience.tsx` | `site_media_assets` | `cdn.ts` | `MediaSlot` |
| Archive | `ProjectArchive.tsx` | `project.heroImage` + Unsplash fallbacks | none | `<img>` |
| Hero | Portfolio hero rotator | `site_media_assets` (hero_1/2/3) | `cdn.ts` | `MediaSlot` |

#### Project Detail (`/portfolio/:slug`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Hero | Project page | `project.cover_image_url` DB | `cdn.ts` | `Image` |
| Gallery | `ProjectGallery.tsx` | `project_gallery.image_url` DB + MixKit video | `cdn.ts` | `<video>` + `<img>` |
| Canvas | `ProjectExperienceCanvas.tsx` | `assets.photos[]` + `videoUrl` + `panoramic` from data | `cdn.ts` | `<video>` + `<img>` |
| Ambience | `ProjectAmbience.tsx` | Project ambience data + hardcoded `/images/...` | none | CSS `backgroundImage` |
| Transform | `ProjectTransformation.tsx` | Gallery images + Unsplash fallbacks | `cdn.ts` | `Compare` |

#### Blog (`/blog`, `/blog/:slug`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Cards | Blog page | `blog_posts.cover_image_url` DB | `cdn.ts` | `OptimizedImage` |
| Cover | Blog detail | `blog_post.cover_image_url` DB | `cdn.ts` | `Image` |
| Inline | Blog detail body | `<img>` tags in `content` rich text | `cdn.ts` | raw `<img>` in prose |
| Newsletter | Blog page CTA | `site_media_assets` (`blog_newsletter_bg`) | `cdn.ts` | `MediaSlot` |

#### Gallery (`/gallery`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Grid | `GalleryPage.tsx` | `gallery_items.image_url` DB | `cdn.ts` | `Image` |
| Lightbox | `GalleryLightbox.tsx` | Same grid images | `cdn.ts` | `Image` |

#### Contact / Location / 404

All use `MediaSlot` with `site_media_assets` keys.

#### Discovery Engine (`/discover`)

| Stage | Component | Media Source | Transform | Render |
|-------|-----------|-------------|-----------|--------|
| Welcome | `WelcomeScreen.tsx` | `@/assets/logo-icon.png` + `/images/projects/discovery/visual-2.webp` | none (local files) | `<img>` + CSS bg |
| Visual Instinct | `VisualInstinct.tsx` | `@/constants/discovery` → 18 `visual-*.jpg` from `@/assets/discovery/` | `cdn.ts` (via MediaSlot fallback) | `TiltedCard` |
| Reflection | `ReflectionPrompt.tsx` | `@/assets/discovery/reflect-*.jpg` (29 files) | `cdn.ts` | `ImageOption` → `MediaSlot` |
| Light Calibration | `LightCalibration.tsx` | `/common_bedroom_base.png` (from public root) | none | `<img>` |
| Results | `ResultsReveal.tsx` | `visualImages` from constants + `site_media_assets` | `cdn.ts` | `MediaSlot` |

#### Estimator (`/estimator`)

| Section | Component | Media Source | Transform | Render |
|---------|-----------|-------------|-----------|--------|
| Header logo | `CostEstimator.tsx` | `logoIcon` from `@/assets/logo-icon.png` + `site_settings.logo_light_url` | none | `<img>` |
| Background | `EstimatorBackground.tsx` | Procedural canvas (GridDistortion) | none | Canvas |

**The Estimator has ZERO managed media dependencies beyond the logo.**

---

## 5. Current Relationship Graph

### Entity → Media (how entities reference media)

```
site_media_assets
  │
  ├── media_file_id ──► media_files(id) ON DELETE SET NULL  ★ ONLY FK RELATIONSHIP
  │
  ├── Consumed by: MediaSlot component
  │     Homepage (hero, process, trust, tactile, locations)
  │     About (timeline)
  │     Services (hero blueprint/reality)
  │     Portfolio Hub (hero rotator, lifestyle, cta)
  │     Blog (newsletter bg)
  │     Contact (hero bg)
  │     Location (hero bg, location cards)
  │     404 (bg)
  │     Discovery (visual-1..18, reflect-*, lifestyle-*)
  │     Brand (logo light/dark, favicon, og)
  │
  └── Archetype OG images (10 keys) → social sharing meta tags

projects
  ├── cover_image_url ──► TEXT (raw URL, no FK)
  ├── gallery_urls[ ] ───► TEXT[] (raw URL array, no FK)
  └── Consumed by: PortfolioPage, ProjectPage, Homepage

project_gallery
  ├── project_id ──► projects(id) ON DELETE CASCADE
  ├── image_url ───► TEXT (raw URL, no FK to media_files)
  └── Consumed by: ProjectGallery, ProjectExperienceCanvas

gallery_items
  ├── category_id ──► gallery_categories(id) ON DELETE SET NULL
  ├── image_url ────► TEXT (raw URL, no FK to media_files)
  └── Consumed by: GalleryPage

blog_posts
  ├── author_id ──────► team_members(id) ON DELETE SET NULL
  ├── cover_image_url ─► TEXT (raw URL, no FK to media_files)
  ├── content ─────────► JSONB (raw <img> URLs in rich text body)
  └── Consumed by: BlogPage, BlogDetailPage

services
  ├── icon_url ──► TEXT (raw URL, no FK to media_files)
  └── Consumed by: ServicesPage, ServiceDetailPage

testimonials
  ├── project_id ──► projects(id) ON DELETE SET NULL
  ├── avatar_url ──► TEXT (raw URL, no FK to media_files)
  └── Consumed by: Homepage

team_members
  ├── image_url ──► TEXT (raw URL, no FK to media_files)
  └── Consumed by: AboutPage

hero_media
  ├── media_url ──► TEXT (raw URL, no FK to media_files)
  └── Consumed by: Hero component on Homepage

transformation_stories
  ├── before_media ──► TEXT (raw URL, no FK to media_files)
  ├── after_media ───► TEXT (raw URL, no FK to media_files)
  └── Consumed by: BeforeAfterShowcase

design_process_steps
  ├── image_url ──► TEXT (raw URL, no FK to media_files)
  └── Consumed by: Process components

site_settings
  ├── company_logo_url ──► TEXT (raw URL, no FK)
  ├── about_video_url ───► TEXT (YouTube URL, no FK)
  └── Consumed by: Navbar, AboutPage

profiles
  ├── id ────────► auth.users(id) ON DELETE CASCADE
  ├── avatar_url ─► TEXT (raw URL, no FK to media_files)
  └── Consumed by: Admin UI

awards
  ├── image_url ──► TEXT (raw URL, no FK)
  └── Consumed by: Awards section

page_sections
  ├── image_url ──► TEXT (raw URL, no FK)
  └── Consumed by: CMS page sections
```

### Media → Entity (reverse — impossible to query today)

There is NO reverse relationship graph. **No database structure exists to answer "what entities use this media file?"**

The only exception is `site_media_assets`, where you could query which asset keys point to a given `media_file_id`, and then manually map asset keys to pages.

---

## 6. Media Storage Reality

### Local assets (`src/assets/`) — 60 files
| Group | Count | Format |
|-------|-------|--------|
| `src/assets/discovery/visual-*.jpg` | 18 | JPG |
| `src/assets/discovery/lifestyle-*.jpg` | 8 (+1 orphaned) | JPG |
| `src/assets/discovery/reflect-*.jpg` | 29 | JPG |
| `src/assets/logo-icon.png` | 1 | PNG |
| `src/assets/portfolio-*.jpg` | 3 | JPG |

### Public directory assets (`public/`) — 156 files
| Group | Count | Format |
|-------|-------|--------|
| `public/` root (noise, renders, logos, patterns) | 23 | mixed |
| `public/images/projects/` (portfolio renders) | 8 | JPG, WEBP |
| `public/images/projects/discovery/` | 112 | JPG, WEBP |
| `public/images/system/` | 2 | JPG, WEBP |
| `public/og/` (OG images) | 11 | JPG |

### External URLs

| Source | Count | Used In |
|--------|-------|---------|
| **Unsplash** (`images.unsplash.com`) | **72 references** | 11 component files — fallback data in process, transformation, palette, hotspot, documentation, archive components |
| **MixKit** (`assets.mixkit.co`) | **6 references** | `ProjectGallery.tsx`, `ProjectExperienceCanvas.tsx` — same walkthrough video URL |
| **YouTube** (`youtube.com`, `youtu.be`) | **7 references** | `AboutHero.tsx`, `AboutVideoModal.tsx`, `constants.ts`, social links |
| **ImageKit** (`ik.imagekit.io`) | **13 references** | `cdn.ts` (endpoint), CSP, edge functions, migration SQL |
| **Supabase Storage** (`supabase.co/storage`) | **0 in runtime code** | Only in docs and migration history |

### Video files
- **6 references** to external `.mp4` files (all MixKit, same video URL, duplicated across 2 components)
- **0 local `.mp4` files** in the repository
- **0 `.webm`, `.mov`, `.avi` files**

### Summary

| Category | Count | Managed via CMS? |
|----------|-------|-----------------|
| Local assets (`src/assets/`) | 60 | No (compiled into bundle) |
| Public assets (`public/`) | 156 | No (static files) |
| Unsplash external URLs | 72 | No (hardcoded fallbacks) |
| MixKit external videos | 6 | No (hardcoded fallbacks) |
| YouTube embeds | 7 | Partial (URL in site_settings) |
| ImageKit CDN | ∞ (managed at provider) | Yes (via edge functions) |

---

## 7. Discovery Engine Media Usage

### Image Asset Inventory

| Category | Source | File Count | Import Method | CMS-Managed? |
|----------|--------|-----------|---------------|-------------|
| Visual Instinct | `src/assets/discovery/visual-1.jpg` through `-18.jpg` | 18 | Static import in `constants/discovery.ts` | Via `site_media_assets` keys, but binary files are local |
| Lifestyle Questions | `src/assets/discovery/lifestyle-1.jpg` through `-8.jpg` | 8 (+1 orphaned) | Static import in `constants/discovery.ts` | Same — asset keys exist but binaries are local |
| Reflection Prompts | `src/assets/discovery/reflect-*.jpg` | 29 | Static import in `ReflectionPrompt.tsx` | Same — asset keys exist but binaries are local |
| Light Calibration | `/common_bedroom_base.png` (public root) | 1 | Hardcoded `<img src="...">` | **No** — not in any DB table |
| Welcome CTA bg | `/images/projects/discovery/visual-2.webp` (public root) | 1 | Hardcoded CSS background | **No** — not in any DB table |

### Archetype Media

**File**: `apps/web/src/addons/discovery/core/archetype.ts` — contains 10 archetype definitions:
- Quiet Curator, Social Minimalist, Warm Modernist, Expressive Collector, Serene Naturalist, Bold Structuralist, Intimate Storyteller, Refined Classicist, Fluid Experimentalist, Grounded Pragmatist

**These archetypes have ZERO media fields.** No hero images, no icon images, no associated media. The only archetype-related media is:
- OG images in `public/og/archetypes/*.jpg` (10 files) — hardcoded paths
- `site_media_assets` seeds for OG archetype keys (names differ from internal archetypes)

### Blueprint Page Media

**File**: `apps/web/src/addons/discovery/pages/BlueprintPage.tsx` — **Zero image assets.** Uses animation components (Squares, FadeContent, FallingText, SplitText, Magnet) — all procedural/CSS.

### Result Page Media

**File**: `apps/web/src/addons/discovery/components/ResultsReveal.tsx` — Uses `MediaSlot` with:
- `assetKey` from `visualImages[n].assetKey` (e.g., `discovery_visual-1`)
- `fallbackUrl` from `visualImages[n].url` (local import)
- OG meta tags construct URLs dynamically as `${base}/og/archetypes/${slug}.jpg`

### Orphaned Asset

**`src/assets/discovery/lifestyle-9.jpg`** exists on disk but is not imported by any code file.

---

## 8. Estimator Media Usage

**Total managed media dependencies: ZERO.**

| Component | Media | Type | Source | Managed? |
|-----------|-------|------|--------|----------|
| `PriceEstimator.tsx` | `logoIcon` | PNG | `@/assets/logo-icon.png` | Static import |
| `CostEstimator.tsx` | `logoIcon` / `settings.logo_light_url` | PNG/URL | Static + dynamic | Dynamic URL from `site_settings` |
| `StepPropertyType.tsx` | `🏗️` emoji | Text | Hardcoded inline | No |
| All other steps | Lucide icons | SVG | Library | No |
| `EstimatorBackground.tsx` | Canvas | Procedural | GridDistortion effect | No |
| `DiscoveryBackground.tsx` | CSS gradients | SVG data URI | Procedural | No |

**The Estimator section has no CMS-managed images, no media fields in its admin editors, and no asset dependencies beyond the brand logo.**

---

## 9. Current Pain Points

### Pain Point 1: `uploaded_by` column does not exist on `media_files`

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:169`
```typescript
uploaded_by: user.id,
```

**Evidence**: `media_files` table created in `20260610000000_media_library_schema.sql` does not include `uploaded_by` column. The old `public.media` table had it. The INSERT will fail at runtime with "column 'uploaded_by' does not exist".

---

### Pain Point 2: Two competing upload paths write to same table

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:137` vs `apps/web/src/services/MediaService.ts:172`

**Path A** (AdminMedia.tsx): Uploads to **Supabase Storage**, writes `storage_provider: "supabase"` to `media_files`
**Path B** (MediaService.ts): Uploads via **ImageKit edge function**, writes `storage_provider: "imagekit"` to `media_files`

Files end up in different storage backends but the same DB table. The admin UI uses Path A; the MediaPickerModal uses Path B.

---

### Pain Point 3: ImageKit delete is broken (missing `fileId`)

**File**: `apps/web/src/services/MediaService.ts:220-228`
```typescript
if (file.storage_provider === "imagekit") {
    // NOTE: Our edge function for 'delete' requires fileId, but we didn't store it.
    // We stored storage_path. We'll pass filePath which imagekit-upload might support deleting by path.
    const { error } = await supabase.functions.invoke("imagekit-upload", {
        body: { action: "delete", filePath: file.storage_path }
    });
```

The code's own comment documents this as broken. The ImageKit API requires a `fileId` for deletion, but the code stores `storage_path` and passes it as `filePath`.

---

### Pain Point 4: 15+ raw URL columns with zero FK constraints

Every feature table stores media URLs as plain TEXT with no FK to `media_files`:

- `services.icon_url`, `blog_posts.cover_image_url`, `projects.cover_image_url`, `project_gallery.image_url`, `gallery_items.image_url`, `testimonials.avatar_url`, `team_members.image_url`, `hero_media.media_url`, `transformation_stories.before_media`/`after_media`, `page_sections.image_url`, `profiles.avatar_url`, `site_settings.*_url`, `awards.image_url`, `design_process_steps.image_url`

The ONLY FK to `media_files` is `site_media_assets.media_file_id`.

**Consequences**: No cascade deletes, no referential integrity, no usage tracking, broken images when files are deleted.

---

### Pain Point 5: Legacy MediaPicker bypasses `media_files` table

**File**: `apps/web/src/components/admin/media/MediaPicker.tsx:47-74`

Queries Supabase Storage directly:
```typescript
const { data } = await supabase.storage.from(BUCKET_NAME).list(folder, { limit: 50 });
const url = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${folder}/${file.name}`);
```

This bypasses the `media_files` DB table entirely. It will only show files in Supabase Storage, NOT files uploaded via ImageKit. Files uploaded via Path B are invisible to this picker.

---

### Pain Point 6: 4 media picker components with ~70% duplicated code

| Component | Lines | Data Source | Upload | Search | File |
|-----------|-------|-------------|--------|--------|------|
| `MediaPickerField.tsx` | 85 | Delegates to modal | Via modal | Via modal | `components/admin/media/` |
| `MediaPicker.tsx` | 191 | Supabase Storage **directly** | No | Yes | `components/admin/media/` |
| `MediaPickerModal.tsx` | 183 | `MediaService.getFiles()` (DB) | Yes | Yes | `components/admin/` |
| `HeroMediaPickerModal.tsx` | 158 | DB directly (`media_files`) | No | Yes | `components/admin/hero/` |

Each implements its own search filtering, image grid, loading/empty states, and URL optimization.

---

### Pain Point 7: 8 CMS modules with zero Zod validation for media URLs

**File**: `apps/web/src/lib/validation/validations.ts` — only 7 media fields validated across 5 schemas.

Modules WITHOUT validation:
- Team Members (`image_url`) — no schema at all
- Gallery Items (`image_url`) — no schema at all
- Hero Media (`media_url`) — no schema at all
- Page Sections (`image_url`) — no dedicated field validation
- Project Gallery (`image_url`) — no schema
- Awards (`image_url`) — no schema
- Before & After (`before_media`, `after_media`) — no schema
- Process Steps (`image_url`) — no schema

Any invalid URL (broken URL, relative path, data URI) can be stored.

---

### Pain Point 8: Silent error swallowing on storage operations

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:221,251-252` and `MediaService.ts:224`

```typescript
// AdminMedia.tsx:221 — single delete
if (storageError) console.error("Storage delete failed:", storageError);
// DB delete proceeds regardless

// MediaService.ts:224 — ImageKit delete
if (error) console.warn("ImageKit delete failed:", error.message);
// DB delete proceeds regardless
```

Errors are logged to console but DB records are deleted anyway, creating inconsistent state.

---

### Pain Point 9: No pagination in storage sync

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:288-291`
```typescript
const { data: storageFiles } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder === "general" ? "" : folder, { limit: 100 });
```

Hardcoded `limit: 100` with no pagination. Folders with >100 files will only have the first 100 synced.

---

### Pain Point 10: Backward rollback condition

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:174-180`
```typescript
if (dbError) {
    if (!isAlreadyExistsError) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
    }
}
```

When `isAlreadyExistsError` is `true` (duplicate file) AND the DB upsert fails, the rollback is **skipped**. When `isAlreadyExistsError` is `false` (new file) AND the DB fails, the rollback fires. This is inverted logic.

---

### Pain Point 11: No filename sanitization

**File**: `apps/web/src/pages/admin/AdminMedia.tsx:135`
```typescript
const path = `${folder}/${file.name}`;
```

A file named `../../evil.txt` or containing path separators can create unexpected storage paths or directory traversal.

---

### Pain Point 12: Duck-typing private Supabase client property

**File**: `apps/web/src/services/MediaService.ts:314-315,356-357`
```typescript
const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl;
```

Accesses `supabase.supabaseUrl` — a private/internal property. Fragile on SDK upgrade.

---

### Pain Point 13: Orphaned local asset

**File**: `apps/web/src/assets/discovery/lifestyle-9.jpg` — exists on disk but is never imported by any code file.

---

### Pain Point 14: Hardcoded public paths not validated at build

**File**: `apps/web/src/addons/discovery/components/LightCalibration.tsx:138`:
```html
<img src="/common_bedroom_base.png" />
```

**File**: `apps/web/src/addons/discovery/components/WelcomeScreen.tsx:584`:
```typescript
backgroundImage: `url('/images/projects/discovery/visual-2.webp')`
```

These hardcoded paths to `public/` are not validated at build time. Missing files would 404 silently.

---

### Pain Point 15: `MediaService.upload()` reads entire file into memory as base64

**File**: `apps/web/src/services/MediaService.ts:169`
```typescript
const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
});
```

Large files (e.g., 100MB video) are read entirely into browser memory as base64 (33% larger than original) before being sent to the edge function. No streaming.

---

### Pain Point 16: No video management infrastructure

Videos are:
- Hardcoded MixKit URLs (6 refs in 2 files)
- YouTube embeds (7 refs in 4 files)
- Hero carousel supports video type but relies on raw URLs

No video transcoding, no poster frame generation, no streaming, no duration extraction, no captioning.

---

### Pain Point 17: No webhook handler for ImageKit events

Zero webhook handlers exist for ImageKit upload/delete/update events. If files are modified directly in ImageKit (outside the app), the DB is never notified. The `sync-imagekit` edge function exists but must be triggered manually.

---

## Appendix: File Path Index

| Area | Key Files |
|------|-----------|
| Upload (Path A) | `apps/web/src/pages/admin/AdminMedia.tsx`, `apps/web/src/components/admin/media/MediaUploadZone.tsx` |
| Upload (Path B) | `apps/web/src/services/MediaService.ts`, `apps/web/src/components/admin/MediaPickerModal.tsx`, `supabase/functions/imagekit-upload/index.ts` |
| Upload (Path C) | `apps/web/src/components/admin/media/MediaPicker.tsx` |
| Hero picker | `apps/web/src/components/admin/hero/HeroMediaPickerModal.tsx` |
| CDN | `apps/web/src/lib/cdn.ts` |
| Validation | `apps/web/src/lib/validation/validations.ts` |
| Discovery media | `apps/web/src/addons/discovery/`, `apps/web/src/constants/discovery.ts` |
| Estimator media | `apps/web/src/addons/calculators/` |
| DB migrations | `supabase/migrations/20260610000000*` through `20260612000001*` |
| Edge functions | `supabase/functions/imagekit-upload/`, `sync-imagekit/`, `migrate-to-imagekit/`, `media-operations/`, `media-export/`, `media-import/`, `generate-caption/` |
| Local assets | `apps/web/src/assets/discovery/` (56 files), `apps/web/src/assets/` (4 files) |
| Public assets | `apps/web/public/` (156 files) |

---

*End of code-level audit. Every statement references actual code files. No recommendations.*
