import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { Countdown } from "@/components/Countdown";
import { PageShell } from "@/components/PageShell";
import { LombaCard } from "@/components/LombaCard";
import { LOMBA, SCHEDULE } from "@/data/lomba";
import { ArrowRight, Calendar, Download, Trophy, Coins, Ticket, MapPin, LogIn, ListChecks, FileSignature, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHINE OF SMAMSA 2026 — Run Together, Grow Stronger" },
      { name: "description", content: "Wadah kreativitas pelajar terbesar se-Sumatera Selatan. 10+ cabang lomba, GRATIS pendaftaran. Daftar sekarang!" },
      { property: "og:title", content: "SHINE OF SMAMSA 2026" },
      { property: "og:description", content: "Sportsmanship • Harmony • Innovation • Nurture • Excellence. Kompetisi pelajar terbesar di Sumatera Selatan." },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { icon: Coins, label: "Hadiah Total", value: "Jutaan IDR" },
  { icon: Trophy, label: "Cabang Lomba", value: "10+" },
  { icon: Ticket, label: "Biaya", value: "100% Free" },
  { icon: MapPin, label: "Cakupan", value: "Sumatera Selatan" },
];

const STEPS = [
  { icon: LogIn, title: "Login Sekolah", desc: "Masuk menggunakan NPSN sekolah Anda. Data sekolah otomatis terdeteksi." },
  { icon: ListChecks, title: "Pilih Lomba", desc: "Masuk ke Dashboard Sekolah dan pilih cabang lomba yang ingin diikuti." },
  { icon: FileSignature, title: "Lengkapi Data", desc: "Isi formulir pendaftaran peserta/tim dan upload berkas persyaratan." },
  { icon: ShieldCheck, title: "Verifikasi", desc: "Panitia memvalidasi data. Notifikasi status dikirim via WhatsApp." },
  { icon: Users, title: "Technical Meeting", desc: "Hadir pada 11 Mei 2026 pukul 13.00 WIB untuk koordinasi teknis." },
];

function HomePage() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative -mt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1600} height={900} />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-40">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
              2026 Edition
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              SHINE OF <span className="text-gradient-gold">SMAMSA</span> 2026
            </h1>
            <p className="mt-3 max-w-xl text-sm italic text-white/75 sm:text-base">
              Sportsmanship • Harmony • Innovation • Nurture • Excellence — SMA Muhammadiyah 1 Palembang
            </p>

            <p className="mt-6 max-w-2xl font-display text-xl font-bold text-gold sm:text-2xl">
              Run Together, Grow Stronger
            </p>
            <p className="mt-3 max-w-2xl text-base text-white/85">
              Wadah kreativitas pelajar terbesar se-Sumatera Selatan. Mengusung tema{" "}
              <span className="font-semibold text-white">
                "Youth Collaboration For Advanced and Equitable Education"
              </span>
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2 text-sm font-extrabold text-gold-foreground shadow-gold animate-float">
              ✨ GRATIS PENDAFTARAN ✨
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cabang-lomba"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-deep shadow-lg hover:scale-[1.03] transition-transform"
              >
                Daftar Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/jadwal"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
              >
                <Calendar className="h-4 w-4" /> Cek Jadwal
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
              >
                <Download className="h-4 w-4" /> Download Juknis
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl shadow-glow sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Pendaftaran Online</div>
                <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              </div>
              <Countdown />
              <Link
                to="/cabang-lomba"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold hover:brightness-110 transition"
              >
                DAFTAR SEKARANG <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border px-0 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card px-6 py-8 text-center sm:px-8">
              <s.icon className="mx-auto h-7 w-7 text-primary" />
              <div className="mt-3 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOMBA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Kategori Lomba</div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Pilih Tantanganmu
          </h2>
          <p className="mt-3 text-muted-foreground">
            10+ cabang lomba lintas bidang — olahraga, e-sport, kepanduan, keagamaan, akademik, seni, dan bahasa.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOMBA.slice(0, 6).map((l) => (
            <LombaCard key={l.slug} l={l} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/cabang-lomba"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary/90"
          >
            Lihat Semua Cabang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* STEPS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Panduan</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Alur Pendaftaran</h2>
            <p className="mt-3 text-muted-foreground">
              Ikuti 5 langkah mudah berikut untuk mendaftarkan sekolah Anda dalam kompetisi ini.
            </p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gold-deep">
                  Langkah {i + 1}
                </div>
                <h3 className="mt-1 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* JADWAL TEASER */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Roadmap</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Jadwal Pelaksanaan</h2>
          </div>
          <Link to="/jadwal" className="text-sm font-bold text-primary hover:underline">
            Lihat detail →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SCHEDULE.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="font-display text-xs font-bold uppercase tracking-widest text-gold-deep">
                Etape {i + 1}
              </div>
              <div className="mt-2 font-display text-base font-extrabold text-primary">{s.date}</div>
              <h3 className="mt-2 font-bold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-radial opacity-70" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Trophy className="mx-auto h-12 w-12 text-gold animate-float" />
          <h2 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Siap Menjadi Juara?</h2>
          <p className="mt-3 text-primary-foreground/85">
            Daftarkan sekolahmu sekarang. Buktikan bahwa kalian adalah yang terbaik se-Sumatera Selatan.
          </p>
          <Link
            to="/cabang-lomba"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-extrabold text-gold-foreground shadow-gold hover:scale-[1.03] transition-transform"
          >
            DAFTAR SEKARANG <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
