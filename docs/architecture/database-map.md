# DATABASE-MAP.MD — Cross Angle Interior Database Architecture

> Backend: Supabase PostgreSQL
> ORM: None — direct PostgREST via Supabase JS SDK (typed via auto-generated types.ts)
> Type file: `apps/web/src/integrations/supabase/types.ts` (167 KB, auto-generated)
> Migrations: `supabase/migrations/` (68 files, Jan 2026 → Jun 2026)

---

## ⚠️ Critical Field Name Reference

**These bugs have already occurred. Always use the CORRECT column names:**

| ❌ Do NOT use | ✅ Use instead | Table |
|---|---|---|
| `full_name` | `name` | `leads` |
| `service` | `lead_source` | `leads` |
| `source` | `lead_source` | `leads` |
| `title` | `name` | `services` |
| `author` | `name` | `testimonials` |
| `client_name` | `name` | `testimonials` |
| `is_active` | `active` | `testimonials` |
| `is_featured` | `active` | `testimonials` |
| `tags` | `category_id` | `projects` |
| `username` | `full_name` | `profiles` |

---

## Table Catalog

### CLUSTER 1: Portfolio

#### `project_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `name` | text NOT NULL | Category name |
| `display_order` | int | Sort order |

**Referenced by:** `projects.category_id`

#### `projects`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `title` | text NOT NULL | |
| `slug` | text UNIQUE NOT NULL | URL identifier |
| `description` | text | |
| `category_id` | uuid FK → project_categories | |
| `client_name` | text | |
| `location` | text | |
| `budget` | text | Display only (e.g., "₹25L - ₹50L") |
| `status` | text | CHECK: 'draft' or 'published' |
| `views` | int | Auto-incremented on view |
| `image_url` | text | ImageKit CDN URL |
| `cover_image` | text | OG/social share image |
| `created_at` | timestamptz | |

**Used by:** PortfolioPage, ProjectPage, AdminPortfolio, OG middleware  
**Indexed on:** slug, status, category_id

---

### CLUSTER 2: Services

#### `services`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | ⚠️ Use `name` NOT `title` |
| `slug` | text UNIQUE NOT NULL | |
| `description` | text | |
| `icon_name` | text | Lucide icon name |
| `image_url` | text | |
| `display_order` | int | |

**Referenced by:** `service_steps.service_id`, `service_faqs.service_id`

#### `service_steps`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `service_id` | uuid FK → services | ON DELETE CASCADE |
| `step_number` | int NOT NULL | |
| `title` | text NOT NULL | |
| `description` | text | |

#### `service_faqs`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `service_id` | uuid FK → services | ON DELETE CASCADE |
| `question` | text NOT NULL | |
| `answer` | text NOT NULL | |

---

### CLUSTER 3: Lead Interactions

#### `leads`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | ⚠️ Use `name` NOT `full_name` |
| `email` | text | |
| `phone` | text | |
| `message` | text | |
| `status` | text | CHECK: 'new' / 'contacted' / 'qualified' / 'won' / 'lost' |
| `lead_source` | text | ⚠️ Use `lead_source` NOT `service` or `source` |
| `city` | text | Auto-normalized by DB trigger |
| `lead_score` | numeric | Set by auto-score-lead edge function |
| `pipeline_stage` | text | CRM pipeline column |
| `form_data` | jsonb | Raw form submission data |
| `crm_notes` | text | Internal CRM notes |
| `last_contacted_at` | timestamptz | |
| `created_at` | timestamptz | |

**Anon INSERT:** Allowed (RLS policy)  
**Anon SELECT:** ❌ Blocked  
**Triggers:** handle-new-lead → auto-score → notify-telegram → auto-reply  
**Indexed on:** created_at, status, city

#### `estimate_leads`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `email` | text | |
| `phone` | text | |
| `project_type` | text | |
| `property_size` | text | |
| `quality_tier` | text | |
| `timeline` | text | |
| `estimate_total_min` | numeric | ⚠️ **SERVER-SIDE ONLY** — never trust client |
| `estimate_total_max` | numeric | ⚠️ **SERVER-SIDE ONLY** — never trust client |
| `status` | text | Default: 'new' |
| `created_at` | timestamptz | |

