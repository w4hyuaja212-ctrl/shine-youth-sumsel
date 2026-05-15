import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LOMBA } from "@/data/lomba";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/pendaftaran/baru")({
  head: () => ({ meta: [{ title: "Pilih Cabang Lomba — SOF SMAMSA" }] }),
  component: () => <DashboardLayout mode="school"><PickPage /></DashboardLayout>,
});

function PickPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const create = async (slug: string, name: string, kategori?: string) => {
    if (!user) return;
    setLoading(slug + (kategori ?? ""));
    const { data, error } = await supabase.from("registrations").insert({
      school_id: user.id, lomba_slug: slug, lomba_name: name, kategori: kategori ?? null, status: "draft",
    }).select().single();
    setLoading(null);
    if (error || !data) { toast.error(error?.message ?? "Gagal membuat pendaftaran"); return; }
    toast.success("Pendaftaran dibuat. Lengkapi data peserta & berkas.");
    nav({ to: "/dashboard/pendaftaran/$id", params: { id: data.id } });
  };

  // Buat 2 pendaftaran sekaligus (Putra & Putri) dengan satu klik.
  const createBoth = async (slug: string, name: string) => {
    if (!user) return;
    setLoading(slug + "BOTH");
    const rows = [
      { school_id: user.id, lomba_slug: slug, lomba_name: name, kategori: "Putra", status: "draft" as const },
      { school_id: user.id, lomba_slug: slug, lomba_name: name, kategori: "Putri", status: "draft" as const },
    ];
    const { data, error } = await supabase.from("registrations").insert(rows).select();
    setLoading(null);
    if (error || !data?.length) { toast.error(error?.message ?? "Gagal membuat pendaftaran"); return; }
    toast.success("2 pendaftaran (Putra & Putri) dibuat. Lengkapi masing-masing.");
    nav({ to: "/dashboard/pendaftaran" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Pilih Cabang Lomba</h1>
        <p className="text-sm text-muted-foreground">Klik cabang yang akan diikuti. Anda dapat menambah lebih dari satu cabang.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LOMBA.map((l) => {
          const busy = loading?.startsWith(l.slug);
          return (
            <Card key={l.slug}><CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{l.icon}</div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{l.category} • {l.type === "tim" ? "Tim" : "Individu"}</div>
                  <h3 className="font-semibold">{l.name}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{l.desc}</p>
              {l.genderSplit ? (
                <div className="space-y-2">
                  <Button size="sm" disabled={busy} onClick={() => createBoth(l.slug, l.name)} className="w-full">
                    + Daftarkan Putra & Putri (1 klik)
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => create(l.slug, l.name, "Putra")} className="flex-1">Putra saja</Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => create(l.slug, l.name, "Putri")} className="flex-1">Putri saja</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" disabled={busy} onClick={() => create(l.slug, l.name)} className="w-full">+ Daftarkan</Button>
              )}
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}
