# 04 Backend & Infrastructure Audit: CrossAngle Interior

**Auditor:** Antigravity Elite Protocol  
**Tier Assignment:** Professional Production-Level

---

## 1. Database Architecture

### 1.1 Migration Health

| Metric | Value | Assessment |
| :--- | :--- | :--- |
| Total migration files | 65 | Heavy migration history |
| `.bak` (abandoned) files | 19 | ❌ Unclean — indicates failed/reverted migrations left in-tree |
| Named migrations (non-timestamped) | 3 (`complete_setup.sql`, `fix_rls_policies.sql`, `storage_setup.sql`) | ⚠️ Ad-hoc scripts bypassing the migration framework |
| Date range | 2024-02-07 → 2026-04-08 | Active development over 2+ years |

**Critical Finding:** 19 `.bak` files suggest a pattern of "migration by trial-and-error." Combined with `manual_schema_fix.sql` at the repo root and named scripts like `complete_setup.sql`, this indicates the migration pipeline has been bypassed multiple times, creating drift risk between environments.

### 1.2 Schema Design (Inferred from Types & Migrations)

**Tables identified:** `leads`, `leads_master`, `estimate_leads`, `raw_payload`, `projects`, `project_gallery`, `project_materials`, `project_categories`, `blogs`, `blog_events`, `testimonials`, `profiles`, `user_roles`, `hero_media`, `site_settings`, `audit_logs`, `gallery_items`, `team_members`

**Observations:**

- ✅ Proper relational design with foreign keys (`project_gallery → projects`, `project_materials → projects`).
- ⚠️ **Dual lead tables** — `leads` and `leads_master` both store contact data. The `submit-discovery-lead` function inserts into BOTH, creating data redundancy and potential consistency issues.
- ✅ `user_roles` separated from `profiles` — clean RBAC design.
- ✅ Typed schema via auto-generated `types.ts`.

### 1.3 Query Efficiency

**N+1 Risk Assessment:**

- ✅ Projects query uses eager loading: `.select('*, project_gallery(*), project_materials(*), project_categories(name)')`.
- ✅ RPC functions (`increment_blog_view`, `get_admin_users`, `get_total_media_bytes`) push computation to the database.
- ⚠️ `LeadService.getLeadStats()` fetches ALL leads (`select('*')`) to compute stats client-side — this will not scale beyond ~1000 records. Should be a database view or RPC.

## 2. Edge Functions Architecture

### 2.1 Function Inventory (15 deployable functions)

| Function | Purpose | Auth | Rate Limited |
| :--- | :--- | :--- | :--- |
| `submit-discovery-lead` | Public lead capture | None (public) | ✅ 10/min via KV |
| `submit-estimate` | Public estimate form | None (public) | ✅ (assumed) |
| `handle-new-lead` | Lead processing pipeline | Service role | — |
| `process-lead` | Lead enrichment | Service role | — |
| `score-lead` | Lead scoring | Service role | — |
| `auto-reply-lead` | Automated email response | Service role | — |
| `notify-hot-lead` | Hot lead alerts | Service role | — |
| `manage-user` | User CRUD | ✅ Admin JWT | — |
| `invite-user` | User invitation | ✅ Admin JWT | — |
| `sync-user-role` | Role synchronization | ✅ JWT | — |
| `assign-first-admin` | Bootstrap admin | Service role | — |
| `inspect-schema` | Schema inspection (debug) | Service role | — |
| `generate-caption` | AI caption generation | — | — |
| `cda-api` | Content delivery API | — | — |
| `rate_limiter` | Deprecated? | — | — |

**Findings:**

- ✅ Shared `_lib/security.ts` provides centralized CORS, rate limiting, and auth — excellent pattern.
- ⚠️ `inspect-schema` should be disabled in production — it exposes database structure.
- ⚠️ `rate_limiter` appears to be a legacy standalone function replaced by the KV-backed implementation in `_lib/security.ts`.

### 2.2 Service Role Key Usage

All edge functions correctly use `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` — keys are never hardcoded and are only accessed server-side. ✅

## 3. API Design

- ✅ Uses Supabase's auto-generated REST API (PostgREST) for CRUD operations.
- ✅ Edge Functions follow a consistent request/response pattern with standard HTTP status codes.
- ⚠️ No API versioning strategy — breaking changes to edge functions will affect all clients immediately.
- ⚠️ No OpenAPI/Swagger documentation for custom edge functions.

## 4. Horizontal Scalability

| Concern | Status |
| :--- | :--- |
| Database connection pooling | ✅ Handled by Supabase (PgBouncer) |
| Stateless functions | ✅ All edge functions are stateless |
| File storage | ✅ Supabase Storage with CDN fallback |
| Rate limiting persistence | ✅ Deno KV (survives cold starts) |
| Session handling | ✅ JWT-based, no server-side sessions |
| Caching layer | ⚠️ No Redis/Memcached — TanStack Query handles client-side only |

## 5. Recommendations

1. **Clean migration directory** — remove `.bak` files and consolidate ad-hoc scripts into proper timestamped migrations.
2. **Unify lead tables** — merge `leads` and `leads_master` or establish a clear primary/secondary relationship with foreign keys.
3. **Move `getLeadStats` to DB** — create a PostgreSQL view or RPC function for lead analytics.
4. **Disable `inspect-schema` in production** — or gate it behind `verifyAdmin`.
5. **Remove legacy `rate_limiter` function** if it's been superseded.

---
*Finding 04: Backend & Infrastructure Report Finalized.*
