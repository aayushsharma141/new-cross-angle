-- =====================================
-- DATABASE HARDENING: RLS & Performance
-- Cross Angle Interior - Production Ready
-- =====================================
-- Migration: 20260407000001_harden_lead_estimator_rls.sql
-- Created: 2026-04-07
-- Purpose: Tighten RLS policies and add performance indexes
-- =====================================
-- DEPENDENCIES:
--   - 20260404000002_rls_cms_rbac_tighten.sql (is_cms_editor function)
--   - 20260226120300_rls_leads.sql (anon_insert_leads policy)
--   - 20260226120400_rls_estimate_leads.sql (anon_insert_estimate_leads policy)
-- =====================================
-- IMPORTANT: This migration PRESERVES anonymous INSERT policies.
-- Lead capture forms require public access to INSERT.
-- =====================================

BEGIN;

-- =====================================
-- SECTION 1: TIGHTEN leads RLS POLICIES
-- =====================================

-- Drop the overly permissive authenticated policy
DROP POLICY IF EXISTS "auth_all_leads" ON public.leads;

-- Create admin-only SELECT policy
-- Only admins (role = 'admin' OR 'super_admin' in user_roles) can SELECT
CREATE POLICY "admin_select_leads" ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.is_cms_editor());

-- Admin-only UPDATE policy
CREATE POLICY "admin_update_leads" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (public.is_cms_editor())
  WITH CHECK (public.is_cms_editor());

-- Admin-only DELETE policy
CREATE POLICY "admin_delete_leads" ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.is_cms_editor());

-- PRESERVE: anon_insert_leads policy (from 20260226120300_rls_leads.sql)
-- This allows public lead capture without authentication
-- Verify it exists, recreate if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'anon_insert_leads'
  ) THEN
    CREATE POLICY "anon_insert_leads" ON public.leads
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- =====================================
-- SECTION 2: TIGHTEN estimate_leads RLS
-- =====================================

-- Drop the overly permissive authenticated policy
DROP POLICY IF EXISTS "auth_all_estimate_leads" ON public.estimate_leads;

-- Create admin-only SELECT policy
CREATE POLICY "admin_select_estimate_leads" ON public.estimate_leads
  FOR SELECT
  TO authenticated
  USING (public.is_cms_editor());

-- Admin-only UPDATE policy
CREATE POLICY "admin_update_estimate_leads" ON public.estimate_leads
  FOR UPDATE
  TO authenticated
  USING (public.is_cms_editor())
  WITH CHECK (public.is_cms_editor());

-- Admin-only DELETE policy
CREATE POLICY "admin_delete_estimate_leads" ON public.estimate_leads
  FOR DELETE
  TO authenticated
  USING (public.is_cms_editor());

-- PRESERVE: anon_insert_estimate_leads policy (from 20260226120400_rls_estimate_leads.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'estimate_leads' AND policyname = 'anon_insert_estimate_leads'
  ) THEN
    CREATE POLICY "anon_insert_estimate_leads" ON public.estimate_leads
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- =====================================
-- SECTION 3: TIGHTEN profiles RLS
-- =====================================

-- Drop the overly permissive public select policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Allow users to SELECT their own profile
CREATE POLICY "user_select_own_profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to SELECT all profiles
CREATE POLICY "admin_select_all_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_cms_editor());

-- PRESERVE: Existing INSERT policy (users can insert their own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile.'
  ) THEN
    CREATE POLICY "Users can insert their own profile." ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- PRESERVE: Existing UPDATE policy (users can update their own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile.'
  ) THEN
    CREATE POLICY "Users can update own profile." ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- =====================================
-- SECTION 4: ADD PERFORMANCE INDEXES
-- =====================================

-- Index for lead_type filtering (AdminLeads.tsx filter by type)
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON public.leads(lead_type);

-- Index for budget filtering
CREATE INDEX IF NOT EXISTS idx_leads_budget ON public.leads(budget);

-- Index for estimate_leads status filtering
CREATE INDEX IF NOT EXISTS idx_estimate_leads_status ON public.estimate_leads(status);

-- Index for estimate_leads created_at (for recent activity queries)
CREATE INDEX IF NOT EXISTS idx_estimate_leads_created_at ON public.estimate_leads(created_at DESC);

-- Composite index for common lead queries (status + created_at)
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at DESC);

-- =====================================
-- SECTION 5: VERIFICATION
-- =====================================

-- Log current policies for verification
SELECT
  'leads' AS table_name,
  policyname,
  cmd AS operation,
  permissive,
  roles AS applicable_roles
FROM pg_policies
WHERE tablename = 'leads';

SELECT
  'estimate_leads' AS table_name,
  policyname,
  cmd AS operation,
  permissive,
  roles AS applicable_roles
FROM pg_policies
WHERE tablename = 'estimate_leads';

SELECT
  'profiles' AS table_name,
  policyname,
  cmd AS operation,
  permissive,
  roles AS applicable_roles
FROM pg_policies
WHERE tablename = 'profiles';

COMMIT;

-- =====================================
-- SUMMARY
-- =====================================
-- This migration:
--   ✅ Preserves anonymous INSERT for leads (contact forms)
--   ✅ Preserves anonymous INSERT for estimate_leads (estimator)
--   ✅ Restricts leads SELECT/UPDATE/DELETE to admin only
--   ✅ Restricts estimate_leads SELECT/UPDATE/DELETE to admin only
--   ✅ Restricts profiles SELECT to owner + admin
--   ✅ Adds indexes for lead_type, budget, status, created_at
--   ✅ Adds composite index for common query patterns
-- =====================================
