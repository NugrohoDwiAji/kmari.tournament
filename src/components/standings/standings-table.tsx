import { cn } from "@/lib/utils";
import type { TeamStanding } from "@/types/tournament";
import { Crown, TrendingDown, Minus } from "lucide-react";

interface StandingsTableProps {
  standings: TeamStanding[];
  groupName: string;
}

export function StandingsTable({ standings, groupName }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-medium">Belum ada data klasemen</p>
        <p className="text-sm mt-1">Mulai input hasil pertandingan untuk melihat klasemen</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-2 text-muted-foreground font-medium w-8">#</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium min-w-[140px]">Tim</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">M</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">W</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">D</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">L</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">GF</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">GA</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium">GD</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => (
            <StandingRow key={team.teamId} team={team} index={idx} totalTeams={standings.length} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StandingRow({
  team,
  index,
  totalTeams,
}: {
  team: TeamStanding;
  index: number;
  totalTeams: number;
}) {
  const isChampion = index === 0;
  const isRunnerUp = index === 1;
  const isEliminated = index >= 2 && totalTeams > 2;

  return (
    <tr
      className={cn(
        "border-b border-border/30 transition-colors hover:bg-muted/20",
        isChampion && "bg-green-500/5 hover:bg-green-500/10",
        isRunnerUp && "bg-green-500/5 hover:bg-green-500/10",
        isEliminated && "bg-red-500/5 hover:bg-red-500/10"
      )}
    >
      {/* Position */}
      <td className="py-3 px-2">
        <div className="flex items-center justify-center w-6">
          {isChampion ? (
            <Crown className="w-4 h-4 text-yellow-400" />
          ) : (
            <span
              className={cn(
                "text-sm font-bold",
                isRunnerUp ? "text-green-400" : isEliminated ? "text-red-400/70" : "text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
          )}
        </div>
      </td>

      {/* Team Name */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-8 rounded-full flex-shrink-0",
              isChampion && "bg-yellow-400",
              isRunnerUp && "bg-green-400",
              isEliminated && "bg-red-500/50",
              !isChampion && !isRunnerUp && !isEliminated && "bg-border"
            )}
          />
          <span
            className={cn(
              "font-medium truncate max-w-[120px] md:max-w-none",
              isChampion && "text-yellow-300",
              isRunnerUp && "text-green-300",
              isEliminated && "text-foreground/60"
            )}
          >
            {team.teamName}
          </span>
          {isChampion && (
            <span className="hidden md:inline-flex text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shrink-0">
              QF
            </span>
          )}
          {isRunnerUp && (
            <span className="hidden md:inline-flex text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
              QF
            </span>
          )}
        </div>
      </td>

      {/* Stats */}
      {[team.played, team.won, team.drawn, team.lost, team.goalsFor, team.goalsAgainst].map(
        (val, i) => (
          <td key={i} className="py-3 px-2 text-center text-muted-foreground">
            {val}
          </td>
        )
      )}

      {/* GD */}
      <td className="py-3 px-2 text-center">
        <span
          className={cn(
            "font-medium",
            team.goalDiff > 0 && "text-green-400",
            team.goalDiff < 0 && "text-red-400",
            team.goalDiff === 0 && "text-muted-foreground"
          )}
        >
          {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
        </span>
      </td>

      {/* Points */}
      <td className="py-3 px-2 text-center">
        <span
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-base",
            isChampion && "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
            isRunnerUp && "bg-green-500/20 text-green-300 border border-green-500/30",
            isEliminated && "bg-red-500/10 text-foreground/50 border border-red-500/20",
            !isChampion && !isRunnerUp && !isEliminated && "text-foreground"
          )}
        >
          {team.points}
        </span>
      </td>
    </tr>
  );
}
