"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { StandingsTable } from "./standings-table";
import type { GroupStandings } from "@/types/tournament";

interface GroupTabsClientProps {
  groupStandings: GroupStandings[];
}

export function GroupTabsClient({ groupStandings }: GroupTabsClientProps) {
  const [activeGroup, setActiveGroup] = useState(
    groupStandings[0]?.groupName ?? "A"
  );

  const active = groupStandings.find((g) => g.groupName === activeGroup);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {groupStandings.map((g) => (
          <button
            key={g.groupName}
            onClick={() => setActiveGroup(g.groupName)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all",
              activeGroup === g.groupName
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card border border-border/50"
            )}
          >
            Grup {g.groupName}
          </button>
        ))}
      </div>

      {/* Card */}
      {active && (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm card-glow overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">
                Grup{" "}
                <span className="gradient-text">{active.groupName}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {active.standings.length} tim · Round Robin
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-0.5">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Lolos Quarter Final</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-2 h-2 rounded-full bg-red-400/70" />
                <span>Eliminasi</span>
              </div>
            </div>
          </div>
          <div className="p-2 md:p-4">
            <StandingsTable
              standings={active.standings}
              groupName={active.groupName}
            />
          </div>
        </div>
      )}

      {/* All groups grid on wide screens */}
      <div className="hidden xl:grid grid-cols-2 gap-6 pt-4">
        {groupStandings.map((g) => (
          <div
            key={g.groupId}
            className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="font-bold">
                Grup <span className="gradient-text">{g.groupName}</span>
              </h3>
            </div>
            <div className="p-2">
              <StandingsTable standings={g.standings} groupName={g.groupName} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
