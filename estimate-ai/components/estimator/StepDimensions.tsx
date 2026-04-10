'use client';

import { Service } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface StepDimensionsProps {
  services: Service[];
  selectedKeys: string[];
  quantities: Record<string, number>;
  onQuantityChange: (key: string, qty: number) => void;
}

export function StepDimensions({ services, selectedKeys, quantities, onQuantityChange }: StepDimensionsProps) {
  const selectedServices = services
    .filter((s) => selectedKeys.includes(s.key))
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
          Define Your Scope
        </h2>
        <p className="mt-2 text-slate-500 font-medium uppercase tracking-widest text-[10px]">
          Neural Margin Scaling &bull; Exacting Precision
        </p>
      </div>

      <div className="space-y-4">
        {selectedServices.map((service) => (
          <div key={service.key} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-blue-500/5 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {service.label}
            </h3>
            {service.is_slider ? (
              <Slider
                min={service.slider_min}
                max={service.slider_max}
                step={service.slider_step}
                value={quantities[service.key] ?? service.default_qty}
                onChange={(val) => onQuantityChange(service.key, val)}
                unit={service.unit}
                label={`Computational ${service.unit}`}
              />
            ) : (
              <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <span className="text-white text-xl">✓</span>
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Scope determined during consultation — using historical averages for baseline computation.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
