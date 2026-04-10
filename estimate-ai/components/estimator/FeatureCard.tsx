'use client';

import { Check, Layout, BrickWall, Layers, Car, Footprints, ChefHat, Flame, Tent, Lightbulb, Sprout, LayoutGrid } from 'lucide-react';

const FEATURE_ICONS: Record<string, any> = {
  patio: LayoutGrid,
  retaining_wall: BrickWall,
  steps: Layers,
  driveway: Car,
  walkway: Footprints,
  outdoor_kitchen: ChefHat,
  firepit: Flame,
  pergola: Tent,
  lighting: Lightbulb,
  garden_bed: Sprout,
};

interface FeatureCardProps {
  serviceKey: string;
  label: string;
  unit: string;
  selected: boolean;
  onToggle: () => void;
}

export function FeatureCard({ serviceKey, label, unit, selected, onToggle }: FeatureCardProps) {
  const Icon = FEATURE_ICONS[serviceKey] || Layout;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center gap-3 p-5 sm:p-7 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-center min-h-[140px] group ${
        selected
          ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/5 scale-[1.02]'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 ${
        selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-400 border border-slate-100'
      }`}>
        <Icon className={`w-7 h-7 ${selected ? 'text-white' : 'group-hover:text-blue-600'}`} />
      </div>

      <div className="flex flex-col gap-1">
        <span className={`font-bold text-sm sm:text-base tracking-tight ${selected ? 'text-blue-600' : 'text-slate-900'}`}>
          {label}
        </span>
        <span className={`text-[10px] uppercase font-black tracking-widest ${selected ? 'text-blue-600/40' : 'text-slate-400'}`}>
          {unit === 'project' ? 'Fixed scope' : `Per ${unit}`}
        </span>
      </div>
    </button>
  );
}
