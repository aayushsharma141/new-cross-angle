-- Server-side audit logging via DB triggers
-- Ensures audit trail cannot be bypassed by malicious clients

BEGIN;

-- Ensure audit_logs table exists with proper structure
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT 'server',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_fn() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('CREATE', TG_TABLE_NAME, NEW.id::text, auth.uid(),
      jsonb_build_object('new', to_jsonb(NEW) - 'content'));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id::text, auth.uid(),
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id::text, auth.uid(),
      jsonb_build_object('deleted', to_jsonb(OLD) - 'content'));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach triggers to key tables
DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_blog_posts ON public.blog_posts;
CREATE TRIGGER audit_blog_posts AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_projects ON public.projects;
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_services ON public.services;
CREATE TRIGGER audit_services AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_media ON public.media;
CREATE TRIGGER audit_media AFTER INSERT OR UPDATE OR DELETE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_testimonials ON public.testimonials;
CREATE TRIGGER audit_testimonials AFTER INSERT OR UPDATE OR DELETE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

-- Lead activity trigger: auto-log status changes to lead_activities
CREATE OR REPLACE FUNCTION public.log_lead_status_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_activities (lead_id, type, content, user_id)
    VALUES (NEW.id, 'status_changed',
      format('Status changed from %s to %s', OLD.status, NEW.status),
      auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lead_status_change_activity ON public.leads;
CREATE TRIGGER lead_status_change_activity AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_status_change();

-- RLS for audit_logs: only admins can read
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin_user());
-- Allow trigger inserts (service role / trigger context)
DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "system_insert_audit_logs" ON public.audit_logs FOR INSERT
  WITH CHECK (true);

COMMIT;
