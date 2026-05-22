import {
  generateQuarterFinals,
  getGroupStandings,
} from "@/actions/match-actions";
import { BracketView } from "@/components/bracket/bracket-view";
import { GitBranch, Info } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BracketPage() {
  const [quarterFinals, groupStandings] = await Promise.all([
    generateQuarterFinals(),
    getGroupStandings(),
  ]);

  const allGroupsHaveData = groupStandings.every((g) =>
    g.standings.some((s: { played: number }) => s.played > 0),
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
          <GitBranch className="w-3.5 h-3.5" />
          Playoff Bracket
        </div>
        <h1 className="text-3xl md:text-5xl font-black gradient-text">
          QUARTER FINALS
        </h1>
        <p className="text-muted-foreground">
          Bracket otomatis berdasarkan posisi akhir fase grup
        </p>
      </div>

      {!allGroupsHaveData && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-blue-300 text-sm">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Bracket akan terisi otomatis setelah semua pertandingan fase grup
            selesai. Saat ini menampilkan data berdasarkan klasemen yang
            tersedia.
          </p>
        </div>
      )}

      <BracketView quarterFinals={quarterFinals} />

      {/* Bracket rules */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-3">
        <h3 className="font-bold text-base">Format Bracket Quarter Final</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
          {[
            { match: "QF 1", desc: "Juara Grup A vs Runner-up Grup B" },
            { match: "QF 2", desc: "Juara Grup B vs Runner-up Grup C" },
            { match: "QF 3", desc: "Juara Grup C vs Runner-up Grup D" },
            { match: "QF 4", desc: "Juara Grup D vs Runner-up Grup A" },
          ].map((item) => (
            <div
              key={item.match}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <span className="font-bold text-primary text-xs px-2 py-1 rounded bg-primary/10 border border-primary/20 shrink-0">
                {item.match}
              </span>
              <span>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
