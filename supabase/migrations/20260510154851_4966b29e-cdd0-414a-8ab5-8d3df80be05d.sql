
CREATE TYPE public.app_role AS ENUM ('school','panitia_superadmin','panitia_pj','panitia_viewer');
CREATE TYPE public.registration_status AS ENUM ('draft','submitted','verified','rejected');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  npsn TEXT UNIQUE,
  nama_sekolah TEXT,
  nama_pic TEXT,
  no_wa TEXT,
  email TEXT,
  alamat TEXT,
  jenjang TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  akses_lomba TEXT,
  label TEXT,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, akses_lomba)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lomba_slug TEXT NOT NULL,
  lomba_name TEXT NOT NULL,
  kategori TEXT,
  nama_tim TEXT,
  pic_nama TEXT,
  pic_wa TEXT,
  status public.registration_status NOT NULL DEFAULT 'draft',
  catatan_panitia TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reg_school ON public.registrations(school_id);
CREATE INDEX idx_reg_lomba ON public.registrations(lomba_slug);
CREATE INDEX idx_reg_status ON public.registrations(status);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  jenis_kelamin TEXT,
  nisn TEXT,
  kelas TEXT,
  peran TEXT,
  no_wa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_member_reg ON public.registration_members(registration_id);
ALTER TABLE public.registration_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registration_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  jenis TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  size_bytes INT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_files_reg ON public.registration_files(registration_id);
ALTER TABLE public.registration_files ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registration_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  from_status public.registration_status,
  to_status public.registration_status NOT NULL,
  catatan TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_log_reg ON public.registration_status_log(registration_id);
ALTER TABLE public.registration_status_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_panitia(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('panitia_superadmin','panitia_pj','panitia_viewer'));
$$;

CREATE OR REPLACE FUNCTION public.can_access_lomba(_user_id UUID, _lomba_name TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
      AND (role = 'panitia_superadmin' OR (role IN ('panitia_pj','panitia_viewer') AND akses_lomba = _lomba_name))
  );
$$;

CREATE OR REPLACE FUNCTION public.can_modify_lomba(_user_id UUID, _lomba_name TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
      AND (role = 'panitia_superadmin' OR (role = 'panitia_pj' AND akses_lomba = _lomba_name))
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reg_updated BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, npsn, nama_sekolah, nama_pic, no_wa, email, alamat, jenjang)
  VALUES (NEW.id,
    NEW.raw_user_meta_data->>'npsn',
    NEW.raw_user_meta_data->>'nama_sekolah',
    NEW.raw_user_meta_data->>'nama_pic',
    NEW.raw_user_meta_data->>'no_wa',
    NEW.email,
    NEW.raw_user_meta_data->>'alamat',
    NEW.raw_user_meta_data->>'jenjang')
  ON CONFLICT (id) DO NOTHING;
  IF (NEW.raw_user_meta_data->>'is_panitia') IS NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'school') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.registration_status_log (registration_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, NEW.school_id);
  ELSIF (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.registration_status_log (registration_id, from_status, to_status, catatan, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.catatan_panitia, COALESCE(NEW.verified_by, auth.uid()));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_reg_status_log AFTER INSERT OR UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.log_status_change();

CREATE POLICY "p_select_self" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_panitia(auth.uid()));
CREATE POLICY "p_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "p_insert_self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "ur_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'panitia_superadmin'));
CREATE POLICY "ur_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'panitia_superadmin')) WITH CHECK (public.has_role(auth.uid(),'panitia_superadmin'));

CREATE POLICY "reg_school_all" ON public.registrations FOR ALL USING (auth.uid() = school_id) WITH CHECK (auth.uid() = school_id);
CREATE POLICY "reg_panitia_select" ON public.registrations FOR SELECT USING (public.can_access_lomba(auth.uid(), lomba_name));
CREATE POLICY "reg_panitia_update" ON public.registrations FOR UPDATE USING (public.can_modify_lomba(auth.uid(), lomba_name));

CREATE POLICY "mem_school_all" ON public.registration_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.school_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.school_id = auth.uid()));
CREATE POLICY "mem_panitia_select" ON public.registration_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND public.can_access_lomba(auth.uid(), r.lomba_name)));

CREATE POLICY "file_school_all" ON public.registration_files FOR ALL
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.school_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.school_id = auth.uid()));
CREATE POLICY "file_panitia_select" ON public.registration_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND public.can_access_lomba(auth.uid(), r.lomba_name)));

CREATE POLICY "log_school_select" ON public.registration_status_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.school_id = auth.uid()));
CREATE POLICY "log_panitia_select" ON public.registration_status_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND public.can_access_lomba(auth.uid(), r.lomba_name)));

INSERT INTO storage.buckets (id, name, public) VALUES ('berkas','berkas', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "berkas_school_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id='berkas' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "berkas_school_select" ON storage.objects FOR SELECT USING (bucket_id='berkas' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "berkas_school_delete" ON storage.objects FOR DELETE USING (bucket_id='berkas' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "berkas_panitia_select" ON storage.objects FOR SELECT USING (bucket_id='berkas' AND public.is_panitia(auth.uid()));
