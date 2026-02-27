# Security Architecture & Rules

This document outlines the security hardening applied to the Supabase backend.

## 1. Row Level Security (RLS) & Roles

- **Admin Verification**: Never use `auth.jwt().role` for critical admin checks. We use the trusted Postgres function `public.is_admin(auth.uid())` which queries the `profiles` table directly.
- **Audit**: Run `psql -f supabase/migrations/sql/rls_audit.sql` periodically to verify no tables have missing policies unless intentionally deny-all, and that JWT claims are not solely relied upon.

## 2. High-Volume Tables Strategy

- **`project_views` & `analytics_events`**:
  - Partitioned by month to reduce scan overhead and write-amplification.
  - Aggregated nightly via `public.daily_project_kpis` materialized view.
  - RLS is disabled on these tables; writes must go through an authenticated Edge Function.

## 3. Rate Limiting

- **Edge Layer**: Auth-related and public-facing write endpoints are protected by a Deno KV rate limiter (`supabase/functions/rate_limiter`).
- **Quota**: Currently configured to 30 requests per minute per IP.

## 4. Server-Side Data Validation

- **`estimate_leads` pricing**: The `estimated_min` and `estimated_max` are Postgres `GENERATED ALWAYS` columns. Financial calculations happen deterministically in the database, ignoring client payloads.
- **Enforced Defaults**: Lead `status` defaults to `new` and is locked on `INSERT` via database triggers.

## 5. Fractional Ordering

- Tables requiring ordered lists (`project_images`, `service_steps`, `service_faqs`) use `rank` (text) populated with LexoRank values instead of integer intervals, preventing cascading update write-amplification.

## 6. Comment Threads

- Implemented using Postgres `LTREE` (`path` column) instead of recursive CTEs, enabling O(1) index scans for deep threads.
