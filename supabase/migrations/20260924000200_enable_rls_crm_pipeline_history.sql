-- ==========================================================================
-- Enable RLS on crm_pipeline_history
--
-- 20260313000000_production_alignment.sql created this table without RLS,
-- and anon/authenticated hold full DML grants, so anyone with the public anon
-- key could read, write or wipe it. Checked 2026-09-24: 0 rows (nothing
-- leaked), no app code, edge function or trigger uses it yet.
--
-- It is a lead stage-change audit trail, so: CRM roles (is_crm_viewer():
-- super_admin, admin, viewer) may read it and append rows attributed to
-- themselves; there are no update/delete policies, keeping history intact.
-- service_role (edge functions) bypasses RLS as usual.
--
-- Idempotent and all-or-nothing: safe to re-run.
-- ==========================================================================

BEGIN;

ALTER TABLE public.crm_pipeline_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_select_pipeline_history" ON public.crm_pipeline_history;
CREATE POLICY "crm_select_pipeline_history" ON public.crm_pipeline_history
  FOR SELECT TO authenticated
  USING ((SELECT public.is_crm_viewer()));

DROP POLICY IF EXISTS "crm_insert_pipeline_history" ON public.crm_pipeline_history;
CREATE POLICY "crm_insert_pipeline_history" ON public.crm_pipeline_history
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_crm_viewer()) AND admin_id = (SELECT auth.uid()));

COMMIT;
