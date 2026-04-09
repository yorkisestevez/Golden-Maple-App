'use client';

import { Service } from '@/lib/types';
import { FeatureCard } from './FeatureCard';

interface StepFeatureSelectProps {
  services: Service[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
}

export function StepFeatureSelect({ services, selectedKeys, onToggle }: StepFeatureSelectProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-text,#F2EEE7)]" style={{ fontFamily: 'var(--brand-headline-font)' }}>
          What are you dreaming of?
        </h2>
        <p className="mt-2 text-[var(--brand-muted,#A89F91)]">
          Select all the features you&apos;d like in your outdoor space
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {services
          .filter((s) => s.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map((service) => (
            <FeatureCard
              key={service.key}
              serviceKey={service.key}
              label={service.label}
              unit={service.unit}
              selected={selectedKeys.includes(service.key)}
              onToggle={() => onToggle(service.key)}
            />
          ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-[var(--brand-accent,#D4AF63)] font-medium">
          {selectedKeys.length === 0
            ? 'Select at least one feature to continue'
            : `${selectedKeys.length} feature${selectedKeys.length > 1 ? 's' : ''} selected`}
        </p>
      </div>
    </div>
  );
}
