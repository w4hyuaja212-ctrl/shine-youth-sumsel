import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { verifyRegistration } from "@/lib/whatsapp.functions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Search, ExternalLink, Loader2 } from "lucide-react";
import { StatusBadge } from "./dashboard.index";

export const Route = createFileRoute("/panitia/")({
  head: () => ({ meta: [{ title: "Dashboard Panitia — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="panitia"><PanitiaPage /></DashboardLayout>,
});

function PanitiaPage() {
  const { roles, isSuperadmin } = useAuth();
  const verifyFn = useServerFn(verifyRegistration);
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "submitted" | "verified" | "rejected">("submitted");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [open, setOpen] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [catatan, setCatatan] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    let q = supabase.from("registrations").select("*").order("updated_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, [filter]);

  const openDetail = async (id: string) => {
    setOpenId(id);
    const { data: r } = await supabase.from("registrations").select("*").eq("id", id).single();
    setOpen(r); setCatatan(r?.catatan_panitia ?? "");
    const { data: m } = await supabase.from("registration_members").select("*").eq("registration_id", id);
    setMembers(m ?? []);
    const { data: f } = await supabase.from("registration_files").select("*").eq("registration_id", id);
    setFiles(f ?? []);
    if (r?.school_id) {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", r.school_id).single();
      setProfile(p);
    }
  };

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage.from("berkas").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const verify = async (newStatus: "verified" | "rejected") => {
    if (!open) return;
    setBusy(true);
    try {
      const r = await verifyFn({ data: { registrationId: open.id, newStatus, catatan } });
      toast.success(`Status diperbarui. WA terkirim ke ${r.sent_to ?? "(nomor tidak tersedia)"}.`);
      setOpenId(null); setOpen(null); load();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const visible = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.lomba_name.toLowerCase().includes(s) || (r.nama_tim ?? "").toLowerCase().includes(s);
  });

  const aksesList = roles.filter(r => r.akses_lomba).map(r => r.akses_lomba);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Verifikasi Pendaftaran</h1>
        <p className="text-sm text-muted-foreground">
          {isSuperadmin ? "Anda dapat melihat semua cabang." : aksesList.length > 0 ? `Akses cabang: ${aksesList.join(", ")}` : "Tidak ada akses cabang."}
        </p>
      </div>

      <Card><CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["submitted","verified","rejected","all"] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
              {s === "all" ? "Semua" : s === "submitted" ? "Diajukan" : s === "verified" ? "Terverifikasi" : "Ditolak"}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari cabang/tim…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr>
            <th className="px-3 py-2">Cabang</th><th className="px-3 py-2">Tim</th>
            <th className="px-3 py-2">Status</th><th className="px-3 py-2">Diperbarui</th><th></th>
          </tr></thead>
          <tbody>{visible.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2"><div className="font-medium">{r.lomba_name}</div><div className="text-xs text-muted-foreground">{r.kategori ?? "—"}</div></td>
              <td className="px-3 py-2">{r.nama_tim ?? "—"}</td>
              <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleString("id-ID")}</td>
              <td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => openDetail(r.id)}>Detail</Button></td>
            </tr>
          ))}{visible.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Tidak ada data.</td></tr>}</tbody>
        </table>
      </CardContent></Card>

      {openId && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpenId(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{open.lomba_name} {open.kategori && <span className="text-base text-muted-foreground">({open.kategori})</span>}</h3>
                <div className="text-sm text-muted-foreground">{profile?.nama_sekolah} • NPSN {profile?.npsn}</div>
              </div>
              <StatusBadge status={open.status} />
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div><strong>Tim:</strong> {open.nama_tim ?? "—"}</div>
                <div><strong>PIC:</strong> {open.pic_nama ?? profile?.nama_pic ?? "—"}</div>
                <div><strong>WA PIC:</strong> {open.pic_wa ?? profile?.no_wa ?? "—"}</div>
                <div><strong>Email:</strong> {profile?.email ?? "—"}</div>
              </div>

              <div>
                <div className="font-semibold">Anggota ({members.length})</div>
                <ul className="mt-1 list-disc pl-5 text-sm">{members.map((m) => <li key={m.id}>{m.nama} — {m.peran} ({m.jenis_kelamin}, NISN {m.nisn || "-"}, {m.kelas || "-"})</li>)}</ul>
              </div>

              <div>
                <div className="font-semibold">Berkas ({files.length})</div>
                <ul className="mt-1 space-y-1 text-sm">{files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between">
                    <span>{f.jenis} — {f.file_name}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(f.file_path)}><ExternalLink className="h-3 w-3" /> Buka</Button>
                  </li>
                ))}</ul>
              </div>

              <div>
                <div className="text-sm font-semibold">Catatan untuk peserta (akan dikirim via WA)</div>
                <Textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="mis. Berkas kartu pelajar tidak terbaca, mohon upload ulang." />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => verify("verified")} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Terima & Kirim WA</Button>
                <Button onClick={() => verify("rejected")} disabled={busy} variant="destructive">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Tolak & Kirim WA</Button>
                <Button variant="outline" onClick={() => setOpenId(null)}>Tutup</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
