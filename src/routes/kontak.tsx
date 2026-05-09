import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { MapPin, Phone, Mail, Instagram, Globe } from "lucide-react";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak — SHINE OF SMAMSA 2026" },
      { name: "description", content: "Hubungi panitia SHINE OF SMAMSA 2026 — SMA Muhammadiyah 1 Palembang." },
      { property: "og:title", content: "Kontak — SHINE OF SMAMSA 2026" },
      { property: "og:description", content: "Sapa kami untuk pertanyaan, kemitraan, atau kebutuhan media." },
    ],
  }),
  component: KontakPage,
});

const CARDS = [
  {
    icon: MapPin,
    title: "Alamat",
    value: "JL. Balayudha KM. 4,5 No. 21A, Palembang, Sumatera Selatan",
    href: "https://maps.google.com/?q=SMA+Muhammadiyah+1+Palembang",
  },
  { icon: Phone, title: "Telepon / WhatsApp", value: "+62 819-3336-0477", href: "tel:+6281933360477" },
  { icon: Mail, title: "Email", value: "info@smam1plg.sch.id", href: "mailto:info@smam1plg.sch.id" },
  { icon: Globe, title: "Website Resmi", value: "smam1plg.sch.id", href: "https://smam1plg.sch.id" },
];

function KontakPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Hubungi Kami"
        title="Mari Terhubung"
        subtitle="Punya pertanyaan tentang lomba, kemitraan, atau kebutuhan media? Tim panitia siap membantu."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {CARDS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{c.title}</div>
                <div className="mt-1 font-display text-lg font-bold text-foreground group-hover:text-primary">
                  {c.value}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-gradient-primary p-8 text-center text-primary-foreground shadow-glow sm:p-12">
          <Instagram className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">Ikuti Sosial Media Kami</h2>
          <p className="mt-2 text-primary-foreground/85">
            Update terbaru tentang SHINE OF SMAMSA 2026 langsung ke timeline kamu.
          </p>
          <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-extrabold text-gold-foreground shadow-gold hover:scale-[1.03] transition-transform"
          >
            <Instagram className="h-4 w-4" /> @sof.smamsa
          </a>
        </div>
      </section>
    </PageShell>
  );
}
