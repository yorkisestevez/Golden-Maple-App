'use client';

import { ServiceEstimate } from '@/lib/types';
import { formatCurrency } from '@/lib/pricing-engine';

interface EstimateBreakdownProps {
  items: ServiceEstimate[];
  currency: string;
}

export function EstimateBreakdown({ items, currency }: EstimateBreakdownProps) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-black text-slate-900 uppercase tracking-widest text-[10px]">
        Service Depth Analysis
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-4 text-slate-400 font-black uppercase tracking-widest text-[9px]">Feature</th>
              <th className="text-right py-4 text-slate-400 font-black uppercase tracking-widest text-[9px]">Scope</th>
              <th className="text-right py-4 text-slate-400 font-black uppercase tracking-widest text-[9px]">Labor</th>
              <th className="text-right py-4 text-slate-400 font-black uppercase tracking-widest text-[9px]">Materials</th>
              <th className="text-right py-4 text-slate-500 font-black uppercase tracking-widest text-[9px]">Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.key} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 text-slate-900 font-bold tracking-tight">{item.label}</td>
                <td className="py-4 text-right text-slate-500 font-medium">
                  {item.qty.toLocaleString()} {item.unit}
                </td>
                <td className="py-4 text-right text-slate-500 font-medium">
                  {formatCurrency(item.laborLow, currency)} – {formatCurrency(item.laborHigh, currency)}
                </td>
                <td className="py-4 text-right text-slate-500 font-medium">
                  {formatCurrency(item.matLow, currency)} – {formatCurrency(item.matHigh, currency)}
                </td>
                <td className="py-4 text-right text-blue-600 font-black tracking-tighter">
                  {formatCurrency(item.totalLow, currency)} – {formatCurrency(item.totalHigh, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
