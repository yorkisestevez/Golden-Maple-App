'use client';

import { ServiceEstimate } from '@/lib/types';
import { formatCurrency } from '@/lib/pricing-engine';

interface EstimateBreakdownProps {
  items: ServiceEstimate[];
  currency: string;
}

export function EstimateBreakdown({ items, currency }: EstimateBreakdownProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[var(--brand-text,#F2EEE7)]">
        Estimate Breakdown
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 text-[var(--brand-muted,#A89F91)] font-medium">Feature</th>
              <th className="text-right py-3 text-[var(--brand-muted,#A89F91)] font-medium">Size</th>
              <th className="text-right py-3 text-[var(--brand-muted,#A89F91)] font-medium">Labor</th>
              <th className="text-right py-3 text-[var(--brand-muted,#A89F91)] font-medium">Materials</th>
              <th className="text-right py-3 text-[var(--brand-muted,#A89F91)] font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key} className="border-b border-white/5">
                <td className="py-3 text-[var(--brand-text,#F2EEE7)]">{item.label}</td>
                <td className="py-3 text-right text-[var(--brand-muted,#A89F91)]">
                  {item.qty.toLocaleString()} {item.unit}
                </td>
                <td className="py-3 text-right text-[var(--brand-muted,#A89F91)]">
                  {formatCurrency(item.laborLow, currency)} – {formatCurrency(item.laborHigh, currency)}
                </td>
                <td className="py-3 text-right text-[var(--brand-muted,#A89F91)]">
                  {formatCurrency(item.matLow, currency)} – {formatCurrency(item.matHigh, currency)}
                </td>
                <td className="py-3 text-right text-[var(--brand-text,#F2EEE7)] font-medium">
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
