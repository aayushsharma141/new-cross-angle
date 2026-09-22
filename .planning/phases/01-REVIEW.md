# Phase 1 Code Review: DAM Supabase Schema & Enums

**Review Depth:** Deep
**Status:** Completed
**Reviewed Files:**
- `supabase/migrations/20260622000000_dam_v3_schema.sql`
- `supabase/migrations/20260622000001_dam_v3_rpcs.sql`
- `supabase/migrations/20260622000002_dam_v3_migration.sql`

## Executive Summary
The migration files correctly implement the physical data model for the V3 DAM Architecture. Enums are created safely using idempotency blocks. The dual-write RPC is implemented accurately, and the legacy data migrations are defensive with proper existence checks.

However, there are two high-priority security concerns related to Row Level Security (RLS) policies and RPC access that must be addressed in a follow-up fix.

---

## Findings

### 1. 🚨 CRITICAL: Insecure RLS Policies for Authenticated Users
**Location:** `20260622000000_dam_v3_schema.sql` (Lines 166-172)
**Description:** 
The RLS policies grant full access (`ALL`) to any `authenticated` user across all DAM tables. 
```sql
CREATE POLICY "Auth Full Access for Assets" ON public.assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
```
**Impact:** Any user with a valid JWT (even non-admins or end-users) can delete, modify, or insert asset data.
**Recommendation:** Restrict `ALL` access to users who satisfy the `is_admin_or_editor(auth.uid())` check.

### 2. ⚠️ WARNING: RPC Function is SECURITY DEFINER without Permission Checks
**Location:** `20260622000001_dam_v3_rpcs.sql` (Line 9)
**Description:** 
`rpc_register_dam_asset` executes as `SECURITY DEFINER` (running with the privileges of the creator) but lacks an internal authorization check. Since REST endpoints expose RPCs to authenticated users, this function bypasses RLS and allows any user to create assets.
**Recommendation:** Add a `GRANT EXECUTE ON FUNCTION` for `authenticated` only, and include a role check (e.g., `is_admin_or_editor`) at the beginning of the function body.

### 3. ℹ️ INFO: Dropping Legacy Columns (Future Deprecation)
**Location:** `20260622000002_dam_v3_migration.sql` (Line 84+)
**Description:**
The migration renames the old image columns (e.g., `cover_image_url` to `deprecated_cover_image_url`). This is the correct, safe approach. 
**Recommendation:** No action needed now, but remember to create a future Phase 5 ticket to fully `DROP` these columns once the DAM is 100% verified in production.

---

## Next Steps
To resolve these findings, please run:
`/gsd-code-review 1 --fix` 
*(This will spawn the code-fixer agent to apply the RLS and RPC security fixes.)*
