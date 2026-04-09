'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Service, PricingConfig, Contractor, TierKey, SiteKey } from '@/lib/types';
import { StepFeatureSelect } from './StepFeatureSelect';
import { StepDimensions } from './StepDimensions';
import { StepPreferences } from './StepPreferences';
import { StepResults } from './StepResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
        ['--brand-bg' as string]: contractor.background_color,
        ['--brand-card' as string]: contractor.card_color,
        ['--brand-text' as string]: contractor.text_color,
        ['--brand-accent' as string]: contractor.primary_color,
        ['--brand-secondary' as string]: contractor.secondary_color,
        ['--brand-muted' as string]: '#A89F91',
        ['--brand-headline-font' as string]: contractor.headline_font,
        ['--brand-body-font' as string]: contractor.body_font,
        backgroundColor: 'var(--brand-bg)',
        color: 'var(--brand-text)',
        fontFamily: `var(--brand-body-font), sans-serif`,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
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
              className="text-2xl sm:text-3xl font-bold text-[var(--brand-accent)]"
              style={{ fontFamily: 'var(--brand-headline-font)' }}
            >
              {contractor.company_name}
            </h1>
          )}
          <p className="text-sm text-[var(--brand-muted)] mt-1">Instant Project Estimator</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (i < step || (i <= step && canProceed)) animateStep(i);
                }}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  i <= step
                    ? 'text-[var(--brand-accent)]'
                    : 'text-[var(--brand-muted)]/50'
                } ${i < step ? 'cursor-pointer hover:underline' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-accent)] rounded-full transition-all duration-500 ease-out"
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className={step === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button onClick={next} disabled={!canProceed} size="lg">
              {step === 2 ? 'See My Estimate' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <Button variant="ghost" onClick={() => animateStep(0)} className="mx-auto block">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        {/* Powered by */}
        {contractor.plan !== 'agency' && (
          <div className="text-center mt-8 pt-4">
            <a
              href="https://estimateai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--brand-muted)]/40 hover:text-[var(--brand-muted)]/60 transition-colors"
            >
              Powered by <span className="font-semibold">EstimateAI</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
