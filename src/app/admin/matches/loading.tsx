export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-48 bg-muted/50 rounded-xl" />
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-muted/50 rounded-lg" />)}
      </div>
      {Array.from({length: 5}).map((_, i) => (
        <div key={i} className="h-16 bg-muted/30 rounded-xl" />
      ))}
    </div>
  );
}
