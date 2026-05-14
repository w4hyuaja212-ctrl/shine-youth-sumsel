CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "as_public_select" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "as_superadmin_all" ON public.app_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'panitia_superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'panitia_superadmin'::app_role));

CREATE TRIGGER trg_app_settings_updated
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (key, value) VALUES
  ('npsn_api_endpoints', '["https://api.fazriansyah.eu.org/v1"]'::jsonb)
ON CONFLICT (key) DO NOTHING;