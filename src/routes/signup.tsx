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
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Daftar Sekolah — SHINE OF SMAMSA 2026" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const { refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    npsn: "", nama_sekolah: "", nama_pic: "", no_wa: "", alamat: "", jenjang: "SMP/MTs",
    email: "", password: "", confirm: "",
  });
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    // auto-login terjadi karena auto-confirm aktif
    await refreshRoles();
    toast.success("Pendaftaran sekolah berhasil!");
    nav({ to: "/dashboard" });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Registrasi Sekolah" title="Daftarkan sekolah Anda" subtitle="Login berbasis NPSN. Setelah terdaftar, Anda dapat memilih cabang lomba & mengelola tim." />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>NPSN *</Label><Input required inputMode="numeric" maxLength={10} value={f.npsn} onChange={(e) => set("npsn", e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Nama Sekolah *</Label><Input required value={f.nama_sekolah} onChange={(e) => set("nama_sekolah", e.target.value)} /></div>
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
                <Button type="submit" disabled={loading}>
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
