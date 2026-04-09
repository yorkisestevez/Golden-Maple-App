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
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-[var(--brand-text,#F2EEE7)]">Compare All Tiers</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--brand-muted,#A89F91)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--brand-muted,#A89F91)]" />
        )}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-t border-white/10">
          {estimates.map(({ tier, label, desc, estimate }) => (
            <div
              key={tier}
              className={`p-4 rounded-xl ${
                tier === currentTier
                  ? 'bg-[var(--brand-accent,#D4AF63)]/10 border-2 border-[var(--brand-accent,#D4AF63)]'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold ${tier === currentTier ? 'text-[var(--brand-accent,#D4AF63)]' : 'text-[var(--brand-text,#F2EEE7)]'}`}>
                  {label}
                </h4>
                {tier === currentTier && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--brand-accent,#D4AF63)] text-[var(--brand-bg,#0F0E0A)] rounded-full font-bold">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--brand-muted,#A89F91)] mb-3">{desc}</p>
              <p className="text-xl font-bold text-[var(--brand-text,#F2EEE7)]">
                {formatCurrency(estimate.mid, config.currency)}
              </p>
              <p className="text-xs text-[var(--brand-muted,#A89F91)]">
                {formatCurrency(estimate.totalLow, config.currency)} – {formatCurrency(estimate.totalHigh, config.currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
