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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Pilih Cabang Lomba</h1>
        <p className="text-sm text-muted-foreground">Klik cabang yang akan diikuti. Anda dapat menambah lebih dari satu cabang.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LOMBA.map((l) => {
          const hasKategori = /Putra|Putri/i.test(l.rules.join(" "));
          return (
            <Card key={l.slug}><CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{l.icon}</div>
                <div><div className="text-xs uppercase text-muted-foreground">{l.category}</div>
                <h3 className="font-semibold">{l.name}</h3></div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{l.desc}</p>
              {hasKategori ? (
                <div className="flex gap-2">
                  <Button size="sm" disabled={loading?.startsWith(l.slug)} onClick={() => create(l.slug, l.name, "Putra")} className="flex-1">+ Putra</Button>
                  <Button size="sm" variant="outline" disabled={loading?.startsWith(l.slug)} onClick={() => create(l.slug, l.name, "Putri")} className="flex-1">+ Putri</Button>
                </div>
              ) : (
                <Button size="sm" disabled={loading === l.slug} onClick={() => create(l.slug, l.name)} className="w-full">+ Daftarkan</Button>
              )}
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}
