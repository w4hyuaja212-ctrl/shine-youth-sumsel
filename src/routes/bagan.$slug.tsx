import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { LOMBA } from "@/data/lomba";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy } from "lucide-react";

export const Route = createFileRoute("/bagan/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Bagan ${params.slug} — SOF SMAMSA 2026` }],
  }),
  component: BaganDetail,
});

const BRACKET_SLUGS = new Set(["futsal", "bulu-tangkis", "mobile-legends"]);

function BaganDetail() {
  const { slug } = Route.useParams();
  const lomba = LOMBA.find(l => l.slug === slug);
  const isBracket = BRACKET_SLUGS.has(slug);
  const [data, setData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (isBracket) {
        const { data: b } = await supabase.from("lomba_brackets").select("data,published").eq("lomba_slug", slug).maybeSingle();
        setData(b?.published ? b.data : null);
      } else {
        const { data: p } = await supabase.from("lomba_points").select("data,published").eq("lomba_slug", slug).maybeSingle();
        setData(p?.published ? p.data : null);
      }
      setLoaded(true);
    })();
  }, [slug, isBracket]);

  return (
    <PageShell>
      <PageHero eyebrow="Bagan & Poin" title={lomba?.name ?? "Bagan"} subtitle={isBracket ? "Sistem turnamen single elimination" : "Klasemen poin"} />
      <section className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <Link to="/bagan" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua cabang</Link>

        {!loaded ? <div className="text-sm text-muted-foreground">Memuat…</div>
          : !data ? <Card><CardContent className="p-12 text-center text-muted-foreground">Bagan/poin untuk cabang ini belum dipublikasi panitia.</CardContent></Card>
          : isBracket ? <BracketView data={data} /> : <PointsView data={data} />}
      </section>
    </PageShell>
  );
}

function BracketView({ data }: { data: any }) {
  const rounds = data?.rounds ?? [];
  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-4">
      <div className="flex gap-6 min-w-max">
        {rounds.map((round: any, ri: number) => (
          <div key={ri} className="flex flex-col gap-3 w-60">
            <div className="text-center text-xs font-bold uppercase text-muted-foreground">{round.name}</div>
            {round.matches.map((m: any, mi: number) => (
              <div key={mi} className="rounded-lg border bg-background p-2 text-sm">
                <Slot name={m.a} score={m.scoreA} winner={m.winner === "a"} />
                <div className="text-center text-[10px] text-muted-foreground py-1">vs</div>
                <Slot name={m.b} score={m.scoreB} winner={m.winner === "b"} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({ name, score, winner }: any) {
  return (
    <div className={`flex justify-between rounded px-2 py-1 ${winner ? "bg-emerald-500/15 font-bold" : "bg-muted/50"}`}>
      <span className="truncate">{name || <span className="text-muted-foreground italic">TBD</span>}</span>
      <span className="ml-2">{score === "" || score == null ? "-" : score}</span>
    </div>
  );
}

function PointsView({ data }: { data: any[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase">
          <tr><th className="px-4 py-3 w-16">Rank</th><th className="px-4">Tim/Peserta</th><th className="px-4">Sekolah</th><th className="px-4 w-24 text-right">Poin</th></tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className={`border-t ${i < 3 ? "bg-amber-500/5" : ""}`}>
              <td className="px-4 py-3 font-bold flex items-center gap-1">{i < 3 && <Trophy className="h-4 w-4 text-amber-500" />}{i + 1}</td>
              <td className="px-4 font-medium">{r.tim}</td>
              <td className="px-4 text-muted-foreground">{r.sekolah}</td>
              <td className="px-4 text-right font-bold">{r.poin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
