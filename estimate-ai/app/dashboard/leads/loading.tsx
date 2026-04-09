export default function LeadsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 bg-white/5 rounded" />
        <div className="h-9 w-28 bg-white/5 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-48 bg-white/5 rounded-lg" />
        <div className="h-9 w-32 bg-white/5 rounded-lg" />
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-5">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-12 bg-white/[0.02] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
