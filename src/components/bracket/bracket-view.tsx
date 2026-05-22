"use client";

import { cn } from "@/lib/utils";
import type { TeamStanding } from "@/types/tournament";
import { Crown, Swords } from "lucide-react";

interface QFMatch {
  matchNumber: number;
  label: string;
  team1: TeamStanding | undefined;
  team2: TeamStanding | undefined;
}

interface BracketViewProps {
  quarterFinals: QFMatch[];
}

export function BracketView({ quarterFinals }: BracketViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {quarterFinals.map((qf) => (
          <QFCard key={qf.matchNumber} match={qf} />
        ))}
      </div>

      {/* Placeholder for Semi-Finals */}
      <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-8 text-center">
        <div className="text-3xl mb-3">🏆</div>
        <h3 className="font-bold text-muted-foreground">Semi Final & Final</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Akan diisi setelah Quarter Final selesai
        </p>
      </div>
    </div>
  );
}

function QFCard({ match }: { match: QFMatch }) {
  const team1 = match.team1;
  const team2 = match.team2;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden card-glow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-primary">QF {match.matchNumber}</span>
        </div>
        <span className="text-xs text-muted-foreground">{match.label.split(": ")[1]}</span>
      </div>

      {/* Teams */}
      <div className="p-4 space-y-2">
        <TeamSlot team={team1} position={1} sourceLabel={`Juara Grup ${getGroupFromQF(match.matchNumber, "team1")}`} />
        <div className="flex items-center justify-center py-1">
          <span className="text-xs text-muted-foreground font-bold tracking-widest">VS</span>
        </div>
        <TeamSlot team={team2} position={2} sourceLabel={`Runner-up Grup ${getGroupFromQF(match.matchNumber, "team2")}`} />
      </div>
    </div>
  );
}

function TeamSlot({
  team,
  position,
  sourceLabel,
}: {
  team: TeamStanding | undefined;
  position: number;
  sourceLabel: string;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-dashed border-border/50">
        <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground/50 text-xs font-bold">
          ?
        </div>
        <div>
          <div className="text-sm text-muted-foreground/50 italic">{sourceLabel}</div>
          <div className="text-xs text-muted-foreground/30">Belum ditentukan</div>
        </div>
      </div>
    );
  }

  const isChampion = position === 1;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isChampion
          ? "bg-yellow-500/5 border-yellow-500/20"
          : "bg-green-500/5 border-green-500/20"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
          isChampion ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
        )}
      >
        {isChampion ? <Crown className="w-4 h-4" /> : "2"}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "font-bold text-sm truncate",
            isChampion ? "text-yellow-200" : "text-green-200"
          )}
        >
          {team.teamName}
        </div>
        <div className="text-xs text-muted-foreground">
          {sourceLabel} · {team.points} pts
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground space-y-0.5">
        <div>{team.won}W {team.drawn}D {team.lost}L</div>
        <div className={cn(team.goalDiff > 0 ? "text-green-400" : team.goalDiff < 0 ? "text-red-400" : "")}>
          GD: {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
        </div>
      </div>
    </div>
  );
}

function getGroupFromQF(matchNumber: number, slot: "team1" | "team2"): string {
  const map: Record<number, { team1: string; team2: string }> = {
    1: { team1: "A", team2: "B" },
    2: { team1: "B", team2: "C" },
    3: { team1: "C", team2: "D" },
    4: { team1: "D", team2: "A" },
  };
  return map[matchNumber]?.[slot] ?? "?";
}
