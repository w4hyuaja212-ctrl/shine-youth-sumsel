import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LayoutDashboard, FileText, User, LogOut, ListPlus, ShieldCheck, Loader2, BarChart3, Search, Image as ImageIcon, Trophy, FileBadge, IdCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; superadminOnly?: boolean };

const SCHOOL_NAV: Item[] = [
  { to: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/dashboard/pendaftaran", label: "Pendaftaran", icon: FileText },
  { to: "/dashboard/pendaftaran/baru", label: "Pilih Cabang Lomba", icon: ListPlus },
  { to: "/dashboard/profil", label: "Profil & Akun", icon: User },
];

const PANITIA_NAV: Item[] = [
  { to: "/panitia", label: "Verifikasi Pendaftaran", icon: ShieldCheck },
  { to: "/panitia/statistik", label: "Statistik", icon: BarChart3 },
  { to: "/panitia/bracket", label: "Bracket & Poin", icon: Trophy },
  { to: "/panitia/sertifikat", label: "Cetak Sertifikat", icon: FileBadge },
  { to: "/panitia/idcard", label: "Cetak ID Card", icon: IdCard },
  { to: "/panitia/galeri", label: "Galeri Kegiatan", icon: ImageIcon },
  { to: "/panitia/npsn-tools", label: "NPSN Tools", icon: Search },
  { to: "/panitia/pengaturan", label: "Pengaturan", icon: Settings, superadminOnly: true },
];

export function DashboardLayout({ mode, children }: { mode: "school" | "panitia"; children: ReactNode }) {
  const { loading, user, isPanitia, isSchool, isSuperadmin, signOut, roles } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const items = (mode === "school" ? SCHOOL_NAV : PANITIA_NAV).filter((it) => !it.superadminOnly || isSuperadmin);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/login" }); return; }
    if (mode === "school" && !isSchool && isPanitia) nav({ to: "/panitia" });
    if (mode === "panitia" && !isPanitia) nav({ to: "/dashboard" });
  }, [loading, user, isSchool, isPanitia, mode, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roleLabel = roles[0]?.label ?? (mode === "school" ? "Sekolah" : "Panitia");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 pt-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-1 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 rounded-xl border bg-card p-3 text-sm">
              <div className="text-xs uppercase text-muted-foreground">{mode === "school" ? "Login Sekolah" : "Panitia"}</div>
              <div className="truncate font-semibold">{roleLabel}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            </div>
            {items.map((it) => {
              const active = loc.pathname === it.to || (it.to !== "/dashboard" && loc.pathname.startsWith(it.to));
              return (
                <Link key={it.to} to={it.to} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-accent"}`}>
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
            <Button variant="ghost" className="mt-2 w-full justify-start text-destructive hover:text-destructive" onClick={async () => { await signOut(); nav({ to: "/" }); }}>
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
