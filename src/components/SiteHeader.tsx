import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Trophy } from "lucide-react";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/cabang-lomba", label: "Cabang Lomba" },
  { to: "/jadwal", label: "Jadwal" },
  { to: "/faq", label: "FAQ" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow group-hover:scale-105 transition-transform">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-foreground">SHINE OF SMAMSA</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">2026 Edition</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/cabang-lomba"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-gold hover:scale-[1.03] transition-transform"
          >
            Daftar Sekarang
          </Link>
        </div>

        <button
          onClick={() => setOpen((s) => !s)}
          className="rounded-md p-2 text-foreground lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
                activeProps={{ className: "bg-accent text-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/cabang-lomba"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-full bg-gradient-gold px-5 py-3 text-center text-sm font-bold text-gold-foreground shadow-gold"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
