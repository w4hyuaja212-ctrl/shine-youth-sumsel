import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell, PageHero } from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedPanitia } from "@/lib/panitia-seed.functions";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { PANITIA_SEED, DEFAULT_PANITIA_PASSWORD } from "@/data/panitia";

export const Route = createFileRoute("/panitia/setup")({
  head: () => ({ meta: [{ title: "Setup Panitia — SOF SMAMSA" }] }),
  component: SetupPage,
});

function SetupPage() {
  const seed = useServerFn(seedPanitia);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: string[]; existing: string[] } | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const r = await seed();
      setResult({ created: r.created, existing: r.existing });
      toast.success(`Selesai. Dibuat: ${r.created.length}, sudah ada: ${r.existing.length}.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <PageShell>
      <PageHero eyebrow="One-time Setup" title="Inisialisasi Akun Panitia" subtitle="Seed semua akun PJ & viewer cabang lomba ke sistem (idempoten)." />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Akan dibuat {PANITIA_SEED.length} akun panitia</h3>
                <p className="text-sm text-muted-foreground">Default password: <code className="rounded bg-muted px-1.5 py-0.5">{DEFAULT_PANITIA_PASSWORD}</code> — wajib diganti setelah login pertama.</p>
              </div>
            </div>
            <Button onClick={run} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Jalankan Seed Panitia
            </Button>
            {result && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/20">
                  <div className="font-semibold">Baru dibuat ({result.created.length})</div>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">{result.created.map((u) => <li key={u}>{u}</li>)}</ul>
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="font-semibold">Sudah ada ({result.existing.length})</div>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">{result.existing.map((u) => <li key={u}>{u}</li>)}</ul>
                </div>
              </div>
            )}
            <div className="pt-2 text-sm">
              <Link to="/login" className="text-primary underline">→ Lanjut ke halaman login</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Daftar Akun yang Akan Di-seed</h3>
            <div className="mt-3 max-h-80 overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left"><tr><th className="px-3 py-2">Username</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Akses</th></tr></thead>
                <tbody>
                  {PANITIA_SEED.map((p) => (
                    <tr key={p.username} className="border-t">
                      <td className="px-3 py-1.5 font-mono">{p.username}</td>
                      <td className="px-3 py-1.5">{p.role.replace("panitia_", "")}</td>
                      <td className="px-3 py-1.5">{p.akses ?? "Semua cabang"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
