import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "./dashboard.index";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/pendaftaran/")({
  head: () => ({ meta: [{ title: "Pendaftaran — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="school"><ListPage /></DashboardLayout>,
});

function ListPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("registrations").select("*").eq("school_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Kelola Pendaftaran</h1>
        <Button asChild><Link to="/dashboard/pendaftaran/baru"><Plus className="h-4 w-4" /> Tambah Pendaftaran</Link></Button>
      </div>
      <Card><CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Belum ada pendaftaran.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr>
              <th className="px-4 py-2">Cabang</th><th className="px-4 py-2">Tim/Peserta</th>
              <th className="px-4 py-2">Status</th><th className="px-4 py-2">Aksi</th>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2"><div className="font-medium">{r.lomba_name}</div><div className="text-xs text-muted-foreground">{r.kategori ?? "—"}</div></td>
                <td className="px-4 py-2">{r.nama_tim ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-2"><Link to="/dashboard/pendaftaran/$id" params={{ id: r.id }} className="text-primary underline">Kelola →</Link></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
