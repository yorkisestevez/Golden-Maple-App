'use client';

import { Check } from 'lucide-react';

const FEATURE_ICONS: Record<string, string> = {
  patio: '🏡',
  retaining_wall: '🧱',
  steps: '🪜',
  driveway: '🚗',
  walkway: '🚶',
  outdoor_kitchen: '🍳',
  firepit: '🔥',
  pergola: '⛱️',
  lighting: '💡',
  garden_bed: '🌿',
};

interface FeatureCardProps {
  serviceKey: string;
  label: string;
  unit: string;
  selected: boolean;
  onToggle: () => void;
}

export function FeatureCard({ serviceKey, label, unit, selected, onToggle }: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center min-h-[120px] ${
        selected
          ? 'border-[var(--brand-accent,#D4AF63)] bg-[var(--brand-accent,#D4AF63)]/10 shadow-lg shadow-[var(--brand-accent,#D4AF63)]/10'
          : 'border-white/10 bg-[var(--brand-card,#1A1814)] hover:border-white/20 hover:bg-white/5'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--brand-accent,#D4AF63)] flex items-center justify-center">
          <Check className="w-4 h-4 text-[var(--brand-bg,#0F0E0A)]" />
        </div>
      )}
      <span className="text-3xl">{FEATURE_ICONS[serviceKey] || '🏗️'}</span>
      <span className={`font-medium text-sm sm:text-base ${selected ? 'text-[var(--brand-accent,#D4AF63)]' : 'text-[var(--brand-text,#F2EEE7)]'}`}>
        {label}
      </span>
      <span className="text-xs text-[var(--brand-muted,#A89F91)]">
        {unit === 'project' ? 'Fixed scope' : `Per ${unit}`}
      </span>
    </button>
  );
}
