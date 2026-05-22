"use client";

import { useState, useTransition } from "react";
import { submitMatchResult } from "@/actions/match-actions";
import type { MatchWithTeams } from "@/types/tournament";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronUp, Edit3, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
}

interface AdminMatchesClientProps {
  matches: MatchWithTeams[];
  groups: Group[];
}

export function AdminMatchesClient({
  matches,
  groups,
}: AdminMatchesClientProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name ?? "A");
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const filteredMatches = matches.filter((m) => m.groupName === activeGroup);
  const finishedCount = filteredMatches.filter(
    (m) => m.status === "FINISHED",
  ).length;

  return (
    <div className="space-y-4">
      {/* Group Filter */}
      <div className="flex gap-2 flex-wrap">
        {groups.map((g) => {
          const grpMatches = matches.filter((m) => m.groupName === g.name);
          const done = grpMatches.filter((m) => m.status === "FINISHED").length;
          return (
            <button
              key={g.name}
              onClick={() => setActiveGroup(g.name)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeGroup === g.name
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card border border-border/50",
              )}
            >
              Grup {g.name}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  done === grpMatches.length && grpMatches.length > 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {done}/{grpMatches.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-bold text-foreground">{finishedCount}</span>
          <span className="text-muted-foreground">
            {" "}
            / {filteredMatches.length} match selesai
          </span>
        </div>
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            style={{
              width: filteredMatches.length
                ? `${(finishedCount / filteredMatches.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* Matches by round */}
      {(() => {
        const rounds = Array.from(
          new Set(filteredMatches.map((m) => m.round)),
        ).sort();
        return rounds.map((round) => {
          const roundMatches = filteredMatches.filter((m) => m.round === round);
          return (
            <div key={round} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Round {round}
              </h3>
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isEditing={editingId === match.id}
                  onEdit={() =>
                    setEditingId(editingId === match.id ? null : match.id)
                  }
                  onSaved={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                />
              ))}
            </div>
          );
        });
      })()}

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3">📭</div>
          <p>Tidak ada pertandingan di grup ini</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  isEditing,
  onEdit,
  onSaved,
}: {
  match: MatchWithTeams;
  isEditing: boolean;
  onEdit: () => void;
  onSaved: () => void;
}) {
  const isFinished = match.status === "FINISHED";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all",
        isFinished ? "border-green-500/20" : "border-border/50",
        isEditing && "border-orange-500/30 shadow-lg shadow-orange-500/5",
      )}
    >
      {/* Match header */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Home Team */}
          <div className="flex-1 text-right min-w-0">
            <span
              className={cn(
                "font-bold text-sm truncate block",
                isFinished &&
                  match.result &&
                  match.result.homeScore > match.result.awayScore
                  ? "text-green-300"
                  : "text-foreground",
              )}
            >
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 shrink-0">
            {isFinished && match.result ? (
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-3 py-1.5">
                <span
                  className={cn(
                    "font-black text-base w-5 text-center",
                    match.result.homeScore > match.result.awayScore
                      ? "text-green-300"
                      : "text-foreground",
                  )}
                >
                  {match.result.homeScore}
                </span>
                <span className="text-muted-foreground text-xs">:</span>
                <span
                  className={cn(
                    "font-black text-base w-5 text-center",
                    match.result.awayScore > match.result.homeScore
                      ? "text-green-300"
                      : "text-foreground",
                  )}
                >
                  {match.result.awayScore}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg px-3 py-1.5 border border-dashed border-border/50">
                <span className="text-muted-foreground/50 text-sm font-mono">
                  - : -
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "font-bold text-sm truncate block",
                isFinished &&
                  match.result &&
                  match.result.awayScore > match.result.homeScore
                  ? "text-green-300"
                  : "text-foreground",
              )}
            >
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onEdit}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
            isEditing
              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
              : isFinished
                ? "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50"
                : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30",
          )}
        >
          {isEditing ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <Edit3 className="w-3.5 h-3.5" />
          )}
          {isEditing ? "Tutup" : isFinished ? "Edit" : "Input"}
        </button>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="border-t border-border/50 bg-muted/10 p-4">
          <ScoreForm match={match} onSaved={onSaved} />
        </div>
      )}
    </div>
  );
}

function ScoreForm({
  match,
  onSaved,
}: {
  match: MatchWithTeams;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await submitMatchResult(
        { success: false, message: "" },
        formData,
      );
      if (result.success) {
        toast.success(result.message);
        onSaved();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="matchId" value={match.id} />

      <div className="grid grid-cols-3 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium truncate block">
            {match.homeTeam.name}
          </label>
          <input
            type="number"
            name="homeScore"
            min="0"
            max="999"
            defaultValue={match.result?.homeScore ?? 0}
            className="w-full bg-background border border-border/70 rounded-lg px-3 py-2 text-center text-lg font-black focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder="0"
          />
        </div>
        <div className="text-center pb-2 text-muted-foreground font-bold text-sm">
          VS
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium truncate block">
            {match.awayTeam.name}
          </label>
          <input
            type="number"
            name="awayScore"
            min="0"
            max="999"
            defaultValue={match.result?.awayScore ?? 0}
            className="w-full bg-background border border-border/70 rounded-lg px-3 py-2 text-center text-lg font-black focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          Catatan (opsional)
        </label>
        <input
          type="text"
          name="notes"
          defaultValue={match.result?.notes ?? ""}
          className="w-full bg-background border border-border/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          placeholder="Catatan pertandingan..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        {isPending ? "Menyimpan..." : "Simpan Hasil"}
      </button>
    </form>
  );
}
