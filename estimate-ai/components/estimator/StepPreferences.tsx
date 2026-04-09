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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-text,#F2EEE7)]" style={{ fontFamily: 'var(--brand-headline-font)' }}>
          Your preferences
        </h2>
        <p className="mt-2 text-[var(--brand-muted,#A89F91)]">
          Choose your quality tier and describe your site conditions
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--brand-text,#F2EEE7)]">
          Quality Tier
        </h3>
        <TierSelector config={config} selected={tier} onChange={onTierChange} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--brand-text,#F2EEE7)]">
          Site Conditions
        </h3>
        <SiteConditionSelector selected={site} onChange={onSiteChange} />
      </div>
    </div>
  );
}
