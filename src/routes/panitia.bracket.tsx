import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOMBA } from "@/data/lomba";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Save, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/panitia/bracket")({
  head: () => ({ meta: [{ title: "Bracket & Poin — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><BracketAdmin /></DashboardLayout>,
});

const BRACKET_SLUGS = new Set(["futsal", "bulu-tangkis", "mobile-legends"]);

type Match = { a: string; b: string; scoreA: number | ""; scoreB: number | ""; winner: "" | "a" | "b" };
type Round = { name: string; matches: Match[] };
type BracketData = { rounds: Round[] };
type PointRow = { tim: string; sekolah: string; poin: number };

const emptyBracket = (size: 4 | 8 | 16): BracketData => {
  const rounds: Round[] = [];
  let n = size;
  let i = 0;
  while (n >= 2) {
    rounds.push({
      name: i === 0 ? `Babak ${size} Besar` : i === 1 && size === 16 ? "Perempat Final" : (n as number) === 2 ? "Final" : (n as number) === 4 ? "Semifinal" : `Babak ${n}`,
      matches: Array.from({ length: n / 2 }, () => ({ a: "", b: "", scoreA: "", scoreB: "", winner: "" })),
    });
    n = n / 2;
    i++;
  }
  return { rounds };
};

function BracketAdmin() {
  const { roles, isSuperadmin } = useAuth();
  const allowedNames = isSuperadmin ? LOMBA.map(l => l.name) : roles.filter(r => r.akses_lomba).map(r => r.akses_lomba!);
  const allowed = LOMBA.filter(l => allowedNames.includes(l.name));
  const [slug, setSlug] = useState<string>(allowed[0]?.slug ?? "");
  const lomba = useMemo(() => LOMBA.find(l => l.slug === slug), [slug]);
  const isBracket = lomba ? BRACKET_SLUGS.has(lomba.slug) : false;

  const [bracket, setBracket] = useState<BracketData>({ rounds: [] });
  const [points, setPoints] = useState<PointRow[]>([]);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!lomba) return;
    (async () => {
      if (isBracket) {
        const { data } = await supabase.from("lomba_brackets").select("*").eq("lomba_slug", lomba.slug).maybeSingle();
        setBracket((data?.data as BracketData) ?? { rounds: [] });
        setPublished(data?.published ?? false);
      } else {
        const { data } = await supabase.from("lomba_points").select("*").eq("lomba_slug", lomba.slug).maybeSingle();
        setPoints((data?.data as PointRow[]) ?? []);
        setPublished(data?.published ?? false);
      }
    })();
  }, [slug, isBracket, lomba]);

  const save = async (publish?: boolean) => {
    if (!lomba) return;
    setBusy(true);
    try {
      const newPub = publish ?? published;
      if (isBracket) {
        const { error } = await supabase.from("lomba_brackets").upsert({
          lomba_slug: lomba.slug, lomba_name: lomba.name, data: bracket as any, published: newPub,
        }, { onConflict: "lomba_slug" });
        if (error) throw error;
      } else {
        const ranked = [...points].sort((a, b) => b.poin - a.poin);
        const { error } = await supabase.from("lomba_points").upsert({
          lomba_slug: lomba.slug, lomba_name: lomba.name, data: ranked as any, published: newPub,
        }, { onConflict: "lomba_slug" });
        if (error) throw error;
        setPoints(ranked);
      }
      setPublished(newPub);
      toast.success(newPub ? "Tersimpan & dipublikasi" : "Tersimpan (draft)");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (allowed.length === 0) return <div className="text-sm text-muted-foreground">Anda tidak memiliki akses cabang manapun.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Bracket & Poin</h1>
        <p className="text-sm text-muted-foreground">Editor bagan untuk Futsal, Bulu Tangkis, Mobile Legends. Tabel poin untuk lomba lain.</p>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs">Cabang:</Label>
          <select className="h-9 rounded-md border bg-transparent px-3 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {allowed.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{isBracket ? "Sistem Bracket" : "Sistem Poin"}</span>
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${published ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
            {published ? "Dipublikasi" : "Draft"}
          </span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => save(!published)}>
              {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {published ? "Tarik publikasi" : "Publikasi"}
            </Button>
            <Button size="sm" onClick={() => save()} disabled={busy}><Save className="h-4 w-4" /> Simpan</Button>
          </div>
        </div>
      </CardContent></Card>

      {isBracket ? (
        <BracketEditor data={bracket} setData={setBracket} />
      ) : (
        <PointsEditor data={points} setData={setPoints} />
      )}
    </div>
  );
}

function BracketEditor({ data, setData }: { data: BracketData; setData: (d: BracketData) => void }) {
  const setSize = (size: 4 | 8 | 16) => setData(emptyBracket(size));

  const updateMatch = (ri: number, mi: number, patch: Partial<Match>) => {
    const next: BracketData = { rounds: data.rounds.map(r => ({ ...r, matches: r.matches.map(m => ({ ...m })) })) };
    next.rounds[ri].matches[mi] = { ...next.rounds[ri].matches[mi], ...patch };
    // Auto-propagate winner ke ronde berikutnya
    for (let r = 0; r < next.rounds.length - 1; r++) {
      next.rounds[r].matches.forEach((m, idx) => {
        const nextMatchIdx = Math.floor(idx / 2);
        const slot = idx % 2 === 0 ? "a" : "b";
        const winnerName = m.winner === "a" ? m.a : m.winner === "b" ? m.b : "";
        if (next.rounds[r + 1]?.matches[nextMatchIdx]) {
          next.rounds[r + 1].matches[nextMatchIdx][slot as "a" | "b"] = winnerName;
        }
      });
    }
    setData(next);
  };

  if (data.rounds.length === 0) {
    return (
      <Card><CardContent className="p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Belum ada bagan. Pilih ukuran turnamen:</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => setSize(4)}>4 Tim</Button>
          <Button onClick={() => setSize(8)}>8 Tim</Button>
          <Button onClick={() => setSize(16)}>16 Tim</Button>
        </div>
      </CardContent></Card>
    );
  }

  return (
    <Card><CardContent className="p-4">
      <div className="flex justify-end mb-3"><Button size="sm" variant="outline" onClick={() => setData({ rounds: [] })}>Reset bagan</Button></div>
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {data.rounds.map((round, ri) => (
            <div key={ri} className="flex flex-col gap-3 w-64">
              <div className="text-center text-xs font-bold uppercase text-muted-foreground">{round.name}</div>
              {round.matches.map((m, mi) => (
                <div key={mi} className="rounded-lg border bg-card p-2 space-y-1">
                  <SlotRow disabled={ri > 0} value={m.a} score={m.scoreA} winner={m.winner === "a"}
                    onName={(v) => updateMatch(ri, mi, { a: v })}
                    onScore={(v) => updateMatch(ri, mi, { scoreA: v, winner: v !== "" && m.scoreB !== "" ? (Number(v) > Number(m.scoreB) ? "a" : Number(v) < Number(m.scoreB) ? "b" : "") : m.winner })}
                  />
                  <div className="text-center text-[10px] text-muted-foreground">vs</div>
                  <SlotRow disabled={ri > 0} value={m.b} score={m.scoreB} winner={m.winner === "b"}
                    onName={(v) => updateMatch(ri, mi, { b: v })}
                    onScore={(v) => updateMatch(ri, mi, { scoreB: v, winner: v !== "" && m.scoreA !== "" ? (Number(v) > Number(m.scoreA) ? "b" : Number(v) < Number(m.scoreA) ? "a" : "") : m.winner })}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </CardContent></Card>
  );
}

function SlotRow({ value, score, winner, disabled, onName, onScore }: { value: string; score: number | ""; winner: boolean; disabled: boolean; onName: (v: string) => void; onScore: (v: number | "") => void }) {
  return (
    <div className={`flex items-center gap-1 rounded-md border px-1 ${winner ? "border-emerald-500 bg-emerald-500/5" : ""}`}>
      <Input className="h-7 border-0 px-1 text-xs" value={value} disabled={disabled} placeholder="Nama tim" onChange={(e) => onName(e.target.value)} />
      <Input className="h-7 w-12 border-0 px-1 text-center text-xs" type="number" min={0} value={score} onChange={(e) => onScore(e.target.value === "" ? "" : Number(e.target.value))} />
    </div>
  );
}

function PointsEditor({ data, setData }: { data: PointRow[]; setData: (d: PointRow[]) => void }) {
  const update = (i: number, patch: Partial<PointRow>) => setData(data.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const sorted = [...data].map((r, i) => ({ ...r, _i: i })).sort((a, b) => b.poin - a.poin);
  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setData([...data, { tim: "", sekolah: "", poin: 0 }])}>
          <Plus className="h-4 w-4" /> Tambah Baris
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase">
          <tr><th className="px-2 py-2 w-12">#</th><th className="px-2">Tim/Peserta</th><th className="px-2">Sekolah</th><th className="px-2 w-24">Poin</th><th className="w-12"></th></tr>
        </thead>
        <tbody>
          {sorted.map((r, rank) => (
            <tr key={r._i} className="border-t">
              <td className="px-2 py-1 font-bold">{rank + 1}</td>
              <td className="px-2"><Input className="h-8" value={r.tim} onChange={(e) => update(r._i, { tim: e.target.value })} /></td>
              <td className="px-2"><Input className="h-8" value={r.sekolah} onChange={(e) => update(r._i, { sekolah: e.target.value })} /></td>
              <td className="px-2"><Input className="h-8" type="number" value={r.poin} onChange={(e) => update(r._i, { poin: Number(e.target.value) || 0 })} /></td>
              <td><Button size="sm" variant="ghost" onClick={() => setData(data.filter((_, x) => x !== r._i))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Belum ada peserta. Klik "Tambah Baris".</td></tr>}
        </tbody>
      </table>
    </CardContent></Card>
  );
}
