'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Service, PricingConfig, Contractor, TierKey, SiteKey } from '@/lib/types';
import { StepFeatureSelect } from './StepFeatureSelect';
import { StepDimensions } from './StepDimensions';
import { StepPreferences } from './StepPreferences';
import { StepResults } from './StepResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface EstimatorShellProps {
  contractor: Contractor;
  services: Service[];
  config: PricingConfig;
  source?: 'website' | 'embed' | 'direct';
}

const STEP_LABELS = ['Features', 'Dimensions', 'Preferences', 'Estimate'];

export function EstimatorShell({ contractor, services, config, source = 'website' }: EstimatorShellProps) {
  const [step, setStep] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [tier, setTier] = useState<TierKey>('better');
  const [site, setSite] = useState<SiteKey>('standard');
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const stepRef = useRef<HTMLDivElement>(null);

  const animateStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? 'forward' : 'back');
    setTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setTransitioning(false);
      stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [step]);

  // Initialize quantities for newly selected services
  const handleToggle = (key: string) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      // Initialize quantity if not set
      const service = services.find((s) => s.key === key);
      if (service && !(key in quantities)) {
        setQuantities((q) => ({ ...q, [key]: service.default_qty }));
      }
      return [...prev, key];
    });
  };

  const handleQuantityChange = (key: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  const canProceed = useMemo(() => {
    if (step === 0) return selectedKeys.length > 0;
    return true;
  }, [step, selectedKeys]);

  const next = () => {
    if (canProceed && step < 3) animateStep(step + 1);
  };

  const prev = () => {
    if (step > 0) animateStep(step - 1);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ['--brand-bg' as string]: contractor.background_color || '#F9FAFB',
        ['--brand-card' as string]: contractor.card_color || '#FFFFFF',
        ['--brand-text' as string]: contractor.text_color || '#111827',
        ['--brand-accent' as string]: contractor.primary_color || '#2563EB',
        ['--brand-secondary' as string]: contractor.secondary_color || '#059669',
        ['--brand-muted' as string]: '#64748B',
        ['--brand-headline-font' as string]: contractor.headline_font,
        ['--brand-body-font' as string]: contractor.body_font,
        backgroundColor: 'var(--brand-bg)',
        color: 'var(--brand-text)',
        fontFamily: `var(--brand-body-font), sans-serif`,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 relative">
        {/* Home Button */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-4 z-20">
          <Link 
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all group shadow-sm"
            title="Return to Home"
          >
            <Home className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          {contractor.logo_url && (
            <img
              src={contractor.logo_url}
              alt={contractor.company_name}
              className="h-12 sm:h-16 mx-auto mb-4 object-contain"
            />
          )}
          {!contractor.logo_url && (
            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              {contractor.company_name}
            </h1>
          )}
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest text-[10px] mt-2">Neural Pricing Engine</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`text-[10px] uppercase font-black tracking-widest transition-colors ${
                  i <= step
                    ? 'text-blue-600'
                    : 'text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div
          ref={stepRef}
          className="min-h-[400px] transition-all duration-200 ease-out"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning
              ? `translateX(${direction === 'forward' ? '30px' : '-30px'})`
              : 'translateX(0)',
          }}
        >
          {step === 0 && (
            <StepFeatureSelect
              services={services}
              selectedKeys={selectedKeys}
              onToggle={handleToggle}
            />
          )}
          {step === 1 && (
            <StepDimensions
              services={services}
              selectedKeys={selectedKeys}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
            />
          )}
          {step === 2 && (
            <StepPreferences
              config={config}
              tier={tier}
              site={site}
              onTierChange={setTier}
              onSiteChange={setSite}
            />
          )}
          {step === 3 && (
            <StepResults
              services={services}
              selectedKeys={selectedKeys}
              quantities={quantities}
              tier={tier}
              site={site}
              config={config}
              contractorId={contractor.id}
              aiEnabled={contractor.ai_insights_enabled}
              source={source}
            />
          )}
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className={`text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all ${step === 0 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Recall
            </Button>

            <Button 
              onClick={next} 
              disabled={!canProceed} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:shadow-none transition-all"
            >
              {step === 2 ? 'Initialize Computation' : 'Proceed'}
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={() => animateStep(0)} 
              className="mx-auto flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 rounded-full px-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Reset Engine
            </Button>
          </div>
        )}

        {/* Powered by */}
        {contractor.plan !== 'agency' && (
          <div className="text-center mt-12 pt-8">
            <a
              href="https://estimateai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-blue-600 transition-colors"
            >
              Propelled by <span className="text-slate-400">EstimateAI Neural</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
