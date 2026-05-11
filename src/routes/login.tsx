import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { npsnEmail, panitiaEmail, useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SHINE OF SMAMSA 2026" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { refreshRoles } = useAuth();
  const [tab, setTab] = useState<"sekolah" | "panitia">("sekolah");
  const [npsn, setNpsn] = useState("");
  const [pwSch, setPwSch] = useState("");
  const [user, setUser] = useState("");
  const [pwPan, setPwPan] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = tab === "sekolah" ? npsnEmail(npsn) : panitiaEmail(user);
    const password = tab === "sekolah" ? pwSch : pwPan;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await refreshRoles();
    toast.success("Berhasil masuk!");
    nav({ to: tab === "sekolah" ? "/dashboard" : "/panitia" });
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

              <form onSubmit={submit} className="mt-6 space-y-4">
                <TabsContent value="sekolah" className="m-0 space-y-4">
                  <div>
                    <Label htmlFor="npsn">NPSN Sekolah</Label>
                    <Input id="npsn" inputMode="numeric" maxLength={8} required value={npsn} onChange={(e) => setNpsn(e.target.value.replace(/\D/g, ""))} placeholder="8 digit NPSN" />
                  </div>
                  <div>
                    <Label htmlFor="pwSch">Password</Label>
                    <Input id="pwSch" type="password" required value={pwSch} onChange={(e) => setPwSch(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Belum punya akun? <Link to="/signup" className="font-semibold text-primary underline">Daftarkan sekolah</Link>
                  </p>
                </TabsContent>

                <TabsContent value="panitia" className="m-0 space-y-4">
                  <div>
                    <Label htmlFor="user">Username Panitia</Label>
                    <Input id="user" required value={user} onChange={(e) => setUser(e.target.value)} placeholder="mis. pj_futsal" />
                  </div>
                  <div>
                    <Label htmlFor="pwPan">Password</Label>
                    <Input id="pwPan" type="password" required value={pwPan} onChange={(e) => setPwPan(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Akun panitia di-seed otomatis. Default password: <code className="rounded bg-muted px-1">smamsa2026</code>.
                    Jika belum bisa login, <Link to="/panitia/setup" className="font-semibold text-primary underline">jalankan setup awal</Link>.
                  </p>
                </TabsContent>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Masuk
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
