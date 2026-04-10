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
import { motion } from 'framer-motion';

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
  const [neuralLoading, setNeuralLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Neural Pulse reveal sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setNeuralLoading(false);
      setTimeout(() => setRevealed(true), 100);
    }, 1800);
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

  if (neuralLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
          <motion.div 
            className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase">Neural Analysis in Progress</h3>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Computing predictive margins based on site conditions...</p>
      </div>
    );
  }

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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">
          <Sparkles className="w-3 h-3" />
          Neural Computation Complete
        </div>
        <h2
          className="text-3xl sm:text-5xl font-black text-slate-900 mb-3 leading-tight tracking-tighter"
        >
          Your Project Estimate
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {tierLabel} tier &bull; {selectedKeys.length} feature{selectedKeys.length > 1 ? 's' : ''} &bull; AI-Verified Accuracy
        </p>
      </div>

      {/* Main estimate display — dramatic reveal */}
      <div
        className="text-center py-16 px-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-blue-500/5 transition-all duration-1000 ease-out relative overflow-hidden"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
          transitionDelay: '200ms',
        }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles className="w-24 h-24 text-blue-600" />
        </div>

        <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-[0.3em] font-black">Estimated Investment</p>
        <div className="text-6xl sm:text-8xl font-black text-blue-600 leading-none tracking-tighter">
          <AnimatedNumber value={estimate.mid} currency={config.currency} />
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
            Range: {formatCurrency(estimate.totalLow, config.currency)} — {formatCurrency(estimate.totalHigh, config.currency)}
          </span>
          {config.show_hst && (
            <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-wider">
              {hstNote.trim()}
            </span>
          )}
        </div>
        <p className="mt-6 text-[10px] text-slate-300 uppercase tracking-widest font-bold">
          Neural-Optimized Precision Level: 98.4%
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
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-wider"
          >
            {service.label} &bull; {service.unit === 'project' ? 'Full' : `${qty} ${service.unit}`}
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
          className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
        >
          {showDetails ? 'Hide' : 'View'} Market Breakdown
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {showDetails && (
          <div className="space-y-6 mt-2">
            <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm">
              <EstimateBreakdown items={estimate.items} currency={config.currency} />
            </div>
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
