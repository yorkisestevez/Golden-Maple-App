
import React, { useState, useMemo } from 'react';
import { User, BusinessProfile, FinancialRules, EstimatingSettings } from '../../../types';
import { ICONS } from '../../../constants';
import { getActiveProfile, updateSettings } from '../../../lib/settings';
import { computeOverheadRate } from '../../../lib/estimating/financialRules';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Toggle from '../../ui/Toggle';
import FormRow from '../../ui/FormRow';

const TABS = [
  { id: 'tax', label: 'Taxes & Currency', icon: <ICONS.Receipt size={14} /> },
  { id: 'payments', label: 'Payment Terms', icon: <ICONS.Receipt size={14} /> },
  { id: 'overhead', label: 'Overhead', icon: <ICONS.TrendingUp size={14} /> },
  { id: 'labor', label: 'Labor Costing', icon: <ICONS.HardHat size={14} /> },
  { id: 'items', label: 'Pricing Rules', icon: <ICONS.Layers size={14} /> },
  { id: 'profit', label: 'Profit Targets', icon: <ICONS.ShieldCheck size={14} /> },
  { id: 'rounding', label: 'Rounding', icon: <ICONS.Clock size={14} /> },
];

const FinancialRulesModule: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('tax');
  const [profile, setProfile] = useState<BusinessProfile>(getActiveProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdate = (updates: any) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    updateSettings(profile, user, 'Financial Rules');
    setHasChanges(false);
    setTimeout(() => setIsSaving(false), 500);
  };

  const overheadRate = useMemo(() => computeOverheadRate(profile.estimating.overhead), [profile.estimating.overhead]);
  
  const avgLoadedRate = useMemo(() => {
    const emps = profile.permissions.employees.filter(e => e.status === 'active');
    if (emps.length === 0) return 0;
    return emps.reduce((acc, e) => acc + e.loadedCostRate, 0) / emps.length;
  }, [profile.permissions.employees]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Main Form Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <header className="p-1 px-1.5 bg-slate-100 border-b border-slate-200">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
               {TABS.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab.icon} {tab.label}
                 </button>
               ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
            <div className="max-w-3xl">
              
              {activeTab === 'tax' && (
                <div className="animate-in fade-in duration-300 space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Taxes & Currency</h2>
                  <FormRow label="Currency Code" description="e.g. USD, CAD, GBP"><Input value={profile.financial.currencyCode} onChange={e => handleUpdate({ financial: { ...profile.financial, currencyCode: e.target.value.toUpperCase() }})} maxLength={3} /></FormRow>
                  <FormRow label="Tax Status" border={false}><Toggle enabled={profile.financial.taxEnabled} onChange={val => handleUpdate({ financial: { ...profile.financial, taxEnabled: val }})} label="Enable Sales Tax Calculation" /></FormRow>
                  {profile.financial.taxEnabled && (
                    <>
                      <FormRow label="Tax Name" description="Display name on invoices"><Input value={profile.financial.taxName} onChange={e => handleUpdate({ financial: { ...profile.financial, taxName: e.target.value }})} /></FormRow>
                      <FormRow label="Tax Rate (%)"><Input type="number" min="0" max="100" step="0.01" value={profile.financial.taxRatePercent} onChange={e => handleUpdate({ financial: { ...profile.financial, taxRatePercent: Number(e.target.value) }})} /></FormRow>
                      <FormRow label="Tax Strategy"><Toggle enabled={profile.financial.taxInclusivePricing} onChange={val => handleUpdate({ financial: { ...profile.financial, taxInclusivePricing: val }})} label="Inclusive Pricing (Tax is in unit price)" /></FormRow>
                      <FormRow label="Rounding Rule"><Select options={[{label: 'Off subtotal only', value: 'roundOnSubtotal'}, {label: 'Per line item', value: 'roundPerLine'}, {label: 'No rounding', value: 'none'}]} value={profile.financial.taxRoundingRule} onChange={e => handleUpdate({ financial: { ...profile.financial, taxRoundingRule: e.target.value }})} /></FormRow>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'overhead' && (
                <div className="animate-in fade-in duration-300 space-y-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Overhead Recovery</h2>
                   <div className="bg-slate-900 rounded-[32px] p-8 text-white flex justify-between items-center mb-10">
                      <div>
                         <p className="text-[10px] font-black uppercase opacity-40 mb-2">Computed Rate</p>
                         <p className="text-4xl font-black text-emerald-400 tracking-tighter">${overheadRate.toFixed(2)}<span className="text-sm opacity-60 ml-2">/hr</span></p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase opacity-40 mb-2">Allocation Method</p>
                         <p className="text-sm font-black uppercase">{profile.estimating.overhead.allocationMethod.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                   </div>

                   <FormRow label="Recovery Method">
                      <Select options={[
                        {label: 'Per Billable Hour (Recommended)', value: 'perBillableHour'},
                        {label: 'Percent of Labor Cost', value: 'percentOfLabor'},
                        {label: 'Percent of Revenue', value: 'percentOfRevenue'}
                      ]} value={profile.estimating.overhead.allocationMethod} onChange={e => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, allocationMethod: e.target.value as any }}})} />
                   </FormRow>

                   {profile.estimating.overhead.allocationMethod === 'perBillableHour' && (
                     <div className="grid grid-cols-2 gap-4">
                        <FormRow label="Expected Hours" description="Target per month/year"><Input type="number" value={profile.estimating.overhead.expectedBillableHoursPerPeriod} onChange={e => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, expectedBillableHoursPerPeriod: Number(e.target.value) }}})} /></FormRow>
                        <FormRow label="Utilization (%)" description="Usually 70-90%"><Input type="number" value={profile.estimating.overhead.utilizationPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, utilizationPercent: Number(e.target.value) }}})} /></FormRow>
                     </div>
                   )}

                   <div className="pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Fixed Expense List</h3>
                        <button onClick={() => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, fixedCategories: [...profile.estimating.overhead.fixedCategories, {id: Date.now().toString(), name: 'New Expense', amount: 0}] }}})} className="text-[10px] font-black text-emerald-600 uppercase">+ Add Expense</button>
                      </div>
                      <div className="space-y-3">
                         {profile.estimating.overhead.fixedCategories.map(cat => (
                           <div key={cat.id} className="flex gap-4 items-center">
                              <Input className="flex-1" placeholder="Expense Name" value={cat.name} onChange={e => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, fixedCategories: profile.estimating.overhead.fixedCategories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c) }}})} />
                              <Input className="w-40" type="number" placeholder="Amount" value={cat.amount} onChange={e => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, fixedCategories: profile.estimating.overhead.fixedCategories.map(c => c.id === cat.id ? {...c, amount: Number(e.target.value)} : c) }}})} />
                              <button onClick={() => handleUpdate({ estimating: { ...profile.estimating, overhead: { ...profile.estimating.overhead, fixedCategories: profile.estimating.overhead.fixedCategories.filter(c => c.id !== cat.id) }}})} className="p-2 text-slate-300 hover:text-red-500"><ICONS.Trash2 size={16}/></button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'profit' && (
                <div className="animate-in fade-in duration-300 space-y-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Profit Targets & Strategy</h2>
                   
                   <FormRow label="Strategy Type">
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                         <button onClick={() => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, mode: 'markup' }}})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${profile.estimating.pricingStrategy.mode === 'markup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Markup Based</button>
                         <button onClick={() => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, mode: 'margin' }}})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${profile.estimating.pricingStrategy.mode === 'margin' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Margin Based</button>
                      </div>
                   </FormRow>

                   {profile.estimating.pricingStrategy.mode === 'margin' ? (
                     <>
                        <FormRow label="Target Gross Margin (%)" description="The 'Spread' between cost and price."><Input type="number" value={profile.estimating.pricingStrategy.targetGrossMarginPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, targetGrossMarginPercent: Number(e.target.value) }}})} /></FormRow>
                        <FormRow label="Target Net Profit (%)" description="Profit after all overhead is recovered."><Input type="number" value={profile.estimating.pricingStrategy.targetNetProfitPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, targetNetProfitPercent: Number(e.target.value) }}})} /></FormRow>
                        <FormRow label="Contingency (%)" description="Added on top of everything."><Input type="number" value={profile.estimating.pricingStrategy.contingencyPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, contingencyPercent: Number(e.target.value) }}})} /></FormRow>
                     </>
                   ) : (
                     <div className="grid grid-cols-2 gap-4">
                        <FormRow label="Labor Markup (%)"><Input type="number" value={profile.estimating.pricingStrategy.markupLaborPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, markupLaborPercent: Number(e.target.value) }}})} /></FormRow>
                        <FormRow label="Material Markup (%)"><Input type="number" value={profile.estimating.pricingStrategy.markupMaterialsPercent} onChange={e => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, markupMaterialsPercent: Number(e.target.value) }}})} /></FormRow>
                     </div>
                   )}
                   
                   <FormRow label="Overhead Inclusion"><Toggle enabled={profile.estimating.pricingStrategy.includeOverheadInCost} onChange={val => handleUpdate({ estimating: { ...profile.estimating, pricingStrategy: { ...profile.estimating.pricingStrategy, includeOverheadInCost: val }}})} label="Include Overhead in Cost Base" description="Required for accurate margin math." /></FormRow>
                </div>
              )}

              {/* Other tabs follow similar functional patterns... */}
              {activeTab === 'rounding' && (
                <div className="animate-in fade-in duration-300 space-y-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Rounding & Output</h2>
                   <FormRow label="Project Total Rounding" description="Round final quote to nearest..."><Select options={[{label: 'No Rounding', value: 'none'}, {label: '$1.00', value: '1'}, {label: '$5.00', value: '5'}, {label: '$10.00', value: '10'}, {label: '$25.00', value: '25'}, {label: '$100.00', value: '100'}]} value={profile.financial.rounding.totalsTo} onChange={e => handleUpdate({ financial: { ...profile.financial, rounding: { ...profile.financial.rounding, totalsTo: e.target.value as any }}})} /></FormRow>
                   <FormRow label="Line Item Strategy"><Toggle enabled={profile.financial.rounding.roundLineItems} onChange={val => handleUpdate({ financial: { ...profile.financial, rounding: { ...profile.financial.rounding, roundLineItems: val }}})} label="Apply Rounding to Estimate Blocks" /></FormRow>
                </div>
              )}

            </div>
          </div>
          
          <footer className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
             <button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${hasChanges ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
             >
               {isSaving ? 'Processing...' : 'Apply Rules'}
             </button>
          </footer>
        </div>
      </div>

      {/* Financial Health Sidebar */}
      <aside className="w-80 shrink-0 space-y-6">
         <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6">Financial Intelligence</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Overhead Rate</span>
                  <span className="text-xl font-black text-emerald-400">${overheadRate.toFixed(2)}/hr</span>
               </div>
               <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Avg. Loaded Labor</span>
                  <span className="text-xl font-black text-blue-400">${avgLoadedRate.toFixed(2)}/hr</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Target Margin</span>
                  <span className="text-xl font-black text-indigo-400">{profile.estimating.pricingStrategy.targetGrossMarginPercent}%</span>
               </div>
            </div>
            <ICONS.ShieldCheck className="absolute -bottom-10 -right-10 opacity-5" size={160} />
         </div>

         <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Setup Checklist</h3>
            <div className="space-y-4">
               {[
                 { label: 'Taxes Configured', ok: profile.financial.taxEnabled },
                 { label: 'Overhead Recovery', ok: profile.estimating.overhead.fixedCategories.length > 0 },
                 { label: 'Labor Burden Set', ok: profile.estimating.labor.burdenPercentDefault > 0 },
                 { label: 'Pricing Strategy', ok: !!profile.estimating.pricingStrategy.mode }
               ].map(check => (
                 <div key={check.label} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${check.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       <ICONS.CheckCircle2 size={12} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${check.ok ? 'text-slate-900' : 'text-slate-400'}`}>{check.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </aside>
    </div>
  );
};

export default FinancialRulesModule;
