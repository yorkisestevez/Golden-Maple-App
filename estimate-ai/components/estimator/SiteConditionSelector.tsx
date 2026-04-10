import { SiteKey } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Construction } from 'lucide-react';

interface SiteConditionSelectorProps {
  selected: SiteKey;
  onChange: (site: SiteKey) => void;
}

const SITE_OPTIONS: { key: SiteKey; label: string; desc: string; Icon: any }[] = [
  { key: 'standard', label: 'Standard Access', desc: 'Flat yard, clear pathways, minimal prep required.', Icon: CheckCircle2 },
  { key: 'moderate', label: 'Moderate Challenges', desc: 'Slight gradients or narrow equipment access points.', Icon: AlertTriangle },
  { key: 'complex', label: 'Complex Infrastructure', desc: 'Significant slopes, drainage issues, or structural needs.', Icon: Construction },
];

export function SiteConditionSelector({ selected, onChange }: SiteConditionSelectorProps) {
  return (
    <div className="space-y-4">
      {SITE_OPTIONS.map((opt) => {
        const isSelected = selected === opt.key;
        const { Icon } = opt;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`w-full flex items-start gap-5 p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              isSelected
                ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-base font-black tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                {opt.label}
              </span>
              <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
