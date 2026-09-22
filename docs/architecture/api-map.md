# API-MAP.MD — Cross Angle Interior API Inventory

> All API calls go through Supabase PostgREST or Supabase Edge Functions
> Client: `@/integrations/supabase/client.ts` (`supabase` singleton + `invokeEdge`)
> Pattern: React Query wraps all DB calls for caching + invalidation

---

## Supabase PostgREST API Calls

These are not traditional REST endpoints — they are auto-generated from the PostgreSQL schema via PostgREST. Each table is accessible at:

```
GET  /rest/v1/<table>?<filters>    → SELECT
POST /rest/v1/<table>               → INSERT
PATCH /rest/v1/<table>?<filters>   → UPDATE
DELETE /rest/v1/<table>?<filters>  → DELETE
```

Auth: `apikey: <anon_key>` + `Authorization: Bearer <jwt>` (for authenticated requests)

### Data Queries by Domain

#### Portfolio
| Operation | Table | Used By |
|---|---|---|
| List projects (published) | `projects` | PortfolioPage, Index |
| Project by slug | `projects` | ProjectPage, OG middleware |
| Project categories | `project_categories` | PortfolioPage (filters) |

#### Services  
| Operation | Table | Used By |
|---|---|---|
| List services | `services` | ServicesPage, Index |
| Service by slug | `services` | ServiceDetailPage |
| Service steps | `service_steps` | ServiceDetailPage |
| Service FAQs | `service_faqs` | ServiceDetailPage |

#### Blog
| Operation | Table | Used By |
|---|---|---|
| List posts (published) | `blog_posts` | BlogPage |
| Post by slug | `blog_posts` | BlogDetailPage, OG middleware |
| Blog read events | `blog_user_events` | useBlogTracking (write) |
| Blog analytics | `blog_analytics` | AdminBlogPerformance |

#### CRM / Leads
| Operation | Table | Used By |
|---|---|---|
| List leads | `leads` | AdminLeads |
| Insert lead (anon) | `leads` | ContactPage form |
| Update lead status | `leads` | AdminLeads (pipeline) |
| List estimate leads | `estimate_leads` | AdminEstimateLeads |
| Lead stats RPC | `get_lead_stats()` | AdminDashboard |

#### Content
| Operation | Table | Used By |
|---|---|---|
| Testimonials | `testimonials` | Index, AboutPage |
| Gallery images | `gallery_images` | GalleryPage, AdminGallery |
| Hero slides | `hero_slides` | Index (hero carousel) |
| Before/after | `before_after_stories` | ProjectPage, AdminBeforeAndAfter |
| Team members | `team_members` | AboutPage, AdminTeam |
| Milestones | `milestones` | AboutPage, AdminMilestones |
| Process steps | `process_steps` | OurProcessPage, AdminProcessSteps |

#### Media
| Operation | Table | Used By |
|---|---|---|
| List media files | `media_files` | AdminMedia |
| Insert media file | `media_files` | imagekit-upload edge function |
| Update media metadata | `media_files` | AdminMedia (alt/caption) |

#### Discovery / Quiz
| Operation | Table | Used By |
|---|---|---|
| Insert quiz result | `quiz_results` | **No writer.** submit-discovery-lead was the only one and was deleted as orphaned; SharedResultPage resolves historical rows only. |
| List quiz results | `quiz_results` | AdminQuizAnalytics |
| Quiz result by slug | `quiz_results` | SharedResultPage |

#### Site Configuration
| Operation | Table | Used By |
|---|---|---|
| Read site settings | `site_settings` | useSiteSettings (entire app) |
| Update site settings | `site_settings` | AdminSettings |
| Read/write email templates | `email_templates` | AdminEmailTemplates |
| Read audit logs | `audit_logs` | AdminAuditLogs |

---

## Supabase Edge Functions API

All edge functions are called via:
```typescript
// Authenticated (includes JWT):
const { data, error } = await supabase.functions.invoke("function-name", { body: {} });

// Or raw fetch (also used by invokeEdge helper):
fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```

### Public Edge Function Endpoints (no auth required)

| Function | Method | Input | Output | Used By |
|---|---|---|---|---|
| `submit-estimate` | POST | `{name, email, phone, project_type, property_size, quality_tier, timeline}` | `{estimate_min, estimate_max, lead_id}` | CostEstimatorPage |
| `submit-workspace-commitment` | POST | `{name, email, phone, session_id, discoveryContext, decision_genome, project_snapshot, narrative_brief, workspace_state, versioning}` | `{success, id}` | LeadGatePhase (Discovery quiz) |
| `rate_limiter` | Middleware | IP address | Allow/block | Protects public endpoints |
| `sitemap` | GET | — | XML sitemap | `/sitemap.xml` rewrite |
| `health` | GET | — | `{status: "ok"}` | Uptime monitoring (Checkly) |

### Authenticated Edge Function Endpoints (require JWT)

| Function | Method | Input | Output | Used By |
|---|---|---|---|---|
| `manage-user` | POST | `{action, user_id}` (action: suspend/delete/unsuspend) | `{success}` | AdminUserAccessUsers |
| `invite-user` | POST | `{email, role}` | `{success}` | AdminUserAccessUsers |
| `generate-caption` | POST | `{image_url}` | `{caption}` | AdminMedia |
| `posthog-query` | POST | `{query}` | PostHog data | AdminDashboard analytics |
| `media-export` | POST | `{ids}` | export data | AdminMedia |
| `media-import` | POST | `{source}` | import result | AdminMedia |
| `imagekit-upload` | POST | `{file, folder, filename}` | `{url, fileId}` | AdminMedia |
| `log-lead-activity` | POST | `{lead_id, action, note}` | `{success}` | AdminLeads CRM |

### Database-Triggered Edge Functions (no direct HTTP call)

| Function | DB Trigger | What It Does |
|---|---|---|
| `handle-new-lead` | `leads` INSERT | Orchestrates: score → notify → auto-reply |
| `auto-score-lead` | `leads` INSERT | Calculates lead score (ML-style) |
| `notify-hot-lead` | `leads` INSERT (high score) | Notifies team of hot lead |
| `notify-telegram` | `leads` INSERT | Sends Telegram alert |
| `auto-reply-lead` | `leads` INSERT | Sends confirmation email to lead |
| `sync-user-role` | `profiles` UPDATE | Syncs role to Supabase auth custom claims |

### Cron-Scheduled Edge Functions

| Function | Schedule | What It Does |
|---|---|---|
| `weekly-report-email` | Weekly (Monday?) | Sends business metrics email to admin |
| `posthog-to-telegram` | Weekly | Sends analytics summary to Telegram |
| `retry-webhooks` | Periodic | Retries entries in `webhook_failures` table |
| `stale-lead-checker` | Periodic | Flags leads with no activity in N days |
| `sync-imagekit` | Periodic | Syncs ImageKit file list to `media_files` table |
| `sync-posthog-reporting` | Daily | Syncs PostHog events to `reporting_events` table |

---

## Vercel Edge Middleware "API" (middleware.ts)

| Path Pattern | Behavior | Response |
|---|---|---|
| Admin path + mobile UA | Block → 403 HTML | `X-Admin-Mobile-Blocked: 1` |
| Any path + bot UA | Inject OG meta → 200 | `X-OG-Injected: 1`, cached 5min |
| Everything else | Pass through | `x-middleware-next: 1` |

---

## Internal RPC Functions (PostgreSQL)

| Function | Purpose | Called By |
|---|---|---|
| `get_lead_stats()` | Returns aggregated lead counts by status | AdminDashboard |
| `upsert_service()` | Upsert service with all related data | AdminServices |
