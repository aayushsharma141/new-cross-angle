-- Phase 2 Structural Enhancements

-- 1. Task Engine
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead ON public.lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due ON public.lead_tasks(due_at) WHERE completed_at IS NULL;

-- 2. Objection Tracking
CREATE TABLE IF NOT EXISTS public.lead_objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'price', 'timing', 'authority', 'trust',
    'competition', 'scope', 'financing', 'other'
  )),
  detail text,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_objections_lead ON public.lead_objections(lead_id);

-- 3. Lead Sub-Status
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS sub_status text;

-- RLS Policies
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_objections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to lead_tasks" ON public.lead_tasks FOR ALL USING (
  public.is_admin_or_editor(auth.uid())
);

CREATE POLICY "Admin full access to lead_objections" ON public.lead_objections FOR ALL USING (
  public.is_admin_or_editor(auth.uid())
);
