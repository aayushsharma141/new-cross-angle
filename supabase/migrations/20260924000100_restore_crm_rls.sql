-- ==========================================================================
-- Restore RLS on leads and the CRM tables around it; close an open table
--
-- State in production (checked 2026-09-24, read-only):
--   * leads, lead_activities, lead_objections, lead_tasks, decision_events:
--     RLS on, ZERO policies. The CRM and Quote Requests show no leads (63 rows
--     exist, 27 from the estimator); the public contact form fails for every
--     visitor; newsletter signups are silently dropped (useNewsletter ignores
--     the returned error). submit-estimate still saves: it uses service_role.
--   * workspace_commitment_revisions: RLS OFF, and anon holds SELECT, INSERT,
--     UPDATE, DELETE and TRUNCATE. Anyone with the public anon key can read,
--     change or wipe its 20 lead-linked rows. Enabled here.
--
-- Model: RBAC v2 (20260702000000_rbac_v2_editor_role.sql), whose helpers all
-- exist in production (SECURITY DEFINER, read user_roles for auth.uid()):
--   is_crm_viewer()     super_admin, admin, viewer  (CRM route roles)
--   is_platform_admin() super_admin, admin
-- Helpers are wrapped in (SELECT ...) so Postgres evaluates them once per
-- statement instead of once per row.
--
-- Deliberate changes vs. the migrations:
--   * lead_objections / lead_tasks used is_admin_or_editor() FOR ALL
--     (20260529123000). Editors can't open the CRM (CRM_ROLES excludes them)
--     and viewers can, so align with leads: CRM roles read/add/update,
--     platform admins delete.
--   * decision_events / workspace_commitment_revisions had no browser-facing
--     policy in any migration. The only browser callers are the admin lead
--     workspace pages (CRM roles), which select and insert; edge functions
--     write via service_role. Append-only: no update/delete policy.
--
-- Idempotent and all-or-nothing: safe to re-run.
-- ==========================================================================

BEGIN;

-- ── leads ─────────────────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_select_leads" ON public.leads;
CREATE POLICY "crm_select_leads" ON public.leads
  FOR SELECT TO authenticated
  USING ((SELECT public.is_crm_viewer()));

DROP POLICY IF EXISTS "crm_insert_leads" ON public.leads;
CREATE POLICY "crm_insert_leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin()));

-- Viewers update status / notes / follow-ups (RBAC v2).
DROP POLICY IF EXISTS "crm_update_leads" ON public.leads;
CREATE POLICY "crm_update_leads" ON public.leads
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_crm_viewer()))
  WITH CHECK ((SELECT public.is_crm_viewer()));

DROP POLICY IF EXISTS "crm_delete_leads" ON public.leads;
CREATE POLICY "crm_delete_leads" ON public.leads
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- Public contact form and newsletter insert from the browser (write-only: no
-- anon SELECT, which is why ContactForm uses submitLead without .select()).
-- Same sanity checks as 20260317000003.
DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
DROP POLICY IF EXISTS "public_insert_leads" ON public.leads;
CREATE POLICY "public_insert_leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) > 3
    AND (message IS NULL OR length(message) <= 5000)
  );

-- ── lead_activities (RBAC v2 as written) ──────────────────────────────────
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_select_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_select_lead_activities" ON public.lead_activities
  FOR SELECT TO authenticated
  USING ((SELECT public.is_crm_viewer()));

DROP POLICY IF EXISTS "crm_insert_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_insert_lead_activities" ON public.lead_activities
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_crm_viewer()));

DROP POLICY IF EXISTS "crm_update_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_update_lead_activities" ON public.lead_activities
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin()))
  WITH CHECK ((SELECT public.is_platform_admin()));

DROP POLICY IF EXISTS "crm_delete_lead_activities" ON public.lead_activities;
CREATE POLICY "crm_delete_lead_activities" ON public.lead_activities
  FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));

-- ── lead_objections, lead_tasks ───────────────────────────────────────────
ALTER TABLE public.lead_objections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access to lead_objections" ON public.lead_objections;

DROP POLICY IF EXISTS "crm_select_lead_objections" ON public.lead_objections;
CREATE POLICY "crm_select_lead_objections" ON public.lead_objections
  FOR SELECT TO authenticated USING ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_insert_lead_objections" ON public.lead_objections;
CREATE POLICY "crm_insert_lead_objections" ON public.lead_objections
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_update_lead_objections" ON public.lead_objections;
CREATE POLICY "crm_update_lead_objections" ON public.lead_objections
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_crm_viewer())) WITH CHECK ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_delete_lead_objections" ON public.lead_objections;
CREATE POLICY "crm_delete_lead_objections" ON public.lead_objections
  FOR DELETE TO authenticated USING ((SELECT public.is_platform_admin()));

ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access to lead_tasks" ON public.lead_tasks;

DROP POLICY IF EXISTS "crm_select_lead_tasks" ON public.lead_tasks;
CREATE POLICY "crm_select_lead_tasks" ON public.lead_tasks
  FOR SELECT TO authenticated USING ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_insert_lead_tasks" ON public.lead_tasks;
CREATE POLICY "crm_insert_lead_tasks" ON public.lead_tasks
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_update_lead_tasks" ON public.lead_tasks;
CREATE POLICY "crm_update_lead_tasks" ON public.lead_tasks
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_crm_viewer())) WITH CHECK ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_delete_lead_tasks" ON public.lead_tasks;
CREATE POLICY "crm_delete_lead_tasks" ON public.lead_tasks
  FOR DELETE TO authenticated USING ((SELECT public.is_platform_admin()));

-- ── decision_events, workspace_commitment_revisions (append-only history) ─
ALTER TABLE public.decision_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_select_decision_events" ON public.decision_events;
CREATE POLICY "crm_select_decision_events" ON public.decision_events
  FOR SELECT TO authenticated USING ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_insert_decision_events" ON public.decision_events;
CREATE POLICY "crm_insert_decision_events" ON public.decision_events
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_crm_viewer()));

-- Was RLS-disabled with full anon DML grants: this line closes that exposure.
ALTER TABLE public.workspace_commitment_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_select_workspace_commitment_revisions" ON public.workspace_commitment_revisions;
CREATE POLICY "crm_select_workspace_commitment_revisions" ON public.workspace_commitment_revisions
  FOR SELECT TO authenticated USING ((SELECT public.is_crm_viewer()));
DROP POLICY IF EXISTS "crm_insert_workspace_commitment_revisions" ON public.workspace_commitment_revisions;
CREATE POLICY "crm_insert_workspace_commitment_revisions" ON public.workspace_commitment_revisions
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_crm_viewer()));

COMMIT;
