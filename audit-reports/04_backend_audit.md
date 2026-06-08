# Backend & Infrastructure Audit Report

This audit evaluates the database schema, query patterns, RLS policies, indexing, and overall backend scalability of the **Cross Angle Interior** platform.

---

## 1. Technology Stack & Architecture

The backend infrastructure leverages a serverless database architecture powered by **Supabase (PostgreSQL)**, complemented by **Supabase Edge Functions** (Deno) for asynchronous processing, and **pg_cron** for database-level task scheduling.

### Key Backend Components:
* **Database**: PostgreSQL 15+ (Supabase Managed instance)
* **API Middleware**: PostgREST (auto-generated RESTful API endpoints mapped to DB schema)
* **Auth**: Supabase Auth (GoTrue API)
* **Serverless Functions**: Supabase Edge Functions (TypeScript on Deno)
* **Client Data Fetching**: TanStack Query (React Query v5) in the frontend for caching, pagination, and query deduplication.

---

## 2. Database Schema & Modularity

The database structure is decoupled into specific domain-centric tables. Let's analyze the core components:

| Domain | Core Tables | Key Relationships |
| :--- | :--- | :--- |
| **Content Management** | `blog_posts`, `media`, `services` | `blog_posts.author_id` -> `auth.users`<br>`services.category_id` -> `service_categories.id` |
| **Lead Generation & CRM** | `leads`, `webhook_failures` | `raw_payload.lead_id` -> `leads.id` |
| **Aesthetics & Estimates** | `quiz_results`, `estimator_flow_config` | Linked to leads via JSON metadata or UUID associations |

### Consolidation Improvements:
The schema was recently normalized by merging `leads_master` into `leads` and consolidating duplicate `blogs` and `media_assets` structures into optimized tables. This reduces query complexity and joins.

---

## 3. Query Efficiency & Indexing Strategy

### A. Indexing Strengths
* **GIN (Generalized Inverted Index)**: Enabled on JSONB fields like `leads.internal_notes` and `leads.form_data` allowing fast key-value lookups inside unstructured forms.
* **Specialized B-Tree Indexes**:
  * `idx_webhook_failures_pending` on `webhook_failures(next_retry_at) WHERE status = 'pending'` optimizes polling for retry automation.
  * Explicit lead indexing (`idx_raw_payload_lead_id` and indexes on `leads.email`) prevents table scans during CRM retrieval.

### B. Potential Query Inefficiencies & N+1 Problems
* **Frontend Fetching Patterns**: Because the application uses React Router and lazy loading, nested subcomponents could theoretically trigger N+1 queries if components fetch their own child relations.
* **Resolution**: Standardized on TanStack Query (`useQuery`) with prefetching configured at the route level. This ensures single-fetch joins (using PostgREST `.select('*, categories(*)')` selectors) instead of iterative REST calls.

---

## 4. Row Level Security (RLS) & Protection

The database has explicit security policies protecting user data:
* **RLS Policies**: Enabled on `leads`, `webhook_failures`, and user role tables.
* **Security Definer Wrappers**: Helper functions such as `handle_lead_score_update` and `handle_new_lead_telegram_notify` use `SECURITY DEFINER` with search paths explicitly set to `public`. This prevents search path hijacking while granting execution privileges to triggers.

---

## 5. Horizontal Scalability & Production Readiness

### A. Scalability Strengths
1. **Connection Pooling**: Uses PgBouncer/Supabase Pooler on port `6543` for transaction-level pooling, allowing the database to support thousands of concurrent client connections.
2. **Edge Processing Offloading**: High-compute actions (like scoring leads using natural language signals or triggering webhooks) are decoupled from the main database execution stream into Supabase Edge Functions.

### B. Recommendations for Production Scale
* **Replication**: For ultra-high traffic, separate read-replicas should be enabled for content delivery (blogs/gallery fetching), while keeping the primary write instance reserved for lead writes.
* **JSONB Schema Validations**: Add Postgres check constraints or JSON schema validations at the DB trigger level for JSONB payloads to ensure schema drift does not corrupt form data.
