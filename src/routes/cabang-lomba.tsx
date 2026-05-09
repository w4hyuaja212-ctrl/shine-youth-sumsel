import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { LombaCard } from "@/components/LombaCard";
import { LOMBA } from "@/data/lomba";

export const Route = createFileRoute("/cabang-lomba")({
  head: () => ({
    meta: [
      { title: "Cabang Lomba — SHINE OF SMAMSA 2026" },
      { name: "description", content: "10+ cabang lomba: Futsal, Mobile Legends, Bulu Tangkis, LTBB, Pionering, Tahfidz, MTQ, SSC, Vocal Solo, Pidato Bahasa Inggris." },
      { property: "og:title", content: "Cabang Lomba — SHINE OF SMAMSA 2026" },
      { property: "og:description", content: "Pilih tantanganmu. Pendaftaran 100% gratis." },
    ],
  }),
  component: CabangPage,
});

function CabangPage() {
  const categories = ["Semua", ...Array.from(new Set(LOMBA.map((l) => l.category)))];
  const [active, setActive] = useState("Semua");
  const list = active === "Semua" ? LOMBA : LOMBA.filter((l) => l.category === active);

  return (
    <PageShell>
      <PageHero
        eyebrow="Kategori Lomba"
        title="Pilih Tantanganmu"
        subtitle="10+ cabang lomba lintas bidang. Semua gratis. Buktikan dedikasi dan prestasimu."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === c
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <LombaCard key={l.slug} l={l} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
