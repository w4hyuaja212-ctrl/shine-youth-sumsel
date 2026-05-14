import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Copy, ExternalLink, Loader2, Settings } from "lucide-react";

export const Route = createFileRoute("/panitia/npsn-tools")({
  head: () => ({ meta: [{ title: "NPSN Tools — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><NpsnTools /></DashboardLayout>,
});

const DEFAULT_BASE = "https://api.fazriansyah.eu.org/v1";

const ENDPOINTS = [
  { label: "Detail Sekolah by NPSN", path: "/sekolah?npsn={NPSN}", placeholder: "10609020", needs: "npsn" },
  { label: "Cari Sekolah by Nama", path: "/sekolah?nama={NAMA}", placeholder: "SMA Muhammadiyah", needs: "text" },
  { label: "Daftar Provinsi", path: "/wilayah/provinsi", placeholder: "", needs: "none" },
  { label: "Kabupaten by Provinsi", path: "/wilayah/provinsi/{KODE}", placeholder: "110000", needs: "text" },
  { label: "Kecamatan by Kabupaten", path: "/wilayah/kabupaten/{KODE}", placeholder: "110100", needs: "text" },
  { label: "Sekolah per Wilayah", path: "/sekolah/wilayah?wilayah={KODE}", placeholder: "110100", needs: "text" },
] as const;

function NpsnTools() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>(null);

  const lookup = async () => {
    if (!/^\d{8}$/.test(q)) { toast.error("Masukkan NPSN 8 digit"); return; }
    setBusy(true); setData(null);
    try {
      const r = await fetch(`${BASE}/sekolah?npsn=${q}`);
      const j = await r.json();
      setData(j);
      if (!j?.data?.satuanPendidikan?.npsn) toast.error("Tidak ditemukan");
      else toast.success(j.data.satuanPendidikan.nama);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const buildUrl = (path: string, val: string) =>
    `${BASE}${path.replace(/\{[^}]+\}/g, encodeURIComponent(val || ""))}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">NPSN Tools</h1>
        <p className="text-sm text-muted-foreground">Pencarian & tautan langsung ke API Data Pokok Pendidikan publik.</p>
      </div>

      <Card><CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input inputMode="numeric" maxLength={8} value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, ""))} placeholder="NPSN 8 digit" />
          <Button onClick={lookup} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Cari
          </Button>
        </div>
        {data?.data?.satuanPendidikan && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="font-bold">{data.data.satuanPendidikan.nama}</div>
            <div className="text-muted-foreground">NPSN {data.data.satuanPendidikan.npsn} • {data.data.satuanPendidikan.bentukPendidikan} • {data.data.satuanPendidikan.statusSatuanPendidikan}</div>
            <div className="mt-1">{[data.data.satuanPendidikan.alamatJalan, data.data.satuanPendidikan.namaDesa, data.data.satuanPendidikan.namaKecamatan, data.data.satuanPendidikan.namaKabupaten, data.data.satuanPendidikan.namaProvinsi].filter(Boolean).join(", ")}</div>
            <pre className="mt-3 max-h-64 overflow-auto rounded bg-background/60 p-3 text-xs">{JSON.stringify(data.data.satuanPendidikan, null, 2)}</pre>
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-6 space-y-3">
        <h2 className="font-semibold">Endpoint API</h2>
        <p className="text-xs text-muted-foreground">Klik "Buka" untuk membuka di tab baru, atau "Salin" untuk menyalin URL.</p>
        <div className="space-y-2">
          {ENDPOINTS.map((e) => (
            <EndpointRow key={e.label} {...e} buildUrl={buildUrl} />
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

function EndpointRow({ label, path, placeholder, needs, buildUrl }: any) {
  const [v, setV] = useState("");
  const url = buildUrl(path, v);
  return (
    <div className="grid items-center gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_220px_auto_auto]">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground break-all">{url}</div>
      </div>
      {needs !== "none" ? (
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />
      ) : <div />}
      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("URL disalin"); }}>
        <Copy className="h-3 w-3" /> Salin
      </Button>
      <Button size="sm" onClick={() => window.open(url, "_blank")}>
        <ExternalLink className="h-3 w-3" /> Buka
      </Button>
    </div>
  );
}
