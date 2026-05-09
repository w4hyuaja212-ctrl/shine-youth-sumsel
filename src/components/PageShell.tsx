import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-primary text-primary-foreground">
      <div className="absolute inset-0 bg-gradient-radial opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {eyebrow && (
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">{eyebrow}</div>
        )}
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
