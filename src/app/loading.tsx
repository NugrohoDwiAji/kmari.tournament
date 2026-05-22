import { StandingsSkeleton } from "@/components/standings/skeleton";
export default function Loading() {
  return (
    <div className="space-y-8 pt-4">
      <div className="text-center space-y-4">
        <div className="h-6 w-32 bg-muted/50 rounded-full mx-auto animate-pulse" />
        <div className="h-12 w-80 bg-muted/50 rounded-xl mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />)}
      </div>
      <StandingsSkeleton />
    </div>
  );
}
