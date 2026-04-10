'use client';

import { PricingConfig, TierKey, SiteKey } from '@/lib/types';
import { TierSelector } from './TierSelector';
import { SiteConditionSelector } from './SiteConditionSelector';

interface StepPreferencesProps {
  config: PricingConfig;
  tier: TierKey;
  site: SiteKey;
  onTierChange: (tier: TierKey) => void;
  onSiteChange: (site: SiteKey) => void;
}

export function StepPreferences({ config, tier, site, onTierChange, onSiteChange }: StepPreferencesProps) {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
          Calibrate Environment
        </h2>
        <p className="mt-2 text-slate-500 font-medium uppercase tracking-widest text-[10px]">
          Material Grading &bull; Locational Logistics
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-widest text-[10px]">
          Computational Tier
        </h3>
        <TierSelector config={config} selected={tier} onChange={onTierChange} />
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-widest text-[10px]">
          Topographical Variance
        </h3>
        <SiteConditionSelector selected={site} onChange={onSiteChange} />
      </div>
    </div>
  );
}
