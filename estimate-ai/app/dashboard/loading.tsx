import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1A1814] rounded-xl p-6 border border-white/10 animate-pulse">
            <div className="h-3 w-20 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#1A1814] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF63]" />
        </div>
      </div>
    </div>
  );
}
