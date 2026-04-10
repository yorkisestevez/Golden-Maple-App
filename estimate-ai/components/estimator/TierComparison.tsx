'use client';

import { useState } from 'react';
import { Service, PricingConfig, TierKey, SiteKey } from '@/lib/types';
import { calcCombinedEstimate, formatCurrency } from '@/lib/pricing-engine';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TierComparisonProps {
  services: { service: Service; qty: number }[];
  siteKey: SiteKey;
  config: PricingConfig;
  currentTier: TierKey;
}

const TIERS: TierKey[] = ['good', 'better', 'best'];

export function TierComparison({ services, siteKey, config, currentTier }: TierComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const estimates = TIERS.map((tier) => ({
    tier,
    label: config[`tier_${tier}_label` as keyof PricingConfig] as string,
    desc: config[`tier_${tier}_desc` as keyof PricingConfig] as string,
    estimate: calcCombinedEstimate(services, tier, siteKey, config),
  }));

  return (
    <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Compare Neural Tiers</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pt-0">
          {estimates.map(({ tier, label, desc, estimate }) => (
            <div
              key={tier}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                tier === currentTier
                  ? 'bg-blue-50/50 border-2 border-blue-600 shadow-lg shadow-blue-500/5'
                  : 'bg-slate-50/50 border border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className={`font-black tracking-tight ${tier === currentTier ? 'text-blue-600' : 'text-slate-900'}`}>
                  {label}
                </h4>
                {tier === currentTier && (
                  <span className="text-[8px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 mb-4 leading-relaxed">{desc}</p>
              <p className={`text-2xl font-black tracking-tighter ${tier === currentTier ? 'text-blue-600' : 'text-slate-900'}`}>
                {formatCurrency(estimate.mid, config.currency)}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                {formatCurrency(estimate.totalLow, config.currency)} – {formatCurrency(estimate.totalHigh, config.currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
