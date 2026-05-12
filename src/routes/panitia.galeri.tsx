import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Trash2, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/panitia/galeri")({
  head: () => ({ meta: [{ title: "Galeri — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><GaleriAdmin /></DashboardLayout>,
});

function GaleriAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gallery_photos").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!files || files.length === 0) return toast.error("Pilih foto dahulu");
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
        const { error: upErr } = await supabase.storage.from("galeri").upload(path, f, { upsert: false });
        if (upErr) throw upErr;
        await supabase.from("gallery_photos").insert({ file_path: path, caption: caption || null, uploaded_by: user!.id });
      }
      toast.success(`${files.length} foto diunggah`);
      setFiles(null); setCaption(""); load();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string, path: string) => {
    if (!confirm("Hapus foto ini?")) return;
    await supabase.storage.from("galeri").remove([path]);
    await supabase.from("gallery_photos").delete().eq("id", id);
    load();
  };

  const urlOf = (p: string) => supabase.storage.from("galeri").getPublicUrl(p).data.publicUrl;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Galeri Kegiatan</h1>
        <p className="text-sm text-muted-foreground">Upload foto kegiatan SOF SMAMSA. Foto ini tampil publik di halaman /galeri.</p>
      </div>

      <Card><CardContent className="space-y-3 p-6">
        <h2 className="font-semibold">Upload Foto</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div><Label>File (bisa multiple)</Label><Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} /></div>
          <div><Label>Caption (opsional)</Label><Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Pembukaan SOF SMAMSA 2026" /></div>
          <Button onClick={upload} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Unggah</Button>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.id} className="group relative overflow-hidden rounded-xl border bg-card">
            <img src={urlOf(it.file_path)} alt={it.caption ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
            {it.caption && <div className="p-2 text-xs">{it.caption}</div>}
            <button onClick={() => remove(it.id, it.file_path)} className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Belum ada foto.</div>}
      </div>
    </div>
  );
}
