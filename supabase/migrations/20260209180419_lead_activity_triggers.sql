CREATE OR REPLACE FUNCTION public.track_lead_changes() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Status Change
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            INSERT INTO public.lead_activities (lead_id, activity_type, description, performed_by)
            VALUES (NEW.id, 'status_changed', 'Status changed to ' || NEW.status, auth.uid());
        END IF;

        -- Notes Change
        IF NEW.notes IS DISTINCT FROM OLD.notes THEN
            INSERT INTO public.lead_activities (lead_id, activity_type, description, performed_by)
            VALUES (NEW.id, 'note_added', 'Internal notes updated', auth.uid());
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lead_updated ON public.leads;
CREATE TRIGGER on_lead_updated
    AFTER UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.track_lead_changes();
