import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { setNpsnEndpoints } from "@/lib/settings.functions";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/panitia/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — Panitia Pusat" }] }),
  component: () => <DashboardLayout mode="panitia"><PengaturanPage /></DashboardLayout>,
});

function PengaturanPage() {
  const { isSuperadmin, loading } = useAuth();
  const nav = useNavigate();
  const saveFn = useServerFn(setNpsnEndpoints);
  const [endpoints, setEndpoints] = useState<string[]>([""]);
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isSuperadmin) nav({ to: "/panitia" });
  }, [loading, isSuperadmin, nav]);

  useEffect(() => {
    supabase.from("app_settings").select("value").eq("key", "npsn_api_endpoints").maybeSingle().then(({ data }) => {
      const v = data?.value as unknown;
      if (Array.isArray(v) && v.length) setEndpoints(v as string[]);
      setLoadingData(false);
    });
  }, []);

  const update = (i: number, v: string) => setEndpoints((p) => p.map((x, k) => (k === i ? v : x)));
  const add = () => setEndpoints((p) => [...p, ""]);
  const remove = (i: number) => setEndpoints((p) => p.filter((_, k) => k !== i));

  const save = async () => {
    const cleaned = endpoints.map((s) => s.trim()).filter(Boolean);
    if (!cleaned.length) { toast.error("Minimal 1 endpoint."); return; }
    setBusy(true);
    try {
      const r = await saveFn({ data: { endpoints: cleaned } });
      setEndpoints(r.endpoints);
      toast.success("Pengaturan tersimpan.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (!isSuperadmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Pengaturan Panitia Pusat</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar endpoint API NPSN. Sistem akan mencoba endpoint berurutan jika salah satu down.</p>
        </div>
      </div>

      <Card><CardContent className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Endpoint API NPSN</h2>
          <p className="text-xs text-muted-foreground">Contoh: <code>https://api.fazriansyah.eu.org/v1</code> (tanpa <code>/sekolah</code>). Sistem otomatis menambahkan path <code>/sekolah?npsn=…</code>.</p>
        </div>

        {loadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="space-y-2">
            {endpoints.map((e, i) => (
              <div key={i} className="flex gap-2">
                <Input value={e} onChange={(ev) => update(i, ev.target.value)} placeholder="https://api.example.com/v1" />
                <Button variant="outline" size="icon" onClick={() => remove(i)} disabled={endpoints.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Tambah Endpoint</Button>
              <Button onClick={save} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan
              </Button>
            </div>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
