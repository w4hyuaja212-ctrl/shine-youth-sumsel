
-- Galeri foto kegiatan
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY gp_public_select ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY gp_panitia_all ON public.gallery_photos FOR ALL TO authenticated
  USING (public.is_panitia(auth.uid())) WITH CHECK (public.is_panitia(auth.uid()));

-- Bracket per cabang
CREATE TABLE public.lomba_brackets (
  lomba_slug TEXT PRIMARY KEY,
  lomba_name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.lomba_brackets ENABLE ROW LEVEL SECURITY;
CREATE POLICY lb_public_select ON public.lomba_brackets FOR SELECT USING (published OR public.is_panitia(auth.uid()));
CREATE POLICY lb_panitia_modify ON public.lomba_brackets FOR ALL TO authenticated
  USING (public.can_modify_lomba(auth.uid(), lomba_name))
  WITH CHECK (public.can_modify_lomba(auth.uid(), lomba_name));

-- Poin per cabang
CREATE TABLE public.lomba_points (
  lomba_slug TEXT PRIMARY KEY,
  lomba_name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.lomba_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY lp_public_select ON public.lomba_points FOR SELECT USING (published OR public.is_panitia(auth.uid()));
CREATE POLICY lp_panitia_modify ON public.lomba_points FOR ALL TO authenticated
  USING (public.can_modify_lomba(auth.uid(), lomba_name))
  WITH CHECK (public.can_modify_lomba(auth.uid(), lomba_name));

CREATE TRIGGER trg_lb_updated BEFORE UPDATE ON public.lomba_brackets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lp_updated BEFORE UPDATE ON public.lomba_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket galeri (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('galeri', 'galeri', true) ON CONFLICT DO NOTHING;
CREATE POLICY galeri_public_read ON storage.objects FOR SELECT USING (bucket_id = 'galeri');
CREATE POLICY galeri_panitia_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'galeri' AND public.is_panitia(auth.uid()));
CREATE POLICY galeri_panitia_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'galeri' AND public.is_panitia(auth.uid()));
CREATE POLICY galeri_panitia_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'galeri' AND public.is_panitia(auth.uid()));
