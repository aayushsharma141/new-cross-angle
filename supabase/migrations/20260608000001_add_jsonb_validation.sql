-- ================================================================
-- Phase 5: JSONB Schema Validation Check Constraints
-- ================================================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'estimate_breakdown') THEN
    ALTER TABLE public.leads ADD CONSTRAINT chk_leads_estimate_breakdown_is_object CHECK (estimate_breakdown IS NULL OR jsonb_typeof(estimate_breakdown) = 'object');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'internal_notes') THEN
    ALTER TABLE public.leads ADD CONSTRAINT chk_leads_internal_notes_is_object CHECK (internal_notes IS NULL OR jsonb_typeof(internal_notes) = 'object');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'form_data') THEN
    ALTER TABLE public.leads ADD CONSTRAINT chk_leads_form_data_is_object CHECK (form_data IS NULL OR jsonb_typeof(form_data) = 'object');
  END IF;
END $$;
