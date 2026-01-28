
import React, { useState, useEffect } from 'react';
import { User, UserRole, BusinessProfile } from '../../types';
import { ICONS } from '../../constants';
import { getActiveProfile, updateSettings } from '../../lib/settings';
import Input from '../ui/Input';
import FormRow from '../ui/FormRow';
import CostCodeManager from './CostCodes/CostCodeManager';
import CategoryTreeManager from './Catalog/CategoryTreeManager';
import FinancialBrainPanel from './Financial/FinancialBrainPanel';
import CrewHRPanel from './HR/CrewHRPanel';

const SECTIONS = [
  { id: 'business', label: 'Company Identity', icon: <ICONS.Briefcase size={16} /> },
  { id: 'plan', label: 'Plan & Billing', icon: <ICONS.ShieldCheck size={16} /> },
  { id: 'categories', label: 'Item Categories', icon: <ICONS.Layers size={16} /> },
  { id: 'cost_codes', label: 'Cost Codes', icon: <ICONS.Lock size={16} /> },
  { id: 'financial_brain', label: 'Financial Brain', icon: <ICONS.TrendingUp size={16} /> },
  { id: 'employees', label: 'Crew & HR', icon: <ICONS.Users size={16} /> },
];

const SettingsModule: React.FC<{ user: User }> = ({ user }) => {
  const [activeSection, setActiveSection] = useState('business');
  const [profile, setProfile] = useState<BusinessProfile>(getActiveProfile());
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdate = (updates: any) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(profile, user, activeSection);
    setHasChanges(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Configuration</h1>
          <p className="text-sm text-slate-500 font-medium">Standardize your operational DNA and manage subscription tiers.</p>
        </div>
        {activeSection !== 'plan' && (
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${hasChanges ? 'bg-emerald-600 text-white active:scale-95' : 'bg-slate-100 text-slate-300'}`}
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
        <aside className="w-full lg:w-72 shrink-0 h-auto lg:h-full overflow-y-auto no-scrollbar">
          <div className="bg-slate-100 p-1.5 rounded-[28px] border border-slate-200 flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
             {SECTIONS.map(s => (
               <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex-none lg:w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === s.id ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                 <span className={activeSection === s.id ? 'text-emerald-500' : 'text-slate-300'}>{s.icon}</span>
                 {s.label}
               </button>
             ))}
          </div>
        </aside>

        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {activeSection === 'business' && (
            <div className="max-w-3xl bg-white p-12 rounded-[40px] border border-slate-200 space-y-10 shadow-sm">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Identity & Brand</h2>
                 <p className="text-sm text-slate-400 font-medium">This information appears on Proposals and Invoices.</p>
               </div>
               
               <div className="space-y-6">
                 <FormRow label="Business Name" description="Legal trade name">
                    <Input value={profile.business.displayName} onChange={e => handleUpdate({ business: { ...profile.business, displayName: e.target.value }})} />
                 </FormRow>
                 <FormRow label="Company Owner" description="Primary account administrator">
                    <Input placeholder="Enter Owner Name" value={profile.business.ownerName} onChange={e => handleUpdate({ business: { ...profile.business, ownerName: e.target.value }})} />
                 </FormRow>
                 <FormRow label="App Branding" description="Name shown in the navigation sidebar">
                    <Input value={profile.branding.appName} onChange={e => handleUpdate({ branding: { ...profile.branding, appName: e.target.value }})} />
                 </FormRow>
                 <div className="grid grid-cols-2 gap-6">
                   <FormRow label="Currency"><Input value={profile.financial.currencyCode} onChange={e => handleUpdate({ financial: { ...profile.financial, currencyCode: e.target.value.toUpperCase() }})} /></FormRow>
                   <FormRow label="Tax Rate %"><Input type="number" value={profile.financial.taxRatePercent} onChange={e => handleUpdate({ financial: { ...profile.financial, taxRatePercent: Number(e.target.value) }})} /></FormRow>
                 </div>
               </div>
            </div>
          )}

          {activeSection === 'plan' && (
            <div className="max-w-4xl space-y-8 pb-20">
               <section className="bg-slate-900 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">Production Tier</h2>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Operational Licensing</p>
                       </div>
                       <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest">Enterprise Ready</span>
                    </div>
                    
                    <div className="space-y-6 max-w-lg">
                       <p className="text-lg text-white/80 font-medium leading-relaxed">You are currently using the <span className="text-white font-black">SynkOps Private Beta</span>. For real-world production, we recommend connecting your own Gemini Paid Tier key to ensure data privacy.</p>
                       <div className="flex gap-4">
                          <div className="flex-1 p-5 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[9px] font-black uppercase opacity-40 mb-1">API Privacy</p>
                             <p className="text-sm font-bold">100% Isolated</p>
                          </div>
                          <div className="flex-1 p-5 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[9px] font-black uppercase opacity-40 mb-1">Data Sovereignty</p>
                             <p className="text-sm font-bold">Encrypted at Rest</p>
                          </div>
                       </div>
                    </div>
                  </div>
                  <ICONS.ShieldCheck className="absolute -bottom-10 -right-10 opacity-5 scale-150" size={240} />
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                           <ICONS.Database size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-900 uppercase">External Database</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Not Connected</p>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">Connect to <strong>Supabase</strong> or <strong>Firebase</strong> to sync data across multiple crew devices in the field.</p>
                     <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Launch Connection Wizard</button>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                           <ICONS.TrendingUp size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-900 uppercase">Gemini API Plan</h4>
                           <p className="text-[10px] font-black text-emerald-600 uppercase">Paid Tier Recommended</p>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">Paid tiers offer <strong>zero data training</strong>, ensuring your proprietary estimates never leave your workspace.</p>
                     <a href="https://ai.google.dev/pricing" target="_blank" className="block w-full py-4 bg-slate-900 text-white text-center rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all">View Google Pricing</a>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'categories' && <CategoryTreeManager />}
          {activeSection === 'cost_codes' && <CostCodeManager />}
          {activeSection === 'financial_brain' && <FinancialBrainPanel />}
          {activeSection === 'employees' && <CrewHRPanel />}
        </main>
      </div>
    </div>
  );
};

export default SettingsModule;
