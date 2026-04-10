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
            className={`relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              isSelected
                ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            {tierKey === 'better' && (
              <span className="absolute -top-3 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/30">
                POPULAR
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-blue-600' : 'border-slate-200'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                {label}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed pl-8">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}
