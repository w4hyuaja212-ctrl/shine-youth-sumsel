import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — SHINE OF SMAMSA 2026" },
      { name: "description", content: "Jawaban atas pertanyaan yang sering diajukan tentang SHINE OF SMAMSA 2026." },
      { property: "og:title", content: "FAQ — SHINE OF SMAMSA 2026" },
      { property: "og:description", content: "Butuh bantuan? Temukan jawaban cepat di sini." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Apakah pendaftaran dipungut biaya?",
    a: "TIDAK. Seluruh cabang lomba pada SHINE OF SMAMSA 2026 tidak dipungut biaya pendaftaran (GRATIS).",
  },
  {
    q: "Kapan pendaftaran ditutup?",
    a: "Pendaftaran ditutup pada 30 April 2026 pukul 23.59 WIB. Pastikan semua berkas peserta sudah diunggah sebelum batas waktu.",
  },
  {
    q: "Kapan dan di mana Technical Meeting dilaksanakan?",
    a: "Technical Meeting dilaksanakan pada 11 Mei 2026 pukul 13.00 WIB di Aula SMA Muhammadiyah 1 Palembang. Wajib dihadiri perwakilan tiap sekolah.",
  },
  {
    q: "Di mana lokasi perlombaan berlangsung?",
    a: "Seluruh cabang dilaksanakan di kompleks SMA Muhammadiyah 1 Palembang — Gedung A untuk lomba indoor, Gedung B untuk olahraga.",
  },
  {
    q: "Bagaimana cara mendapatkan Juknis lengkap?",
    a: "Juknis dapat diunduh melalui tombol Download Juknis di halaman Beranda atau melalui Dashboard Sekolah setelah login NPSN.",
  },
  {
    q: "Apakah peserta putri wajib berhijab?",
    a: "Ya. Mengingat kompetisi diselenggarakan oleh sekolah Muhammadiyah, seluruh peserta putri diwajibkan menggunakan hijab selama berada di area perlombaan.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell>
      <PageHero
        eyebrow="Butuh Bantuan?"
        title="Pertanyaan yang Sering Diajukan"
        subtitle="Jawaban cepat untuk pertanyaan yang sering diajukan seputar teknis lomba."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`rounded-2xl border bg-card transition ${
                  isOpen ? "border-primary/50 shadow-card" : "border-border"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-base font-bold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
