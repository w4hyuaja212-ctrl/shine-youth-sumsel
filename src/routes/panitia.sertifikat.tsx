import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificateForMember } from "@/lib/pdf.functions";
import { toast } from "sonner";
import { Download, Loader2, Search, FileBadge, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/panitia/sertifikat")({
  head: () => ({ meta: [{ title: "Cetak Sertifikat — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><SertifikatPage /></DashboardLayout>,
});

function downloadB64(base64: string, filename: string) {
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([buf], { type: "application/pdf" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Reg = { id: string; lomba_name: string; kategori: string | null; nama_tim: string | null };
type Member = { id: string; nama: string; peran: string | null; kelas: string | null; nisn: string | null };

function SertifikatPage() {
  const certFn = useServerFn(generateCertificateForMember);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [membersByReg, setMembersByReg] = useState<Record<string, Member[]>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("registrations").select("id,lomba_name,kategori,nama_tim").eq("status", "verified").order("lomba_name")
      .then(({ data }) => setRegs((data as Reg[]) ?? []));
  }, []);

  const toggle = async (rid: string) => {
    setOpen((p) => ({ ...p, [rid]: !p[rid] }));
    if (!membersByReg[rid]) {
      const { data } = await supabase.from("registration_members").select("id,nama,peran,kelas,nisn").eq("registration_id", rid);
      setMembersByReg((p) => ({ ...p, [rid]: (data as Member[]) ?? [] }));
    }
  };

  const print = async (registrationId: string, memberId?: string, key?: string) => {
    const k = key ?? memberId ?? registrationId;
    setBusy(k);
    try {
      const r = await certFn({ data: { registrationId, memberId } });
      downloadB64(r.base64, r.filename);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const visible = regs.filter((r) => !q || r.lomba_name.toLowerCase().includes(q.toLowerCase()) || (r.nama_tim ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <FileBadge className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Cetak Sertifikat</h1>
          <p className="text-sm text-muted-foreground">Generate sertifikat PDF (A4 landscape) <strong>per individu</strong>. Klik tim untuk melihat anggota.</p>
        </div>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari cabang/tim…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <span className="ml-auto text-xs text-muted-foreground">{visible.length} tim verified</span>
        </div>
        <div className="divide-y rounded-lg border">
          {visible.map((r) => {
            const isOpen = !!open[r.id];
            const members = membersByReg[r.id] ?? [];
            return (
              <div key={r.id}>
                <button onClick={() => toggle(r.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/40">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div className="flex-1">
                    <div className="font-medium">{r.lomba_name} {r.kategori && <span className="text-xs text-muted-foreground">({r.kategori})</span>}</div>
                    <div className="text-xs text-muted-foreground">Tim: {r.nama_tim ?? "—"}</div>
                  </div>
                </button>
                {isOpen && (
                  <div className="bg-muted/30 px-3 py-2">
                    {members.length === 0 ? (
                      <div className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-muted-foreground">Tidak ada anggota terdaftar — gunakan nama tim.</span>
                        <Button size="sm" onClick={() => print(r.id, undefined, r.id)} disabled={busy === r.id}>
                          {busy === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
                        </Button>
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {members.map((m) => (
                          <li key={m.id} className="flex items-center justify-between py-1.5 text-sm">
                            <div>
                              <div className="font-medium">{m.nama}</div>
                              <div className="text-xs text-muted-foreground">{m.peran ?? "Peserta"} • NISN {m.nisn || "-"} • {m.kelas || "-"}</div>
                            </div>
                            <Button size="sm" onClick={() => print(r.id, m.id)} disabled={busy === m.id}>
                              {busy === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && <div className="px-3 py-8 text-center text-sm text-muted-foreground">Tidak ada tim verified.</div>}
        </div>
      </CardContent></Card>
    </div>
  );
}
