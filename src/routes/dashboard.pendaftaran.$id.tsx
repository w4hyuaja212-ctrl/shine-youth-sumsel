import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LOMBA } from "@/data/lomba";
import { toast } from "sonner";
import { StatusBadge } from "./dashboard.index";
import { Trash2, Upload, Loader2, Save, Send, ImagePlus, CheckCircle2, XCircle, RefreshCw, X } from "lucide-react";

export const Route = createFileRoute("/dashboard/pendaftaran/$id")({
  head: () => ({ meta: [{ title: "Detail Pendaftaran — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="school"><DetailPage /></DashboardLayout>,
});

function DetailPage() {
  const { id } = useParams({ from: "/dashboard/pendaftaran/$id" });
  const { user } = useAuth();
  const [reg, setReg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newMember, setNewMember] = useState({ nama: "", jenis_kelamin: "L", nisn: "", kelas: "", peran: "anggota", no_wa: "" });
  const [newFoto, setNewFoto] = useState<File | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);
  const [fileJenis, setFileJenis] = useState("Surat Tugas");

  const lombaMeta = useMemo(() => LOMBA.find((x) => x.slug === reg?.lomba_slug), [reg?.lomba_slug]);
  const isIndividu = lombaMeta?.type === "individu";
  const maxMembers = lombaMeta?.maxMembers;
  const quotaReached = typeof maxMembers === "number" && members.length >= maxMembers;

  // Upload status for the new-member form
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Per-row state untuk retry & preview foto member yang sudah ada
  const [rowUpload, setRowUpload] = useState<Record<string, "uploading" | "error" | "success">>({});
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, File>>({});
  const [photoThumbs, setPhotoThumbs] = useState<Record<string, string>>({});

  // Default JK mengikuti kategori (Putra→L, Putri→P)
  useEffect(() => {
    if (reg?.kategori === "Putra") setNewMember((m) => ({ ...m, jenis_kelamin: "L" }));
    else if (reg?.kategori === "Putri") setNewMember((m) => ({ ...m, jenis_kelamin: "P" }));
  }, [reg?.kategori]);

  // Preview foto baru (object URL)
  const onSelectFoto = (f: File | null) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setNewFoto(f);
    setPhotoPreview(f ? URL.createObjectURL(f) : null);
    setUploadStatus("idle");
    setUploadError(null);
  };
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  // Generate signed URLs untuk thumbnail foto peserta yang sudah ada
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      await Promise.all(members.map(async (m) => {
        const foto = files.find((f) => f.jenis === `Foto Peserta - ${m.nama}`);
        if (!foto) return;
        const { data } = await supabase.storage.from("berkas").createSignedUrl(foto.file_path, 600);
        if (data?.signedUrl) next[m.id] = data.signedUrl;
      }));
      if (!cancelled) setPhotoThumbs(next);
    })();
    return () => { cancelled = true; };
  }, [members, files]);

  // Helper upload foto untuk satu member — status dipersist ke DB
  const uploadPhotoForMember = async (memberId: string, memberName: string, file: File) => {
    if (!user) throw new Error("Tidak login");
    setRowUpload((s) => ({ ...s, [memberId]: "uploading" }));
    await supabase.from("registration_members").update({ photo_status: "uploading", photo_error: null }).eq("id", memberId);
    try {
      const path = `${user.id}/${id}/peserta-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("berkas").upload(path, file);
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("registration_files").insert({
        registration_id: id, jenis: `Foto Peserta - ${memberName}`,
        file_path: path, file_name: file.name, size_bytes: file.size,
      });
      if (insErr) throw insErr;
      await supabase.from("registration_members").update({ photo_status: "success", photo_error: null }).eq("id", memberId);
      setRowUpload((s) => ({ ...s, [memberId]: "success" }));
      setPendingPhotos((p) => { const c = { ...p }; delete c[memberId]; return c; });
      return true;
    } catch (e) {
      const msg = (e as Error).message;
      await supabase.from("registration_members").update({ photo_status: "error", photo_error: msg }).eq("id", memberId);
      setRowUpload((s) => ({ ...s, [memberId]: "error" }));
      setPendingPhotos((p) => ({ ...p, [memberId]: file }));
      toast.error("Upload foto gagal: " + msg);
      return false;
    }
  };

  const retryUpload = async (m: any) => {
    const file = pendingPhotos[m.id];
    if (!file) { toast.error("Foto tidak tersedia setelah refresh — silakan pilih ulang foto pada peserta ini"); return; }
    const ok = await uploadPhotoForMember(m.id, m.nama, file);
    if (ok) { toast.success("Foto berhasil diunggah"); load(); }
  };

  const load = async () => {
    const { data: r } = await supabase.from("registrations").select("*").eq("id", id).single();
    setReg(r);
    const { data: m } = await supabase.from("registration_members").select("*").eq("registration_id", id).order("created_at");
    setMembers(m ?? []);
    const { data: f } = await supabase.from("registration_files").select("*").eq("registration_id", id).order("uploaded_at", { ascending: false });
    setFiles(f ?? []);
    const { data: l } = await supabase.from("registration_status_log").select("*").eq("registration_id", id).order("changed_at", { ascending: false });
    setLogs(l ?? []);
  };
  useEffect(() => { if (id) load(); }, [id]);

  const saveTim = async () => {
    if (!reg) return;
    setSaving(true);
    const { error } = await supabase.from("registrations").update({
      nama_tim: reg.nama_tim, pic_nama: reg.pic_nama, pic_wa: reg.pic_wa,
    }).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Tersimpan");
  };

  const submit = async () => {
    const { error } = await supabase.from("registrations").update({ status: "submitted" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Pendaftaran diajukan ke panitia"); load(); }
  };

  const addMember = async () => {
    if (!newMember.nama) return toast.error("Nama wajib diisi");
    if (!user) return;
    if (quotaReached) return toast.error(`Kuota maksimal ${maxMembers} ${isIndividu ? "peserta" : "anggota"} sudah terpenuhi`);
    setAddingMember(true);
    setUploadStatus("idle");
    setUploadError(null);
    try {
      const peran = isIndividu ? "peserta" : newMember.peran;
      const { data: inserted, error } = await supabase.from("registration_members")
        .insert({ ...newMember, peran, registration_id: id })
        .select().single();
      if (error) throw error;

      // Upload foto (opsional) — jika gagal, simpan ke pendingPhotos untuk retry
      if (newFoto && inserted) {
        setUploadStatus("uploading");
        const ok = await uploadPhotoForMember(inserted.id, newMember.nama, newFoto);
        if (ok) setUploadStatus("success");
        else {
          setUploadStatus("error");
          setUploadError("Upload foto gagal — gunakan tombol Coba Ulang pada baris peserta.");
        }
      }

      setNewMember({ nama: "", jenis_kelamin: reg?.kategori === "Putri" ? "P" : "L", nisn: "", kelas: "", peran: "anggota", no_wa: "" });
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setNewFoto(null);
      setPhotoPreview(null);
      if (fotoRef.current) fotoRef.current.value = "";
      toast.success("Peserta ditambahkan");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAddingMember(false);
    }
  };
  const delMember = async (mid: string) => { await supabase.from("registration_members").delete().eq("id", mid); load(); };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("berkas").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error } = await supabase.from("registration_files").insert({
      registration_id: id, jenis: fileJenis, file_path: path, file_name: file.name, size_bytes: file.size,
    });
    setUploading(false);
    if (error) toast.error(error.message); else { toast.success("Berkas diunggah"); load(); }
    e.target.value = "";
  };

  const delFile = async (f: any) => {
    await supabase.storage.from("berkas").remove([f.file_path]);
    await supabase.from("registration_files").delete().eq("id", f.id);
    load();
  };

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage.from("berkas").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!reg) return <div className="text-sm text-muted-foreground">Memuat…</div>;
  const isLocked = reg.status === "verified" || reg.status === "submitted";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/dashboard/pendaftaran" className="text-xs text-muted-foreground underline">← Kembali</Link>
          <h1 className="font-display text-2xl font-bold">{reg.lomba_name} {reg.kategori && <span className="text-base text-muted-foreground">({reg.kategori})</span>}</h1>
        </div>
        <StatusBadge status={reg.status} />
      </div>

      {reg.catatan_panitia && (
        <Card><CardContent className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Catatan Panitia</div>
          <div className="mt-1 whitespace-pre-line text-sm">{reg.catatan_panitia}</div>
        </CardContent></Card>
      )}

      <Card><CardContent className="space-y-4 p-6">
        <h2 className="font-semibold">{isIndividu ? "Data Pendamping" : "Data Tim"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {!isIndividu && (
            <div><Label>Nama Tim</Label><Input disabled={isLocked} value={reg.nama_tim ?? ""} onChange={(e) => setReg({ ...reg, nama_tim: e.target.value })} /></div>
          )}
          <div><Label>Nama Pendamping{isIndividu ? "" : " / PIC"}</Label><Input disabled={isLocked} value={reg.pic_nama ?? ""} onChange={(e) => setReg({ ...reg, pic_nama: e.target.value })} /></div>
          <div><Label>WhatsApp Pendamping (untuk notifikasi)</Label><Input disabled={isLocked} value={reg.pic_wa ?? ""} onChange={(e) => setReg({ ...reg, pic_wa: e.target.value })} placeholder="08xxxx" /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveTim} disabled={saving || isLocked}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan</Button>
          {reg.status === "draft" && <Button variant="default" onClick={submit}><Send className="h-4 w-4" /> Ajukan ke Panitia</Button>}
        </div>
      </CardContent></Card>

      <Card><CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{isIndividu ? "Peserta" : "Anggota Tim"} ({members.length}{typeof maxMembers === "number" ? ` / ${maxMembers}` : ""})</h2>
          {typeof maxMembers === "number" && (
            <span className={`text-xs ${quotaReached ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
              {quotaReached ? "Kuota penuh" : `Sisa ${maxMembers - members.length}`}
            </span>
          )}
        </div>
        {members.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr>
              <th className="px-2 py-1">Nama</th>
              <th className="px-2 py-1">JK</th>
              {!isIndividu && <th className="px-2 py-1">NISN</th>}
              {!isIndividu && <th className="px-2 py-1">Kelas</th>}
              {!isIndividu && <th className="px-2 py-1">Peran</th>}
              <th className="px-2 py-1">Foto</th>
              <th></th>
            </tr></thead>
            <tbody>{members.map((m) => {
              const foto = files.find((f) => f.jenis === `Foto Peserta - ${m.nama}`);
              // Status efektif: live state > persisted DB state
              const status = rowUpload[m.id] ?? (m.photo_status && m.photo_status !== "idle" ? m.photo_status : undefined);
              const thumb = photoThumbs[m.id];
              const hasPending = !!pendingPhotos[m.id];
              return (
                <tr key={m.id} className="border-t align-middle">
                  <td className="px-2 py-1">{m.nama}</td>
                  <td className="px-2 py-1">{m.jenis_kelamin}</td>
                  {!isIndividu && <td className="px-2 py-1">{m.nisn}</td>}
                  {!isIndividu && <td className="px-2 py-1">{m.kelas}</td>}
                  {!isIndividu && <td className="px-2 py-1">{m.peran}</td>}
                  <td className="px-2 py-1">
                    {status === "uploading" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Mengunggah…</span>
                    ) : foto ? (
                      <div className="flex items-center gap-2">
                        {thumb ? (
                          <button type="button" onClick={() => downloadFile(foto.file_path)} title="Lihat foto">
                            <img src={thumb} alt={m.nama} className="h-10 w-10 rounded object-cover border" />
                          </button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => downloadFile(foto.file_path)}>Lihat</Button>
                        )}
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ) : status === "error" ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-xs text-destructive" title={m.photo_error ?? ""}>
                          Upload gagal{m.photo_error ? `: ${m.photo_error.slice(0, 40)}` : ""}
                        </span>
                        {hasPending ? (
                          <Button size="sm" variant="outline" onClick={() => retryUpload(m)}>
                            <RefreshCw className="h-3 w-3" /> Coba Ulang
                          </Button>
                        ) : (
                          <Label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary underline">
                            <Upload className="h-3 w-3" /> Pilih ulang foto
                            <input type="file" hidden accept="image/*" onChange={async (e) => {
                              const f = e.target.files?.[0]; if (!f) return;
                              const ok = await uploadPhotoForMember(m.id, m.nama, f);
                              if (ok) load();
                              e.target.value = "";
                            }} />
                          </Label>
                        )}
                      </div>
                    ) : (
                      <Label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary underline">
                        <Upload className="h-3 w-3" /> Upload foto
                        <input type="file" hidden accept="image/*" onChange={async (e) => {
                          const f = e.target.files?.[0]; if (!f) return;
                          const ok = await uploadPhotoForMember(m.id, m.nama, f);
                          if (ok) load();
                          e.target.value = "";
                        }} />
                      </Label>
                    )}
                  </td>
                  <td className="px-2 py-1"><Button size="icon" variant="ghost" disabled={isLocked} onClick={() => delMember(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
        {!isLocked && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            {quotaReached && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Kuota maksimal {maxMembers} {isIndividu ? "peserta" : "anggota"} sudah tercapai. Hapus salah satu untuk menambah baru.
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-6">
              <Input placeholder="Nama Peserta" value={newMember.nama} disabled={quotaReached} onChange={(e) => setNewMember({ ...newMember, nama: e.target.value })} className="sm:col-span-2" />
              <select disabled={quotaReached} className="rounded-md border bg-transparent px-2 text-sm disabled:opacity-50" value={newMember.jenis_kelamin} onChange={(e) => setNewMember({ ...newMember, jenis_kelamin: e.target.value })}>
                <option value="L">Laki-laki</option><option value="P">Perempuan</option>
              </select>
              {!isIndividu && <Input placeholder="NISN" disabled={quotaReached} value={newMember.nisn} onChange={(e) => setNewMember({ ...newMember, nisn: e.target.value })} />}
              {!isIndividu && <Input placeholder="Kelas" disabled={quotaReached} value={newMember.kelas} onChange={(e) => setNewMember({ ...newMember, kelas: e.target.value })} />}
              {!isIndividu && (
                <select disabled={quotaReached} className="rounded-md border bg-transparent px-2 text-sm disabled:opacity-50" value={newMember.peran} onChange={(e) => setNewMember({ ...newMember, peran: e.target.value })}>
                  <option value="kapten">kapten</option><option value="anggota">anggota</option>
                </select>
              )}
              <Label className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-xs sm:col-span-2 ${quotaReached ? "opacity-50 pointer-events-none" : ""}`}>
                <ImagePlus className="h-4 w-4" />
                {newFoto ? newFoto.name.slice(0, 18) : "Pilih Foto Peserta"}
                <input ref={fotoRef} type="file" hidden accept="image/*" onChange={(e) => onSelectFoto(e.target.files?.[0] ?? null)} />
              </Label>
            </div>
            {photoPreview && (
              <div className="flex items-center gap-3 rounded-md border bg-background p-2">
                <img src={photoPreview} alt="preview" className="h-16 w-16 rounded object-cover border" />
                <div className="flex-1 text-xs">
                  <div className="font-medium">{newFoto?.name}</div>
                  <div className="text-muted-foreground">{newFoto ? (newFoto.size / 1024).toFixed(0) + " KB" : ""}</div>
                  {uploadStatus === "uploading" && <div className="mt-1 inline-flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Mengunggah…</div>}
                  {uploadStatus === "success" && <div className="mt-1 inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> Berhasil</div>}
                  {uploadStatus === "error" && <div className="mt-1 inline-flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" /> {uploadError ?? "Gagal"}</div>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => onSelectFoto(null)}><X className="h-4 w-4" /></Button>
              </div>
            )}
            <Button onClick={addMember} disabled={addingMember || quotaReached} className="w-full">
              {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : "+"} Tambah {isIndividu ? "Peserta" : "Anggota"}
            </Button>
            {isIndividu && !quotaReached && (
              <p className="text-xs text-muted-foreground">
                {typeof maxMembers === "number" ? `Maksimal ${maxMembers} peserta per pendaftaran.` : "Kuota peserta bebas — sesuai aturan cabang."}
              </p>
            )}
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="space-y-3 p-6">
        <h2 className="font-semibold">Berkas Persyaratan ({files.length})</h2>
        {!isLocked && (
          <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex-1 min-w-40"><Label>Jenis Berkas</Label>
              <select className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm" value={fileJenis} onChange={(e) => setFileJenis(e.target.value)}>
                <option>Surat Tugas</option><option>Kartu Pelajar</option><option>Pas Foto</option><option>Akta Kelahiran</option><option>Lainnya</option>
              </select>
            </div>
            <Label className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Pilih Berkas
              <input type="file" hidden onChange={upload} accept="image/*,application/pdf" />
            </Label>
          </div>
        )}
        <ul className="divide-y">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2 text-sm">
              <div><div className="font-medium">{f.jenis}</div><div className="text-xs text-muted-foreground">{f.file_name} • {(f.size_bytes/1024).toFixed(0)} KB</div></div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => downloadFile(f.file_path)}>Lihat</Button>
                {!isLocked && <Button size="icon" variant="ghost" onClick={() => delFile(f)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            </li>
          ))}
          {files.length === 0 && <li className="py-4 text-center text-sm text-muted-foreground">Belum ada berkas.</li>}
        </ul>
      </CardContent></Card>

      <Card><CardContent className="p-6">
        <h2 className="font-semibold">Riwayat Status</h2>
        <ul className="mt-3 space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="flex items-start gap-3 text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div><div>{l.from_status ?? "—"} → <strong>{l.to_status}</strong></div>
                <div className="text-xs text-muted-foreground">{new Date(l.changed_at).toLocaleString("id-ID")}</div>
                {l.catatan && <div className="text-xs italic">"{l.catatan}"</div>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent></Card>
    </div>
  );
}
