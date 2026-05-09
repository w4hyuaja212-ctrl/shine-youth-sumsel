import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Trophy, Instagram, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary-deep text-primary-foreground" style={{ background: "var(--primary-deep)" }}>
      <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
                <Trophy className="h-5 w-5 text-gold-foreground" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-bold">SOF SMAMSA 2026</div>
                <div className="text-[11px] uppercase tracking-widest text-primary-foreground/70">Shine Of Smamsa</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
              Wadah kreativitas dan prestasi siswa melalui kompetisi yang sportif dan edukatif.
              Bergabunglah bersama kami menciptakan masa depan gemilang.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Hubungi Kami</h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>JL. Balayudha KM. 4,5 No. 21A, Palembang</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="tel:+6281933360477" className="hover:text-gold">+62 819-3336-0477</a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="mailto:info@smam1plg.sch.id" className="hover:text-gold">info@smam1plg.sch.id</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Tautan Cepat</h4>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <li><Link to="/" className="text-primary-foreground/85 hover:text-gold">Beranda</Link></li>
              <li><Link to="/cabang-lomba" className="text-primary-foreground/85 hover:text-gold">Cabang Lomba</Link></li>
              <li><Link to="/jadwal" className="text-primary-foreground/85 hover:text-gold">Jadwal Event</Link></li>
              <li><Link to="/faq" className="text-primary-foreground/85 hover:text-gold">FAQ</Link></li>
              <li><Link to="/kontak" className="text-primary-foreground/85 hover:text-gold">Kontak</Link></li>
              <li><a href="#" className="text-primary-foreground/85 hover:text-gold inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Website Resmi</a></li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-gold-foreground hover:border-transparent transition">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/70 sm:flex-row">
          <p>© 2026 SMA Muhammadiyah 1 Palembang. All rights reserved.</p>
          <p className="font-semibold tracking-wider text-gold">Built for Excellence.</p>
        </div>
      </div>
    </footer>
  );
}
