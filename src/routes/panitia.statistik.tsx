import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LOMBA } from "@/data/lomba";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, FileText, CheckCircle2, XCircle, Clock, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/panitia/statistik")({
  head: () => ({ meta: [{ title: "Statistik — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><Statistik /></DashboardLayout>,
});

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8", submitted: "#f59e0b", verified: "#10b981", rejected: "#ef4444",
};

function Statistik() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: regs }] = await Promise.all([
        supabase.from("profiles").select("id,jenjang"),
        supabase.from("registrations").select("lomba_name,lomba_slug,status"),
      ]);
      const totalSekolah = profiles?.length ?? 0;
      const totalReg = regs?.length ?? 0;
      const byStatus: Record<string, number> = { draft: 0, submitted: 0, verified: 0, rejected: 0 };
      const byLomba: Record<string, number> = {};
      const byJenjang: Record<string, number> = {};
      regs?.forEach((r) => {
        byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
        byLomba[r.lomba_name] = (byLomba[r.lomba_name] ?? 0) + 1;
      });
      profiles?.forEach((p) => { if (p.jenjang) byJenjang[p.jenjang] = (byJenjang[p.jenjang] ?? 0) + 1; });
      setStats({
        totalSekolah, totalReg, byStatus, byJenjang,
        byLomba: LOMBA.map((l) => ({ name: l.name, value: byLomba[l.name] ?? 0 })),
        statusPie: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      });
    })();
  }, []);

  if (!stats) return <div className="text-sm text-muted-foreground">Memuat statistik…</div>;

  const cards = [
    { icon: GraduationCap, label: "Sekolah Terdaftar", value: stats.totalSekolah, color: "text-primary" },
    { icon: FileText, label: "Total Pendaftaran", value: stats.totalReg, color: "text-blue-500" },
    { icon: Clock, label: "Menunggu Verifikasi", value: stats.byStatus.submitted, color: "text-amber-500" },
    { icon: CheckCircle2, label: "Terverifikasi", value: stats.byStatus.verified, color: "text-emerald-500" },
    { icon: XCircle, label: "Ditolak", value: stats.byStatus.rejected, color: "text-red-500" },
    { icon: Users, label: "Draft", value: stats.byStatus.draft, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Statistik Real-time</h1>
        <p className="text-sm text-muted-foreground">Ringkasan langsung dari basis data.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}><CardContent className="flex items-center gap-3 p-5">
            <div className={`rounded-xl bg-muted p-3 ${c.color}`}><c.icon className="h-6 w-6" /></div>
            <div><div className="text-2xl font-bold">{c.value}</div><div className="text-xs text-muted-foreground">{c.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h2 className="mb-3 font-semibold">Pendaftaran per Cabang Lomba</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byLomba} margin={{ left: 0, right: 8, top: 8, bottom: 60 }}>
                <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} interval={0} height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h2 className="mb-3 font-semibold">Distribusi Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label>
                  {stats.statusPie.map((d: any) => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-5">
        <h2 className="mb-3 font-semibold">Sekolah per Jenjang</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(stats.byJenjang).map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs uppercase text-muted-foreground">{k}</div>
              <div className="text-2xl font-bold">{String(v)}</div>
            </div>
          ))}
          {Object.keys(stats.byJenjang).length === 0 && <div className="text-sm text-muted-foreground">Belum ada data jenjang.</div>}
        </div>
      </CardContent></Card>
    </div>
  );
}