**Set by:** `submit-estimate` edge function (server-side calculation)

---

### CLUSTER 4: Content

#### `blog_posts` (canonical table name)
> Note: CROSSANGLE.md references `blogs` — verify which is canonical in production

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `title` | text NOT NULL | |
| `slug` | text UNIQUE NOT NULL | |
| `excerpt` | text | |
| `content` | text | HTML or markdown |
| `cover_image` | text | ImageKit URL |
| `cover_image_url` | text | Alternate field (legacy) |
| `image_url` | text | Alternate field (legacy) |
| `read_time` | text | e.g. "5 min read" |
| `status` | text | CHECK: 'draft' or 'published' |
| `tags` | text[] | Array of tags |
| `created_at` | timestamptz | |
| `published_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `testimonials`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | ⚠️ Use `name` NOT `author` or `client_name` |
| `role` | text | Client's job title / location |
| `content` | text NOT NULL | Review text |
| `rating` | numeric | CHECK: 1 to 5 |
| `active` | boolean | ⚠️ Use `active` NOT `is_active` or `is_featured` |
| `image_url` | text | Optional client photo |

#### `gallery_images`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `url` | text | ImageKit CDN URL |
| `category` | text | Room type / style tag |
| `display_order` | int | |
| `alt` | text | Accessibility label |
| `caption` | text | |
| `project_id` | uuid FK → projects | Optional link |

#### `hero_slides`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `image_url` | text | Full-screen background |
| `video_url` | text | Optional video |
| `title` | text | Overlay headline |
| `subtitle` | text | Overlay subheadline |
| `cta_text` | text | Button label |
| `cta_url` | text | Button destination |
| `display_order` | int | |
| `active` | boolean | |

#### `before_after_stories`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `title` | text | |
| `description` | text | |
| `before_image_url` | text | |
| `after_image_url` | text | |
| `project_id` | uuid FK → projects | Optional |
| `display_order` | int | |

#### `team_members`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `role` | text | Job title |
| `bio` | text | |
| `avatar_url` | text | |
| `display_order` | int | |
| `active` | boolean | |

#### `milestones`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `year` | int | |
| `title` | text | |
| `description` | text | |
| `display_order` | int | |

#### `process_steps`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `step_number` | int | |
| `title` | text | |
| `description` | text | |
| `icon_name` | text | Lucide icon |

---

### CLUSTER 5: User / Auth

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK → auth.users | ON DELETE CASCADE |
| `full_name` | text | ⚠️ This table uses `full_name` (not `name`) |
| `avatar_url` | text | |
| `role` | text | CHECK: 'super_admin' / 'admin' / 'viewer' |
| `created_at` | timestamptz | |

**Auto-created:** DB trigger on `auth.users` INSERT  
**Roles:** `super_admin` > `admin` > `viewer`

---

### CLUSTER 6: Configuration

#### `site_settings` (single row)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Single row |
| `studio_name` | text | "Crossangle Interior" |
| `tagline` | text | |
| `email` | text | |
| `phone` | text | |
| `whatsapp` | text | Number only (no +) |
| `address` | text | |
| `map_embed_url` | text | Google Maps embed |
| `business_hours` | jsonb | |
| `logo_light_url` | text | Logo for dark backgrounds |
| `logo_dark_url` | text | Logo for light backgrounds |
| `company_logo_url` | text | Primary logo |
| `favicon_url` | text | |
| `og_image_url` | text | Default social share image |
| `about_video_url` | text | YouTube embed URL |
| `seo_title_template` | text | "%s \| Crossangle Interior" |
| `seo_description` | text | |
| `ga_measurement_id` | text | Google Analytics |
| `fb_pixel_id` | text | Facebook Pixel |
| `posthog_api_key` | text | ⚠️ Stored in DB, read by client (consider security) |
| `posthog_host` | text | |
| `resend_api_key` | text | ⚠️ Email key — should be edge function only |
| `maintenance_mode_active` | boolean | Activates maintenance page |
| `admin_email` | text | |
| `nav_links` | jsonb[] | Dynamic navigation |
| `footer_columns` | jsonb[] | Dynamic footer links |
| `social_links` | jsonb | Social media URLs |
| `studio_stats` | jsonb | {yearsExperience, happyClients, projectsCompleted, awardsWon} |
| `integrations` | jsonb | Third-party integration config |
| `security_config` | jsonb | |
| `updated_at` | timestamptz | |

#### `email_templates`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Template identifier |
| `subject` | text | Email subject line |
| `html_body` | text | HTML email content |
| `updated_at` | timestamptz | |

---

### CLUSTER 7: Analytics & System

#### `quiz_results`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `session_id` | text UNIQUE | Shareable slug |
| `aesthetic_profile` | text | Detected style (e.g. "Modern Minimalist") |
| `responses` | jsonb | Raw quiz answers |
| `lead_id` | uuid FK → leads | If lead captured |
| `created_at` | timestamptz | |

#### `audit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `actor_id` | uuid FK → auth.users | Who did it |
| `action` | text | e.g. "UPDATE", "DELETE" |
| `resource_type` | text | e.g. "projects", "leads" |
| `resource_id` | uuid | Which record |
| `old_data` | jsonb | Before state |
| `new_data` | jsonb | After state |
| `created_at` | timestamptz | |

