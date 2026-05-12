import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/galeri")({
  head: () => ({
    meta: [
      { title: "Galeri Kegiatan — SHINE OF SMAMSA 2026" },
      { name: "description", content: "Galeri foto kegiatan SHINE OF SMAMSA 2026 dari SMA Muhammadiyah 1 Palembang." },
    ],
  }),
  component: GaleriPublik,
});

function GaleriPublik() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("gallery_photos").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);
  const urlOf = (p: string) => supabase.storage.from("galeri").getPublicUrl(p).data.publicUrl;

  return (
    <PageShell>
      <PageHero eyebrow="Dokumentasi" title="Galeri Kegiatan" subtitle="Momen-momen seru SHINE OF SMAMSA 2026." />
      <section className="mx-auto max-w-7xl px-4 py-12">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">Galeri masih kosong. Foto akan ditambahkan oleh panitia segera.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <figure key={it.id} className="overflow-hidden rounded-xl border bg-card">
                <img src={urlOf(it.file_path)} alt={it.caption ?? "Foto kegiatan"} className="aspect-square w-full object-cover transition-transform hover:scale-105" loading="lazy" />
                {it.caption && <figcaption className="p-3 text-sm">{it.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
