import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profil")({
  head: () => ({ meta: [{ title: "Profil — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="school"><ProfilPage /></DashboardLayout>,
});

function ProfilPage() {
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setP(data));
  }, [user]);

  const save = async () => {
    const { error } = await supabase.from("profiles").update({
      nama_sekolah: p.nama_sekolah, nama_pic: p.nama_pic, no_wa: p.no_wa, alamat: p.alamat, jenjang: p.jenjang, email: p.email,
    }).eq("id", user!.id);
    if (error) toast.error(error.message); else toast.success("Profil tersimpan");
  };

  if (!p) return <div className="text-sm text-muted-foreground">Memuat…</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Profil Sekolah & Akun</h1>
      <p className="text-sm text-muted-foreground">Login berbasis NPSN — tidak ada password yang perlu dikelola. Pastikan PIC & WhatsApp benar agar status pendaftaran sampai ke nomor yang tepat.</p>

      <Card><CardContent className="space-y-3 p-6">
        <h2 className="font-semibold">Informasi Sekolah</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>NPSN</Label><Input disabled value={p.npsn ?? ""} /></div>
          <div><Label>Jenjang</Label>
            <select className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm" value={p.jenjang ?? ""} onChange={(e) => setP({ ...p, jenjang: e.target.value })}>
              <option>SD/MI</option><option>SMP/MTs</option><option>SMA/MA/SMK</option>
            </select></div>
          <div className="sm:col-span-2"><Label>Nama Sekolah</Label><Input value={p.nama_sekolah ?? ""} onChange={(e) => setP({ ...p, nama_sekolah: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={p.email ?? ""} onChange={(e) => setP({ ...p, email: e.target.value })} /></div>
          <div><Label>Nama PIC</Label><Input value={p.nama_pic ?? ""} onChange={(e) => setP({ ...p, nama_pic: e.target.value })} /></div>
          <div><Label>WhatsApp PIC</Label><Input value={p.no_wa ?? ""} onChange={(e) => setP({ ...p, no_wa: e.target.value })} placeholder="08xxxx" /></div>
          <div className="sm:col-span-2"><Label>Alamat</Label><Textarea rows={2} value={p.alamat ?? ""} onChange={(e) => setP({ ...p, alamat: e.target.value })} /></div>
        </div>
        <Button onClick={save}>Simpan Profil</Button>
      </CardContent></Card>
    </div>
  );
}
