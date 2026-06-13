-- ================================================================
-- Phase 5: JSONB Schema Validation Check Constraints
-- ================================================================
BEGIN;

ALTER TABLE public.leads
  ADD CONSTRAINT chk_leads_estimate_breakdown_is_object CHECK (estimate_breakdown IS NULL OR jsonb_typeof(estimate_breakdown) = 'object'),
  ADD CONSTRAINT chk_leads_internal_notes_is_object CHECK (internal_notes IS NULL OR jsonb_typeof(internal_notes) = 'object'),
  ADD CONSTRAINT chk_leads_form_data_is_object CHECK (form_data IS NULL OR jsonb_typeof(form_data) = 'object');

COMMIT;