**GIN indexed** for fast JSONB searches

#### `blog_user_events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `blog_slug` | text | |
| `event_type` | text | 'read_start', 'read_complete', 'scroll_50', etc. |
| `session_id` | text | Browser session |
| `created_at` | timestamptz | |

#### `reporting_events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `event_type` | text | |
| `properties` | jsonb | |
| `created_at` | timestamptz | |

#### `media_files`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `file_name` | text UNIQUE | Unique filename constraint |
| `url` | text | ImageKit CDN URL |
| `provider` | text | 'imagekit' or 'supabase' |
| `mime_type` | text | |
| `size_bytes` | int | |
| `alt` | text | Accessibility |
| `caption` | text | |
| `folder` | text | ImageKit folder path |
| `imagekit_file_id` | text | ImageKit reference |
| `created_at` | timestamptz | |

#### `webhook_failures`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `function_name` | text | Which edge function failed |
| `payload` | jsonb | Original request body |
| `error` | text | Error message |
| `retry_count` | int | |
| `created_at` | timestamptz | |

#### `site_assets`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `asset_type` | text | 'logo', 'favicon', 'og-image', etc. |
| `url` | text | |
| `label` | text | Display name |

---

## Entity Relationships

```
auth.users (Supabase managed)
  └──► profiles (1:1 — via trigger)
         └──► audit_logs.actor_id

project_categories (1:N)
  └──► projects
         └──► before_after_stories
         └──► gallery_images (optional)

projects
  └──► project_categories (N:1)

services (1:N)
  ├──► service_steps (ON DELETE CASCADE)
  └──► service_faqs (ON DELETE CASCADE)

leads (1:1 optional)
  └──► quiz_results.lead_id
  └──► estimate_leads (separate — not directly linked)

quiz_results
  └──► leads (optional FK)

blog_posts
  └──► blog_user_events (via slug, not FK)
  └──► blog_analytics (via slug, not FK)
```

---

## Row Level Security Summary

```sql
-- Anon (public) role:
leads:          INSERT ✅  SELECT ❌  UPDATE ❌  DELETE ❌
estimate_leads: INSERT ✅  SELECT ❌  UPDATE ❌  DELETE ❌
projects:       INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌  (published only)
services:       INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌
blog_posts:     INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌  (published only)
testimonials:   INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌  (active only)
gallery_images: INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌
hero_slides:    INSERT ❌  SELECT ✅  UPDATE ❌  DELETE ❌
quiz_results:   INSERT ✅  SELECT ✅  UPDATE ❌  DELETE ❌

-- Authenticated (admin/viewer):
All tables: Full CRUD ✅ (via supabase.auth JWT)
media bucket: Read/Write ✅

-- service_role (edge functions only):
Bypasses all RLS — used only in: manage-user, invite-user, assign-first-admin
```

---

## Migration Strategy

1. **Never edit** past migration files
2. **Name format:** `YYYYMMDDHHMMSS_description.sql`
3. **Apply:** `supabase db push`
4. **Reset (dev only):** `supabase db reset --no-confirmation`
5. **Production:** Always confirm with Aayush before applying
6. Each migration file should have a rollback comment at the top
