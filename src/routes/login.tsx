import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { panitiaEmail, useAuth } from "@/lib/auth-context";
import { loginByNPSN } from "@/lib/auth-school.functions";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SHINE OF SMAMSA 2026" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { refreshRoles } = useAuth();
  const npsnLogin = useServerFn(loginByNPSN);
  const [tab, setTab] = useState<"sekolah" | "panitia">("sekolah");
  const [npsn, setNpsn] = useState("");
  const [user, setUser] = useState("");
  const [pwPan, setPwPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const submitSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{8}$/.test(npsn)) { toast.error("NPSN harus 8 digit"); return; }
    setLoading(true);
    setStatusMsg("Menghubungi server NPSN…");
    // Status progresif supaya user tahu app belum hang
    const t1 = setTimeout(() => setStatusMsg("Masih mencari data sekolah, mohon tunggu…"), 4000);
    const t2 = setTimeout(() => setStatusMsg("Server lambat — mencoba endpoint cadangan…"), 10000);
    const t3 = setTimeout(() => setStatusMsg("Mencoba ulang otomatis (cold-start server NPSN)…"), 18000);
    try {
      const r = await npsnLogin({ data: { npsn } });
      setStatusMsg("Berhasil — masuk ke dashboard…");
      const { error } = await supabase.auth.signInWithPassword({ email: r.email, password: r.tempPassword });
      if (error) throw error;
      await refreshRoles();
      toast.success(`Selamat datang, ${r.namaSekolah}!`);
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
      setStatusMsg("");
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setLoading(false);
    }
  };

  const submitPanitia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: panitiaEmail(user), password: pwPan });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await refreshRoles();
    toast.success("Berhasil masuk!");
    nav({ to: "/panitia" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              {tab === "sekolah" ? <GraduationCap className="h-6 w-6 text-primary-foreground" /> : <ShieldCheck className="h-6 w-6 text-primary-foreground" />}
            </div>
            <CardTitle className="text-2xl">Masuk ke SOF SMAMSA</CardTitle>
            <CardDescription>Pilih tipe akun untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "sekolah" | "panitia")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sekolah">Sekolah</TabsTrigger>
                <TabsTrigger value="panitia">Panitia</TabsTrigger>
              </TabsList>

              <TabsContent value="sekolah" className="m-0">
                <form onSubmit={submitSchool} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="npsn">NPSN Sekolah</Label>
                    <Input id="npsn" inputMode="numeric" maxLength={8} required value={npsn}
                      onChange={(e) => setNpsn(e.target.value.replace(/\D/g, ""))} placeholder="8 digit NPSN" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cukup masukkan NPSN. Akun sekolah akan terbuat & diverifikasi otomatis ke Data Pokok Pendidikan.
                    </p>
                  </div>
                  {loading && statusMsg && (
                    <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                      <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                      {statusMsg}
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Masuk Sekolah
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="panitia" className="m-0">
                <form onSubmit={submitPanitia} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="user">Username Panitia</Label>
                    <Input id="user" required value={user} onChange={(e) => setUser(e.target.value)} placeholder="mis. pj_futsal" />
                  </div>
                  <div>
                    <Label htmlFor="pwPan">Password</Label>
                    <Input id="pwPan" type="password" required value={pwPan} onChange={(e) => setPwPan(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Default password panitia: <code className="rounded bg-muted px-1">smamsa2026</code>.
                  </p>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Masuk Panitia
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
