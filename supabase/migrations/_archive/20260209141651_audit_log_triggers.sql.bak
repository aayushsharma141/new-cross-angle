-- Function to automatically log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event() RETURNS TRIGGER AS $$
DECLARE
    detail      jsonb;
    action_type text;
    record_id   uuid;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        detail = row_to_json(OLD);
        action_type = 'delete';
        record_id = OLD.id;
    ELSIF (TG_OP = 'UPDATE') THEN
        detail = jsonb_build_object(
            'changes', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(to_jsonb(NEW))
                WHERE to_jsonb(OLD)->key IS DISTINCT FROM value
            )
        );
        action_type = 'update';
        record_id = NEW.id;
    ELSIF (TG_OP = 'INSERT') THEN
        detail = row_to_json(NEW);
        action_type = 'create';
        record_id = NEW.id;
    END IF;

    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        auth.uid(),
        action_type,
        TG_TABLE_NAME::text,
        record_id,
        detail
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to critical tables
DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_blogs ON public.blogs;
CREATE TRIGGER audit_blogs
    AFTER INSERT OR UPDATE OR DELETE ON public.blogs
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_portfolio ON public.portfolio;
CREATE TRIGGER audit_portfolio
    AFTER INSERT OR UPDATE OR DELETE ON public.portfolio
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_site_content ON public.site_content;
CREATE TRIGGER audit_site_content
    AFTER INSERT OR UPDATE OR DELETE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
