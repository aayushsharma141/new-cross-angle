CREATE TABLE IF NOT EXISTS public.estimator_flow_config (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.estimator_flow_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read estimator config"
  ON public.estimator_flow_config FOR SELECT USING (true);

CREATE POLICY "Admins can write estimator config"
  ON public.estimator_flow_config FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin')));

CREATE OR REPLACE FUNCTION public.touch_estimator_flow_config()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); NEW.updated_by = auth.uid(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER estimator_flow_config_touch
  BEFORE UPDATE ON public.estimator_flow_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_estimator_flow_config();
