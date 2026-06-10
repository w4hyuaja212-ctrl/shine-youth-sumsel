
-- Add photo status persistence on members
ALTER TABLE public.registration_members
  ADD COLUMN IF NOT EXISTS photo_status text NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS photo_error text;

-- Activity log for member add/delete
CREATE TABLE IF NOT EXISTS public.registration_member_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('added','deleted')),
  member_name text NOT NULL,
  member_role text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.registration_member_activity TO authenticated;
GRANT ALL ON public.registration_member_activity TO service_role;

ALTER TABLE public.registration_member_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School can view own member activity"
  ON public.registration_member_activity FOR SELECT
  TO authenticated
  USING (school_id = auth.uid() OR public.is_panitia(auth.uid()));

CREATE POLICY "System insert via trigger"
  ON public.registration_member_activity FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_member_activity_school_created
  ON public.registration_member_activity(school_id, created_at DESC);

-- Triggers to log add/delete
CREATE OR REPLACE FUNCTION public.log_member_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sid uuid;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    SELECT school_id INTO sid FROM public.registrations WHERE id = NEW.registration_id;
    INSERT INTO public.registration_member_activity(registration_id, school_id, action, member_name, member_role, actor_id)
    VALUES (NEW.registration_id, sid, 'added', NEW.nama, NEW.peran, auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    SELECT school_id INTO sid FROM public.registrations WHERE id = OLD.registration_id;
    INSERT INTO public.registration_member_activity(registration_id, school_id, action, member_name, member_role, actor_id)
    VALUES (OLD.registration_id, sid, 'deleted', OLD.nama, OLD.peran, auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_member_activity_ins ON public.registration_members;
CREATE TRIGGER trg_log_member_activity_ins
  AFTER INSERT ON public.registration_members
  FOR EACH ROW EXECUTE FUNCTION public.log_member_activity();

DROP TRIGGER IF EXISTS trg_log_member_activity_del ON public.registration_members;
CREATE TRIGGER trg_log_member_activity_del
  AFTER DELETE ON public.registration_members
  FOR EACH ROW EXECUTE FUNCTION public.log_member_activity();
