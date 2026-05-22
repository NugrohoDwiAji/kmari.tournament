import { getGroupStandings } from "@/actions/match-actions";
import { StandingsTable } from "@/components/standings/standings-table";
import { GroupTabsClient } from "@/components/standings/group-tabs-client";
import { Trophy, Users, Zap, DatabaseZap } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let groupStandings: Awaited<ReturnType<typeof getGroupStandings>> = [];
  let dbError: string | null = null;

  try {
    groupStandings = await getGroupStandings();
  } catch (err) {
    console.error("[HomePage] Database error:", err);
    dbError = err instanceof Error ? err.message : "Koneksi database gagal.";
  }

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <DatabaseZap className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            Database Tidak Tersambung
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Pastikan{" "}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-orange-400 text-xs">
              DATABASE_URL
            </code>{" "}
            sudah diisi dengan benar di file{" "}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
              .env.local
            </code>
            .
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-3 text-xs text-left bg-black/40 border border-white/10 rounded-xl p-4 max-w-lg overflow-auto text-red-300">
              {dbError}
            </pre>
          )}
        </div>
      </div>
    );
  }

  const totalTeams = groupStandings.reduce((a, g) => a + g.standings.length, 0);
  const totalMatches = groupStandings.reduce((acc, g) => {
    const n = g.standings.length;
    return acc + (n * (n - 1)) / 2;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Zap className="w-3.5 h-3.5" />
          Live Tournament
        </div>
        <h1 className="text-4xl md:text-6xl font-black gradient-text">
          ESPORTS CHAMPIONSHIP
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Fase Grup — Ikuti perkembangan klasemen realtime dan raih tiket ke
          fase playoff
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Grup",
            value: groupStandings.length,
            icon: "🏆",
            color: "text-yellow-400",
          },
          {
            label: "Total Tim",
            value: totalTeams,
            icon: "👥",
            color: "text-blue-400",
          },
          {
            label: "Total Match",
            value: totalMatches,
            icon: "⚔️",
            color: "text-purple-400",
          },
          {
            label: "Tim Lolos QF",
            value: groupStandings.length * 2,
            icon: "🎯",
            color: "text-green-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 text-center card-glow"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-muted-foreground">
            Lolos Playoff (1st & 2nd)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="text-muted-foreground">Eliminasi</span>
        </div>
      </div>

      {/* Standings */}
      <GroupTabsClient groupStandings={groupStandings} />
    </div>
  );
}
