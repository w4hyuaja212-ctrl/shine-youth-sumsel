import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificates, generateIdCards } from "@/lib/pdf.functions";
import { toast } from "sonner";
import { Download, Loader2, Search, FileBadge, IdCard } from "lucide-react";

export const Route = createFileRoute("/panitia/sertifikat")({
  head: () => ({ meta: [{ title: "Cetak Sertifikat — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><PrintPage kind="cert" /></DashboardLayout>,
});

function downloadB64(base64: string, filename: string) {
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([buf], { type: "application/pdf" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PrintPage({ kind }: { kind: "cert" | "id" }) {
  const certFn = useServerFn(generateCertificates);
  const idFn = useServerFn(generateIdCards);
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("registrations").select("id,lomba_name,kategori,nama_tim").eq("status", "verified").order("lomba_name")
      .then(({ data }) => setRows(data ?? []));
  }, []);

  const visible = rows.filter(r => !q || r.lomba_name.toLowerCase().includes(q.toLowerCase()) || (r.nama_tim ?? "").toLowerCase().includes(q.toLowerCase()));

  const print = async (id: string) => {
    setBusy(id);
    try {
      const r = kind === "cert" ? await certFn({ data: { registrationId: id } }) : await idFn({ data: { registrationId: id } });
      downloadB64(r.base64, r.filename);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const Icon = kind === "cert" ? FileBadge : IdCard;
  const title = kind === "cert" ? "Cetak Sertifikat" : "Cetak ID Card";
  const desc = kind === "cert" ? "Generate sertifikat PDF (A4 landscape) per anggota tim verified." : "Generate ID Card PDF dengan QR code (A4 portrait, 4 kartu/halaman).";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{desc} Hanya tim berstatus <strong>terverifikasi</strong>.</p>
        </div>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari cabang/tim…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
          <span className="ml-auto text-xs text-muted-foreground">{visible.length} tim verified</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase">
            <tr><th className="px-3 py-2">Cabang</th><th className="px-3">Tim/Peserta</th><th className="px-3 w-32"></th></tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2"><div className="font-medium">{r.lomba_name}</div><div className="text-xs text-muted-foreground">{r.kategori ?? "—"}</div></td>
                <td className="px-3">{r.nama_tim ?? "—"}</td>
                <td className="px-3"><Button size="sm" onClick={() => print(r.id)} disabled={busy === r.id}>
                  {busy === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
                </Button></td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">Tidak ada tim verified.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
