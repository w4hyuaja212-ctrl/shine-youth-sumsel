import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { npsnEmail, useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, Search, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Daftar Sekolah — SHINE OF SMAMSA 2026" }] }),
  component: SignupPage,
});

type Sat = {
  npsn: string;
  nama: string;
  bentukPendidikan: string;
  statusSatuanPendidikan: string;
  alamatJalan: string;
  namaDesa?: string;
  namaKecamatan?: string;
  namaKabupaten?: string;
  namaProvinsi?: string;
  nomorTelepon?: string;
  email?: string;
};

const jenjangFromBentuk = (b: string): string => {
  const v = (b || "").toUpperCase();
  if (["SD", "MI"].includes(v)) return "SD/MI";
  if (["SMP", "MTS"].includes(v)) return "SMP/MTs";
  if (["SMA", "MA", "SMK"].includes(v)) return "SMA/MA/SMK";
  return "SMP/MTs";
};

function SignupPage() {
  const nav = useNavigate();
  const { refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState(false);
  const [verified, setVerified] = useState(false);
  const [f, setF] = useState({
    npsn: "", nama_sekolah: "", nama_pic: "", no_wa: "", alamat: "", jenjang: "SMP/MTs",
    email: "", password: "", confirm: "",
  });
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const cariNPSN = async () => {
    const npsn = f.npsn.trim();
    if (!/^\d{8}$/.test(npsn)) {
      toast.error("NPSN harus 8 digit angka");
      return;
    }
    setLookup(true);
    setVerified(false);
    try {
      const res = await fetch(`https://api.fazriansyah.eu.org/v1/sekolah?npsn=${npsn}`);
      const json = await res.json();
      const sat: Sat | undefined = json?.data?.satuanPendidikan;
      if (!sat?.npsn) {
        toast.error(json?.data?.error?.message ?? "Data NPSN tidak ditemukan");
        return;
      }
      const alamat = [sat.alamatJalan, sat.namaDesa, sat.namaKecamatan, sat.namaKabupaten, sat.namaProvinsi].filter(Boolean).join(", ");
      setF((s) => ({
        ...s,
        nama_sekolah: sat.nama ?? s.nama_sekolah,
        alamat: alamat || s.alamat,
        jenjang: jenjangFromBentuk(sat.bentukPendidikan),
        email: s.email || (sat.email ?? ""),
      }));
      setVerified(true);
      toast.success(`Sekolah ditemukan: ${sat.nama}`);
    } catch (err) {
      toast.error("Gagal menghubungi server NPSN");
    } finally {
      setLookup(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) { toast.error("Verifikasi NPSN terlebih dahulu"); return; }
    if (f.password !== f.confirm) { toast.error("Konfirmasi password tidak cocok"); return; }
    if (f.password.length < 8) { toast.error("Password minimal 8 karakter"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: npsnEmail(f.npsn),
      password: f.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: {
          npsn: f.npsn, nama_sekolah: f.nama_sekolah, nama_pic: f.nama_pic,
          no_wa: f.no_wa, alamat: f.alamat, jenjang: f.jenjang,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await refreshRoles();
    toast.success("Pendaftaran sekolah berhasil!");
    nav({ to: "/dashboard" });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Registrasi Sekolah" title="Daftarkan sekolah Anda" subtitle="Login berbasis NPSN. Data sekolah diverifikasi otomatis dari Data Pokok Pendidikan." />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>NPSN * <span className="text-xs text-muted-foreground">(8 digit, akan diverifikasi ke Dapodik)</span></Label>
                <div className="flex gap-2">
                  <Input
                    required inputMode="numeric" maxLength={8} value={f.npsn}
                    onChange={(e) => { set("npsn", e.target.value.replace(/\D/g, "")); setVerified(false); }}
                    placeholder="contoh: 10609020"
                  />
                  <Button type="button" variant="secondary" onClick={cariNPSN} disabled={lookup}>
                    {lookup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-1">Cek</span>
                  </Button>
                </div>
                {verified && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3 w-3" /> NPSN terverifikasi</p>
                )}
              </div>

              <div className="sm:col-span-2"><Label>Nama Sekolah *</Label><Input required value={f.nama_sekolah} onChange={(e) => set("nama_sekolah", e.target.value)} readOnly={verified} /></div>
              <div><Label>Jenjang</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={f.jenjang} onChange={(e) => set("jenjang", e.target.value)}>
                  <option>SD/MI</option><option>SMP/MTs</option><option>SMA/MA/SMK</option>
                </select>
              </div>
              <div><Label>Email Sekolah</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div><Label>Nama PIC *</Label><Input required value={f.nama_pic} onChange={(e) => set("nama_pic", e.target.value)} /></div>
              <div><Label>No. WhatsApp PIC *</Label><Input required value={f.no_wa} onChange={(e) => set("no_wa", e.target.value)} placeholder="08xxxx" /></div>
              <div className="sm:col-span-2"><Label>Alamat</Label><Textarea rows={2} value={f.alamat} onChange={(e) => set("alamat", e.target.value)} /></div>
              <div><Label>Password *</Label><Input type="password" required value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
              <div><Label>Konfirmasi Password *</Label><Input type="password" required value={f.confirm} onChange={(e) => set("confirm", e.target.value)} /></div>
              <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
                <Link to="/login" className="text-sm text-muted-foreground underline">Sudah punya akun? Login</Link>
                <Button type="submit" disabled={loading || !verified}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Daftar Sekarang
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
