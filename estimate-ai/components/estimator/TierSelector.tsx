'use client';

import { PricingConfig, TierKey } from '@/lib/types';

interface TierSelectorProps {
  config: PricingConfig;
  selected: TierKey;
  onChange: (tier: TierKey) => void;
}

const TIER_KEYS: TierKey[] = ['good', 'better', 'best'];

export function TierSelector({ config, selected, onChange }: TierSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {TIER_KEYS.map((tierKey) => {
        const label = config[`tier_${tierKey}_label` as keyof PricingConfig] as string;
        const desc = config[`tier_${tierKey}_desc` as keyof PricingConfig] as string;
        const isSelected = selected === tierKey;

        return (
          <button
            key={tierKey}
            type="button"
            onClick={() => onChange(tierKey)}
            className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              isSelected
                ? 'border-[var(--brand-accent,#D4AF63)] bg-[var(--brand-accent,#D4AF63)]/10'
                : 'border-white/10 bg-[var(--brand-card,#1A1814)] hover:border-white/20'
            }`}
          >
            {tierKey === 'better' && (
              <span className="absolute -top-3 left-4 px-3 py-0.5 bg-[var(--brand-accent,#D4AF63)] text-[var(--brand-bg,#0F0E0A)] text-xs font-bold rounded-full">
                POPULAR
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[var(--brand-accent,#D4AF63)]' : 'border-white/30'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-accent,#D4AF63)]" />}
              </div>
              <span className={`text-lg font-bold ${isSelected ? 'text-[var(--brand-accent,#D4AF63)]' : 'text-[var(--brand-text,#F2EEE7)]'}`}>
                {label}
              </span>
            </div>
            <p className="text-sm text-[var(--brand-muted,#A89F91)] pl-8">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}
