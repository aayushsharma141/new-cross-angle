-- Lead capture automation: CRM tasks + lead automation metadata

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS budget_value_inr BIGINT,
ADD COLUMN IF NOT EXISTS auto_reply_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_reply_template TEXT,
ADD COLUMN IF NOT EXISTS internal_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_budget_value_inr ON public.leads (budget_value_inr);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL DEFAULT 'initial_follow_up',
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'pending',
    due_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT crm_tasks_priority_check CHECK (priority IN ('high', 'normal')),
    CONSTRAINT crm_tasks_status_check CHECK (status IN ('pending', 'completed', 'cancelled'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_tasks_lead_type_unique
ON public.crm_tasks (lead_id, task_type);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_status_due_at
ON public.crm_tasks (status, due_at);

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read crm_tasks" ON public.crm_tasks;
CREATE POLICY "Admin read crm_tasks" ON public.crm_tasks
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('super_admin', 'admin', 'viewer')
    )
);

DROP POLICY IF EXISTS "Admin manage crm_tasks" ON public.crm_tasks;
CREATE POLICY "Admin manage crm_tasks" ON public.crm_tasks
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('super_admin', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('super_admin', 'admin')
    )
);

DROP TRIGGER IF EXISTS update_crm_tasks_updated_at ON public.crm_tasks;
CREATE TRIGGER update_crm_tasks_updated_at
BEFORE UPDATE ON public.crm_tasks
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();
