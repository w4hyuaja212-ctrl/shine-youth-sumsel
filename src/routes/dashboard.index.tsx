import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle2, Clock, XCircle, UserPlus, UserMinus } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard Sekolah — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="school"><Overview /></DashboardLayout>,
});

function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, verified: 0, rejected: 0 });
  const [profile, setProfile] = useState<{ nama_sekolah?: string | null; npsn?: string | null } | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("nama_sekolah,npsn").eq("id", user.id).maybeSingle();
      setProfile(p);
      const { data: regs } = await supabase.from("registrations").select("*").eq("school_id", user.id).order("created_at", { ascending: false });
      const list = regs ?? [];
      setRecent(list.slice(0, 5));
      setStats({
        total: list.length,
        draft: list.filter((r) => r.status === "draft").length,
        submitted: list.filter((r) => r.status === "submitted").length,
        verified: list.filter((r) => r.status === "verified").length,
        rejected: list.filter((r) => r.status === "rejected").length,
      });
      const { data: act } = await supabase
        .from("registration_member_activity")
        .select("*, registrations(lomba_name, kategori)")
        .eq("school_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);
      setActivity(act ?? []);
    })();
  }, [user]);

  const cards = [
    { label: "Total Pendaftaran", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Diajukan", value: stats.submitted, icon: Clock, color: "text-amber-600" },
    { label: "Terverifikasi", value: stats.verified, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Ditolak", value: stats.rejected, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Selamat datang, {profile?.nama_sekolah ?? "Sekolah"}</h1>
        <p className="text-sm text-muted-foreground">NPSN: {profile?.npsn ?? "-"}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}><CardContent className="p-4">
            <div className="flex items-center justify-between"><c.icon className={`h-5 w-5 ${c.color}`} /><span className="text-2xl font-bold">{c.value}</span></div>
            <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pendaftaran Terbaru</h2>
            <Link to="/dashboard/pendaftaran" className="text-sm text-primary underline">Lihat semua →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada pendaftaran. <Link to="/dashboard/pendaftaran/baru" className="text-primary underline">Pilih cabang lomba</Link> sekarang.
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div><div className="font-medium">{r.lomba_name} {r.kategori && <span className="text-xs text-muted-foreground">({r.kategori})</span>}</div>
                    <div className="text-xs text-muted-foreground">{r.nama_tim ?? "—"}</div></div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-foreground", submitted: "bg-amber-100 text-amber-800",
    verified: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-800",
  };
  const label: Record<string, string> = { draft: "Draft", submitted: "Diajukan", verified: "Terverifikasi", rejected: "Ditolak" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? "bg-muted"}`}>{label[status] ?? status}</span>;
}
