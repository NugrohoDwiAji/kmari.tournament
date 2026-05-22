export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse pt-4">
      <div className="text-center space-y-3">
        <div className="h-6 w-32 bg-muted/50 rounded-full mx-auto" />
        <div className="h-10 w-64 bg-muted/50 rounded-xl mx-auto" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-48 bg-muted/30 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
