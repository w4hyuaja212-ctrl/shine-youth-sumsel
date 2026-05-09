import type { Lomba } from "@/data/lomba";
import { Check, Sparkles } from "lucide-react";

export function LombaCard({ l }: { l: Lomba }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:border-primary/40">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
          {l.category}
        </span>
        <div className="text-3xl transition-transform group-hover:scale-110 group-hover:-rotate-6">
          {l.icon}
        </div>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold text-foreground">{l.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>

      <div className="my-5 h-px bg-border" />

      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Ketentuan Utama</h4>
        <ul className="mt-3 space-y-2">
          {l.rules.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-foreground/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 pt-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Biaya</div>
          <div className="text-gradient-gold font-display text-2xl font-extrabold">Gratis</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow">
          <Sparkles className="h-3.5 w-3.5" /> Daftar
        </span>
      </div>
    </article>
  );
}
