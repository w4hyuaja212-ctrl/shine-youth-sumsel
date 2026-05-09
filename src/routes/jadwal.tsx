import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SCHEDULE } from "@/data/lomba";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/jadwal")({
  head: () => ({
    meta: [
      { title: "Jadwal Pelaksanaan — SHINE OF SMAMSA 2026" },
      { name: "description", content: "Roadmap lengkap SHINE OF SMAMSA 2026: pendaftaran, technical meeting, pelaksanaan, dan grand final." },
      { property: "og:title", content: "Jadwal — SHINE OF SMAMSA 2026" },
      { property: "og:description", content: "Simpan tanggal penting. Jangan lewatkan momen kompetisi terhebat tahun ini." },
    ],
  }),
  component: JadwalPage,
});

function JadwalPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Roadmap"
        title="Jadwal Pelaksanaan"
        subtitle="Simpan tanggal penting ini. Jangan sampai ada momen yang terlewatkan dari kompetisi terhebat tahun ini."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="relative space-y-6 border-l-2 border-dashed border-primary/30 pl-8">
          {SCHEDULE.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[42px] flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow ring-4 ring-background">
                <Calendar className="h-4 w-4" />
              </span>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gold-deep">
                  Etape {i + 1}
                </div>
                <div className="mt-1 font-display text-xl font-extrabold text-primary">{s.date}</div>
                <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
