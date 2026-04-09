'use client';

import { useState, useEffect } from 'react';
import { Service, PricingConfig, TierKey, SiteKey, CombinedEstimate } from '@/lib/types';
import { calcCombinedEstimate, formatCurrency } from '@/lib/pricing-engine';
import { AnimatedNumber } from './AnimatedNumber';
import { EstimateBreakdown } from './EstimateBreakdown';
import { TierComparison } from './TierComparison';
import { AIInsightPanel } from './AIInsightPanel';
import { LeadCaptureForm } from './LeadCaptureForm';
import { Sparkles, ChevronDown } from 'lucide-react';

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
  const [revealed, setRevealed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Staggered reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Header with celebration */}
      <div
        className="text-center transition-all duration-700 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-accent,#D4AF63)]/10 border border-[var(--brand-accent,#D4AF63)]/20 rounded-full text-xs text-[var(--brand-accent,#D4AF63)] mb-3">
          <Sparkles className="w-3 h-3" />
          Estimate Ready
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-[var(--brand-text,#F2EEE7)] mb-2"
          style={{ fontFamily: 'var(--brand-headline-font)' }}
        >
          Your Project Estimate
        </h2>
        <p className="text-[var(--brand-muted,#A89F91)] text-sm">
          {tierLabel} tier &bull; {selectedKeys.length} feature{selectedKeys.length > 1 ? 's' : ''} &bull; Based on your specifications
        </p>
      </div>

      {/* Main estimate display — dramatic reveal */}
      <div
        className="text-center py-10 px-6 rounded-2xl bg-gradient-to-br from-[var(--brand-accent,#D4AF63)]/15 via-[var(--brand-accent,#D4AF63)]/5 to-transparent border border-[var(--brand-accent,#D4AF63)]/20 shadow-xl shadow-[var(--brand-accent,#D4AF63)]/5 transition-all duration-1000 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
          transitionDelay: '200ms',
        }}
      >
        <p className="text-sm text-[var(--brand-muted,#A89F91)] mb-2 uppercase tracking-wider font-medium">Estimated Investment</p>
        <div className="text-5xl sm:text-7xl font-bold text-[var(--brand-accent,#D4AF63)] leading-none">
          <AnimatedNumber value={estimate.mid} currency={config.currency} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-[var(--brand-muted,#A89F91)]">
            {formatCurrency(estimate.totalLow, config.currency)} — {formatCurrency(estimate.totalHigh, config.currency)}
          </span>
          {config.show_hst && (
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-[var(--brand-muted,#A89F91)]">
              {hstNote.trim()}
            </span>
          )}
        </div>
        <p className="mt-4 text-xs text-[var(--brand-muted,#A89F91)]/60">
          This is a preliminary estimate. Final pricing confirmed after a free site consultation.
        </p>
      </div>

      {/* Quick summary chips */}
      <div
        className="flex flex-wrap gap-2 justify-center transition-all duration-500 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(15px)',
          transitionDelay: '400ms',
        }}
      >
        {selectedServices.map(({ service, qty }) => (
          <span
            key={service.key}
            className="px-3 py-1.5 bg-[var(--brand-card,#1A1814)] border border-white/10 rounded-full text-xs text-[var(--brand-text,#F2EEE7)]"
          >
            {service.label} &bull; {service.unit === 'project' ? 'Full scope' : `${qty} ${service.unit}`}
          </span>
        ))}
      </div>

      {/* Expandable details */}
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transitionDelay: '500ms',
        }}
      >
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[var(--brand-muted,#A89F91)] hover:text-[var(--brand-text,#F2EEE7)] transition-colors"
        >
          {showDetails ? 'Hide' : 'View'} Detailed Breakdown
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {showDetails && (
          <div className="space-y-6 mt-2">
            <EstimateBreakdown items={estimate.items} currency={config.currency} />
            <TierComparison
              services={selectedServices}
              siteKey={site}
              config={config}
              currentTier={tier}
            />
          </div>
        )}
      </div>

      {/* AI Insight */}
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transitionDelay: '600ms',
        }}
      >
        <AIInsightPanel
          enabled={aiEnabled}
          insight={aiInsight}
          loading={aiLoading}
          onGenerate={handleGenerateInsight}
        />
      </div>

      {/* Lead capture — with urgency */}
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transitionDelay: '700ms',
        }}
      >
        <LeadCaptureForm
          contractorId={contractorId}
          estimateData={estimateData}
          source={source}
        />
      </div>
    </div>
  );
}
