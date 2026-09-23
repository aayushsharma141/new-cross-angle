-- Migration: restore self-read on public.user_roles (F-16 — admin lockout)
--
-- Symptom, verified live on 2026-09-23 against the linked project:
--   * a super_admin's own JWT:  GET /rest/v1/user_roles?select=role  -> 200 with 0 rows
--   * the same JWT:             POST /rest/v1/rpc/is_platform_admin  -> true
--   * the service role:         4 rows present, including this user's 'super_admin'
--
-- 200-with-zero-rows (not 401) means the table GRANT to `authenticated` is
-- intact and RLS filtered every row away: there is no SELECT policy that a
-- plain authenticated user can satisfy. The original schema had one
-- ("Users can view own role", auth.uid() = user_id); it is gone.
--
-- Impact: AuthProvider.fetchUserRole() reads user_roles, gets nothing, falls
-- back to the sync-user-role edge function (currently 500 server-side and
-- CORS-blocked in the browser), exhausts its retries and resolves role = null.
-- AuthGuard then fails closed to /admin/auth?error=role_unavailable, so the
-- legitimate super_admin cannot enter the admin panel. Confirmed by driving a
-- real browser login against production: password accepted (SIGNED_IN), role
-- never resolves, page stays on /admin/auth.
--
-- This restores only the self-read. It does NOT grant write access, does NOT
-- let anyone read another user's role, and does not touch the super-admin
-- management policy.

BEGIN;

-- Idempotent: drop by both names this policy has carried historically.
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "users_select_own_role" ON public.user_roles;

CREATE POLICY "Users can view own role"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- The browser reads this table through the /api/supabase proxy as the
-- authenticated user, so the table grant must remain in place.
GRANT SELECT ON public.user_roles TO authenticated;

COMMIT;

-- Verify after applying (as the signed-in admin, not the service role):
--   select role from public.user_roles;            -- expect exactly your own row
-- and in the browser: /admin should reach the dashboard instead of bouncing
-- back to /admin/auth?error=role_unavailable.
