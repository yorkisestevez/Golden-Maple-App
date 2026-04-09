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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-text,#F2EEE7)]" style={{ fontFamily: 'var(--brand-headline-font)' }}>
          How big is your vision?
        </h2>
        <p className="mt-2 text-[var(--brand-muted,#A89F91)]">
          Adjust the approximate size for each feature
        </p>
      </div>

      <div className="space-y-4">
        {selectedServices.map((service) => (
          <Card key={service.key} variant="bordered" className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--brand-text,#F2EEE7)]">
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
                label={`Approximate ${service.unit}`}
              />
            ) : (
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--brand-accent,#D4AF63)]/10 flex items-center justify-center">
                  <span className="text-[var(--brand-accent,#D4AF63)] text-lg">✓</span>
                </div>
                <p className="text-[var(--brand-muted,#A89F91)]">
                  Scope determined during consultation — included in estimate
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
