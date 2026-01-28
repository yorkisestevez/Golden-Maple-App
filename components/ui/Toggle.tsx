
import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-2 group cursor-pointer" onClick={() => onChange(!enabled)}>
      <div className="flex-1 pr-4">
        {label && <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</p>}
        {description && <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{description}</p>}
      </div>
      <button 
        type="button"
        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'} shadow-sm`}></div>
      </button>
    </div>
  );
};

export default Toggle;
