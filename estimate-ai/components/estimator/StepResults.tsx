'use client';

import { useState } from 'react';
import { Service, PricingConfig, TierKey, SiteKey, CombinedEstimate } from '@/lib/types';
import { calcCombinedEstimate, formatCurrency } from '@/lib/pricing-engine';
import { AnimatedNumber } from './AnimatedNumber';
import { EstimateBreakdown } from './EstimateBreakdown';
import { TierComparison } from './TierComparison';
import { AIInsightPanel } from './AIInsightPanel';
import { LeadCaptureForm } from './LeadCaptureForm';

interface StepResultsProps {
  services: Service[];
  selectedKeys: string[];
  quantities: Record<string, number>;
  tier: TierKey;
  site: SiteKey;
  config: PricingConfig;
  contractorId: string;
  aiEnabled: boolean;
  source: 'website' | 'embed' | 'direct';
}

export function StepResults({
  services,
  selectedKeys,
  quantities,
  tier,
  site,
  config,
  contractorId,
  aiEnabled,
  source,
}: StepResultsProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const selectedServices = services
    .filter((s) => selectedKeys.includes(s.key))
    .map((service) => ({
      service,
      qty: quantities[service.key] ?? service.default_qty,
    }));

  const estimate: CombinedEstimate = calcCombinedEstimate(selectedServices, tier, site, config);

  const tierLabel = config[`tier_${tier}_label` as keyof PricingConfig] as string;
  const hstNote = config.show_hst ? ` + ${(config.hst_rate * 100).toFixed(0)}% HST` : '';

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractorId,
          features: selectedServices.map(({ service, qty }) => ({
            label: service.label,
            qty,
            unit: service.unit,
          })),
          tier: {
            label: tierLabel,
            desc: config[`tier_${tier}_desc` as keyof PricingConfig] as string,
          },
          site: {
            label: site === 'standard' ? 'Standard' : site === 'moderate' ? 'Some Challenges' : 'Complex',
          },
          estimate: { low: estimate.totalLow, high: estimate.totalHigh },
          currency: config.currency,
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight || null);
    } catch {
      setAiInsight('Unable to generate insight at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const estimateData = {
    selected_features: selectedServices.map(({ service, qty }) => ({
      key: service.key,
      label: service.label,
      qty,
      unit: service.unit,
    })),
    tier,
    site_condition: site,
    estimate_low: estimate.totalLow,
    estimate_high: estimate.totalHigh,
    estimate_mid: estimate.mid,
    breakdown: estimate.items,
    ai_insight: aiInsight,
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold text-[var(--brand-text,#F2EEE7)] mb-2"
          style={{ fontFamily: 'var(--brand-headline-font)' }}
        >
          Your Estimate
        </h2>
        <p className="text-[var(--brand-muted,#A89F91)] text-sm">
          {tierLabel} tier • {selectedKeys.length} feature{selectedKeys.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Main estimate display */}
      <div className="text-center py-8 px-4 rounded-2xl bg-gradient-to-br from-[var(--brand-accent,#D4AF63)]/10 to-transparent border border-[var(--brand-accent,#D4AF63)]/20">
        <div className="text-5xl sm:text-6xl font-bold text-[var(--brand-accent,#D4AF63)]">
          <AnimatedNumber value={estimate.mid} currency={config.currency} />
        </div>
        <p className="mt-3 text-lg text-[var(--brand-muted,#A89F91)]">
          {formatCurrency(estimate.totalLow, config.currency)} — {formatCurrency(estimate.totalHigh, config.currency)}
          {hstNote}
        </p>
        <p className="mt-1 text-xs text-[var(--brand-muted,#A89F91)]/60">
          This is an estimate only. Final pricing determined after site consultation.
        </p>
      </div>

      {/* Breakdown */}
      <EstimateBreakdown items={estimate.items} currency={config.currency} />

      {/* Tier comparison */}
      <TierComparison
        services={selectedServices}
        siteKey={site}
        config={config}
        currentTier={tier}
      />

      {/* AI Insight */}
      <AIInsightPanel
        enabled={aiEnabled}
        insight={aiInsight}
        loading={aiLoading}
        onGenerate={handleGenerateInsight}
      />

      {/* Lead capture */}
      <LeadCaptureForm
        contractorId={contractorId}
        estimateData={estimateData}
        source={source}
      />
    </div>
  );
}
