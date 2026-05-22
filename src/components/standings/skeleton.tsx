export function StandingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["A", "B", "C", "D"].map((g) => (
          <div
            key={g}
            className="w-20 h-9 rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <div className="h-5 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-6 h-6 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 flex-1 bg-muted/50 rounded animate-pulse" />
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="w-8 h-4 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
