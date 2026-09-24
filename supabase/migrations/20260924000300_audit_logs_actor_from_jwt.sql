-- audit_logs.user_id is null on every row written from the admin UI.
--
-- AuditService.writeAudit resolved the actor with supabase.auth.getUser(), but the
-- browser client is deliberately session-less (cookie auth via the /api/supabase
-- proxy), so it always sent user_id: null. The database, however, does see the
-- caller: the proxy forwards the access_token as the Authorization header, which is
-- why the live insert policy (auth.uid() IS NOT NULL) passes.
--
-- The migration 20260529180200 declared `user_id uuid DEFAULT auth.uid()`, but that
-- was a CREATE TABLE IF NOT EXISTS against a table that already existed, so the live
-- column has no default.
--
-- Stamp the actor server-side instead of trusting the client: for any request that
-- carries a user JWT, user_id is forced to auth.uid(), so a client can neither forget
-- nor forge it. Service-role inserts (invite-user, manage-user edge functions) have no
-- auth.uid() and keep the user_id they set explicitly from their verified caller.

BEGIN;

CREATE OR REPLACE FUNCTION public.audit_logs_set_actor() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.user_id := coalesce(auth.uid(), NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_set_actor ON public.audit_logs;
CREATE TRIGGER audit_logs_set_actor
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_logs_set_actor();

COMMIT;
