# 0002. Supabase Backbone + ImageKit Visual Media Architecture

- **Date:** 2026-09-10
- **Status:** Accepted
- **Supersedes:** the working framing of "ImageKit as Sole Media Storage"

## Context

The prior framing called ImageKit the sole media storage. That was never true in
practice and created ambiguity for anyone reading the codebase:

- Vercel `public/images/` still serves static application imagery, and
  `src/lib/cdn.ts` deliberately refuses to route it through ImageKit.
- Supabase Storage still holds legacy files and is configured as the web-host
  origin behind the `/cross-angle` ImageKit URL-endpoint.
- Supabase remains the authority for every piece of structured content that
  describes an image, which is most of what the CMS actually manages.

Calling one system "sole storage" while three systems hold bytes invites the
wrong instinct at every decision point.

## Decision

Four roles, no overlap:

- **Supabase is the brain** — source of truth for all structured website data
  and CMS state.
- **ImageKit is the visual-media engine** — source of truth for managed
  high-resolution visual media and all delivery-time transformation.
- **The CMS is the control plane** — the only application-facing interface for
  managing either system. Operators do not drive Supabase and ImageKit by hand.
- **Vercel `public/` is application delivery** — reserved for immutable
  application/static assets, never treated as managed CMS media.

### Responsibility contract

| Responsibility | System |
| --- | --- |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| CMS/admin authorization | Supabase Auth + Edge Functions |
| Projects, gallery, blog, services, testimonials metadata | Supabase |
| Navigation, site configuration, SEO metadata | Supabase |
| Contact/inquiry data | Supabase |
| Media metadata (the information *about* an asset) | Supabase |
| Project / gallery / portfolio imagery and video (the bytes) | ImageKit |
| Image transformation, responsive delivery, CDN | ImageKit |
| Static UI assets | Vercel `public/` |
| Server-side business logic | Supabase Edge Functions |

**The governing relationship: Supabase owns the information about an asset;
ImageKit owns the asset itself.**

## Media indirection

Application entities must never store a raw CDN URL. They reference an asset,
and the asset resolves to a provider URL at read time. If the CDN changes, the
provider row changes and nothing else does.

This is already implemented by the DAM v3 schema — it is recorded here as the
contract, not proposed as new work:

- `assets` — the logical asset (type, source, status, title).
- `asset_versions` — the physical payload (`file_id`, `url`, mime, size).
- `asset_usages` — the polymorphic link (`domain`, `entity_type`, `entity_id`,
  `role`, `display_order`, `is_primary`).
- `asset_metadata`, `asset_tags`, `asset_tag_links` — descriptive layers.

### Rejected: per-entity foreign keys

An alternative shape — `projects.hero_media_id`, `blog_posts.cover_media_id`,
`gallery_items.media_id` — was considered and rejected. `asset_usages` already
supersedes it and is strictly more capable:

- Ordered galleries come free via `display_order`; FK columns need a join table
  per entity anyway once a gallery has more than one image.
- A new media role (`detail`, `social`, `before`, `after`) is a new row, not a
  schema migration on every entity table.
- Migration `20260622000002_dam_v3_migration.sql` already backfilled the legacy
  URL columns into `asset_usages` and renamed the originals to `deprecated_*`.
  Reintroducing FK columns would reverse shipped work.

## Upload flow

One CMS action drives both systems:

```
Admin selects file
      ↓
CMS (MediaService → UploadOrchestrator)
      ↓
Supabase-authenticated Edge Function (imagekit-upload, verifyAdmin)
      ↓
ImageKit API — upload, optimize, organize, return metadata
      ↓
Supabase: rpc_finalize_dam_asset writes the asset + version rows
      ↓
CMS links the asset to the entity via asset_usages
      ↓
Website reads it immediately
```

The ImageKit private key lives only as a Supabase secret and is never exposed
client-side. The browser reaches ImageKit exclusively through edge functions.

## ImageKit folder strategy

Folders stay predictable so a human browsing the ImageKit console can navigate:

```
cross-angle/
├── projects/{residential|commercial}/{project-slug}/{hero|gallery|detail}/
├── gallery/{residential|commercial|hospitality|office}/
├── blog/{article-slug}/
└── site/{logo|branding|social}/
```

**The folder tree is a convenience, not a source of truth.** Never derive
application structure by listing ImageKit folders — query Supabase.

## Known deviations from this contract

Recorded so they are treated as debt rather than precedent:

1. **Supabase Storage is the `/cross-angle` endpoint's web-host origin.** Legacy
   Supabase-hosted files are still served through ImageKit by origin pull, so
   Supabase Storage remains load-bearing for delivery. Severing this requires
   completing the migration in `migrate-to-imagekit`.
2. **Two schema generations coexist.** `media_files` / `media_folders` (flat
   library, carries `storage_provider` + `storage_path`) still backs the Admin
   Media panel alongside `assets` / `asset_versions` / `asset_usages`.
   `media_files` is legacy; new work targets the DAM v3 tables.
3. **`deprecated_*` columns remain** on `projects`, `project_gallery`,
   `services`, and `blog_posts`. They are read by nothing and are safe to drop
   once the fallback reads in the frontend are removed.

## Consequences

- Any change that puts a CDN URL directly on an application entity is a
  contract violation, regardless of how convenient it is.
- Any change that makes the browser talk to ImageKit's API directly is a
  contract violation — it would require shipping the private key.
- Adding a media capability means extending the CMS, not asking an operator to
  open the ImageKit or Supabase console.
- Swapping CDN providers is a change to `services/media/providers/` plus a
  backfill of `asset_versions`, and touches no entity table.
