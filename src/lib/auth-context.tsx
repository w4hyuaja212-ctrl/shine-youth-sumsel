import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type RoleRow = {
  role: "school" | "panitia_superadmin" | "panitia_pj" | "panitia_viewer";
  akses_lomba: string | null;
  label: string | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: RoleRow[];
  loading: boolean;
  isPanitia: boolean;
  isSuperadmin: boolean;
  isSchool: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (uid: string | undefined) => {
    if (!uid) { setRoles([]); return; }
    const { data } = await supabase.from("user_roles").select("role,akses_lomba,label").eq("user_id", uid);
    setRoles((data ?? []) as RoleRow[]);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => loadRoles(s?.user?.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRoles(data.session?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    roles,
    loading,
    isPanitia: roles.some(r => r.role.startsWith("panitia_")),
    isSuperadmin: roles.some(r => r.role === "panitia_superadmin"),
    isSchool: roles.some(r => r.role === "school"),
    signOut: async () => { await supabase.auth.signOut(); },
    refreshRoles: async () => loadRoles(session?.user?.id),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

// NPSN -> fake email mapping (sekolah pakai NPSN sebagai identitas login)
export const npsnEmail = (npsn: string) => `npsn-${npsn.trim()}@smamsa.local`;
export const panitiaEmail = (username: string) => `${username.trim()}@panitia.smamsa.local`;
