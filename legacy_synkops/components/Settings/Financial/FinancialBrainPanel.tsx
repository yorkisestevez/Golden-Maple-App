
import React, { useState, useMemo } from 'react';
import { SynkOpsSettingsV1, FinancialBrain } from '../../../types';
import { ICONS } from '../../../constants';
import { getSettings, saveSettings, computeFinancials } from '../../../lib/settings';
import Input from '../../ui/Input';
import FormRow from '../../ui/FormRow';

const FinancialBrainPanel: React.FC = () => {
  const [settings, setSettings] = useState<SynkOpsSettingsV1>(getSettings());
  const brain = settings.financialBrain;

  const updateBrain = (patch: Partial<FinancialBrain>) => {
    setSettings(prev => ({
      ...prev,
      financialBrain: { ...prev.financialBrain, ...patch }
    }));
  };

  const handleCalculate = () => {
    const computed = computeFinancials(settings.financialBrain);
    updateBrain(computed);
  };

  const handleSave = () => {
    const computed = computeFinancials(settings.financialBrain);
    saveSettings({ ...settings, financialBrain: computed });
    alert("Financial Brain Saved & Logic Synchronized.");
  };

  const handleReset = () => {
    if (window.confirm("Restore factory default financial rules? Current logic will be overwritten.")) {
      // Re-initialize locally
      const s = getSettings();
      setSettings(s);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER: Computed Terminal */}
      <section className="bg-slate-900 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">Financial Command</h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Core Estimating Logic Engine</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={handleReset} className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-2xl transition-all" title="Reset to Defaults">
                     <ICONS.RefreshCcw size={18} />
                  </button>
                  <button onClick={handleCalculate} className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all shadow-xl active:scale-95">
                     Calculate
                  </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">Computed Overhead / hr</label>
                  <div className="flex items-baseline gap-3">
                     <p className="text-6xl font-black text-emerald-400 tracking-tighter">${brain.computed.computedOverheadPerBillableHour.toFixed(2)}</p>
                     <span className="text-sm font-bold opacity-30 uppercase tracking-widest">{brain.currency}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">Labor Cost Multiplier</label>
                  <div className="flex items-baseline gap-3">
                     <p className="text-6xl font-black text-blue-400 tracking-tighter">{brain.computed.recommendedLaborCostMultiplier.toFixed(2)}x</p>
                     <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded tracking-tighter">RECOMMENDED</span>
                  </div>
               </div>
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Logic sync'd at {new Date(brain.computed.lastComputedAtISO).toLocaleTimeString()}</span>
               </div>
               <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Trade-Only Pricing Model Active</p>
            </div>
         </div>
         <ICONS.TrendingUp className="absolute -bottom-10 -right-10 opacity-5 scale-150 transition-transform duration-1000 group-hover:rotate-6" size={240} />
      </section>

      {/* INPUTS: Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Overhead & Labor */}
         <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
            <div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] mb-8 border-b pb-4">Standard Overhead</h3>
               <div className="space-y-6">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
                     {['monthly_overhead', 'overhead_per_billable_hour'].map(m => (
                        <button key={m} onClick={() => updateBrain({ overhead: { ...brain.overhead, mode: m as any }})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${brain.overhead.mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                           {m.replace(/_/g, ' ')}
                        </button>
                     ))}
                  </div>
                  
                  {brain.overhead.mode === 'monthly_overhead' ? (
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Monthly Spend ($)" type="number" value={brain.overhead.monthlyOverhead || 0} onChange={e => updateBrain({ overhead: { ...brain.overhead, monthlyOverhead: Number(e.target.value) }})} />
                        <Input label="Billable Hrs / Mo" type="number" value={brain.overhead.billableHoursPerMonth || 0} onChange={e => updateBrain({ overhead: { ...brain.overhead, billableHoursPerMonth: Number(e.target.value) }})} />
                     </div>
                  ) : (
                     <Input label="Target Rate / hr ($)" type="number" value={brain.overhead.overheadPerBillableHour || 0} onChange={e => updateBrain({ overhead: { ...brain.overhead, overheadPerBillableHour: Number(e.target.value) }})} />
                  )}
               </div>
            </div>

            <div className="pt-4">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] mb-8 border-b pb-4">Labor Dynamics</h3>
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Payroll Burden (%)" type="number" value={brain.labor.laborBurdenPercent} onChange={e => updateBrain({ labor: { ...brain.labor, laborBurdenPercent: Number(e.target.value) }})} />
                  <Input label="Efficiency Target (%)" type="number" value={brain.labor.defaultCrewEfficiencyPercent} onChange={e => updateBrain({ labor: { ...brain.labor, defaultCrewEfficiencyPercent: Number(e.target.value) }})} />
               </div>
            </div>
         </section>

         {/* Pricing & Strategy */}
         <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
            <div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] mb-8 border-b pb-4">Markup Strategy</h3>
               <div className="space-y-6">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
                     {['target_margin', 'markup'].map(m => (
                        <button key={m} onClick={() => updateBrain({ pricingRules: { ...brain.pricingRules, markupMode: m as any }})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${brain.pricingRules.markupMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                           {m.replace(/_/g, ' ')}
                        </button>
                     ))}
                  </div>

                  {brain.pricingRules.markupMode === 'target_margin' ? (
                     <Input label="Target Gross Margin (%)" type="number" value={brain.pricingRules.targetMarginPercent || 0} onChange={e => updateBrain({ pricingRules: { ...brain.pricingRules, targetMarginPercent: Number(e.target.value) }})} />
                  ) : (
                     <Input label="Standard Markup (%)" type="number" value={brain.pricingRules.markupPercent || 0} onChange={e => updateBrain({ pricingRules: { ...brain.pricingRules, markupPercent: Number(e.target.value) }})} />
                  )}
               </div>
            </div>

            <div className="pt-4">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] mb-8 border-b pb-4">Project Safeguards</h3>
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Min. Job Price ($)" type="number" value={brain.pricingRules.minimumJobPrice || 0} onChange={e => updateBrain({ pricingRules: { ...brain.pricingRules, minimumJobPrice: Number(e.target.value) }})} />
                  <Input label="Contingency (%)" type="number" value={brain.pricingRules.contingencyPercent || 0} onChange={e => updateBrain({ pricingRules: { ...brain.pricingRules, contingencyPercent: Number(e.target.value) }})} />
               </div>
            </div>
         </section>
      </div>

      {/* Global & Taxes */}
      <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FormRow label="Regional Settings" description="Standard for accounting.">
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Currency" value={brain.currency} onChange={e => updateBrain({ currency: e.target.value as any })} />
                  <Input label="Sales Tax (%)" type="number" value={brain.tax.ratePercent} onChange={e => updateBrain({ tax: { ...brain.tax, ratePercent: Number(e.target.value) }})} />
               </div>
            </FormRow>
            <FormRow label="Output Rounding" description="How clients see prices.">
               <select 
                  value={brain.rounding.totalRounding}
                  onChange={e => updateBrain({ rounding: { ...brain.rounding, totalRounding: e.target.value as any }})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs uppercase"
               >
                  <option value="none">No Rounding</option>
                  <option value="nearest_1">Nearest 1.00</option>
                  <option value="nearest_5">Nearest 5.00</option>
                  <option value="nearest_10">Nearest 10.00</option>
               </select>
            </FormRow>
         </div>
      </section>

      <footer className="sticky bottom-10 z-30 flex justify-center">
         <button 
           onClick={handleSave}
           className="px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
         >
           Push Rules To Estimating Engine
         </button>
      </footer>
    </div>
  );
};

export default FinancialBrainPanel;
