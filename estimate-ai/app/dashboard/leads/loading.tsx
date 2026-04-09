import { Loader2 } from 'lucide-react';

export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-[#1A1814] rounded-xl border border-white/10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF63]" />
        </div>
      </div>
    </div>
  );
}
