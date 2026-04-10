
import React, { useState, useEffect } from 'react';
import { ProductionRate, User } from '../../../types';
import { ICONS } from '../../../constants';
import { listProductionRates, saveRate } from '../../../lib/production/rates';
import Input from '../../ui/Input';

const ProductionRatesManager: React.FC<{ user: User }> = ({ user }) => {
  const [rates, setRates] = useState<ProductionRate[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    setRates(listProductionRates());
  }, []);

  const handleSave = (rate: ProductionRate) => {
    saveRate(rate);
    setRates(listProductionRates());
    setIsEditing(null);
  };

  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Production Library</h2>
          <p className="text-sm font-medium text-slate-400">Standardized task output per billable hour.</p>
        </div>
        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">+ New Task</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rates.map(rate => (
          <div key={rate.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors shadow-sm">
                   <ICONS.Layers size={28}/>
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{rate.taskName}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rate.category}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{rate.baseUnitsPerHour} {rate.unit} / HR</span>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Restricted Multiplier</p>
                   <p className="text-sm font-black text-slate-900">{rate.complexityMultipliers.restricted}x</p>
                </div>
                <button onClick={() => setIsEditing(rate.id)} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-500">
                   <ICONS.FileEdit size={18}/>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionRatesManager;
