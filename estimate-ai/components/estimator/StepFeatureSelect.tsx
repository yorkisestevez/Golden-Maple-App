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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
          What are we building?
        </h2>
        <p className="mt-2 text-slate-500 font-medium uppercase tracking-widest text-[10px]">
          Neural Feature Selection &bull; Precision Mapping
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          selectedKeys.length === 0
            ? 'bg-slate-100 text-slate-400'
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {selectedKeys.length === 0
            ? 'Select at least one feature to continue'
            : `${selectedKeys.length} feature${selectedKeys.length > 1 ? 's' : ''} engaged`}
        </div>
      </div>
    </div>
  );
}
