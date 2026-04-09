export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
            <div className="h-3 w-20 bg-white/5 rounded mb-3" />
            <div className="h-7 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-5">
        <div className="h-4 w-32 bg-white/5 rounded mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-white/[0.02] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
