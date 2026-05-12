import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { LOMBA } from "@/data/lomba";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, BarChart3, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/bagan/")({
  head: () => ({
    meta: [
      { title: "Bagan & Poin Lomba — SHINE OF SMAMSA 2026" },
      { name: "description", content: "Lihat bagan turnamen dan klasemen poin tiap cabang lomba SHINE OF SMAMSA 2026." },
    ],
  }),
  component: BaganIndex,
});

const BRACKET_SLUGS = new Set(["futsal", "bulu-tangkis", "mobile-legends"]);

function BaganIndex() {
  const [pubB, setPubB] = useState<Set<string>>(new Set());
  const [pubP, setPubP] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: b }, { data: p }] = await Promise.all([
        supabase.from("lomba_brackets").select("lomba_slug,published").eq("published", true),
        supabase.from("lomba_points").select("lomba_slug,published").eq("published", true),
      ]);
      setPubB(new Set((b ?? []).map(x => x.lomba_slug)));
      setPubP(new Set((p ?? []).map(x => x.lomba_slug)));
    })();
  }, []);

  return (
    <PageShell>
      <PageHero eyebrow="Hasil & Klasemen" title="Bagan & Poin" subtitle="Pantau perkembangan setiap cabang lomba secara langsung." />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LOMBA.map((l) => {
            const isBracket = BRACKET_SLUGS.has(l.slug);
            const isPub = isBracket ? pubB.has(l.slug) : pubP.has(l.slug);
            return (
              <Link key={l.slug} to="/bagan/$slug" params={{ slug: l.slug }} className={`group rounded-xl border bg-card p-5 transition-shadow hover:shadow-elegant ${!isPub ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{l.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {isBracket ? <><Trophy className="h-3 w-3" /> Sistem Bracket</> : <><BarChart3 className="h-3 w-3" /> Sistem Poin</>}
                      {isPub ? <span className="ml-2 rounded-full bg-emerald-500/15 px-2 text-emerald-600">Live</span> : <span className="ml-2 rounded-full bg-muted px-2">Belum tersedia</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
