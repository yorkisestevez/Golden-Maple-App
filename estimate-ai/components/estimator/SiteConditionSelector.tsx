'use client';

import { SiteKey } from '@/lib/types';

interface SiteConditionSelectorProps {
  selected: SiteKey;
  onChange: (site: SiteKey) => void;
}

const SITE_OPTIONS: { key: SiteKey; label: string; desc: string; icon: string }[] = [
  { key: 'standard', label: 'Standard', desc: 'Flat yard, easy access, no surprises', icon: '✅' },
  { key: 'moderate', label: 'Some Challenges', desc: 'Mild slope, tight access, or minor grading needed', icon: '⚠️' },
  { key: 'complex', label: 'Complex Site', desc: 'Steep slopes, retaining needs, drainage issues, difficult access', icon: '🔶' },
];

export function SiteConditionSelector({ selected, onChange }: SiteConditionSelectorProps) {
  return (
    <div className="space-y-3">
      {SITE_OPTIONS.map((opt) => {
        const isSelected = selected === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              isSelected
                ? 'border-[var(--brand-accent,#D4AF63)] bg-[var(--brand-accent,#D4AF63)]/10'
                : 'border-white/10 bg-[var(--brand-card,#1A1814)] hover:border-white/20'
            }`}
          >
            <span className="text-xl mt-0.5">{opt.icon}</span>
            <div>
              <span className={`font-semibold ${isSelected ? 'text-[var(--brand-accent,#D4AF63)]' : 'text-[var(--brand-text,#F2EEE7)]'}`}>
                {opt.label}
              </span>
              <p className="text-sm text-[var(--brand-muted,#A89F91)] mt-0.5">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
