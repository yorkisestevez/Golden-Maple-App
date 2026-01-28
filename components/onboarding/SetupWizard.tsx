import React, { useState } from 'react';
import { CompanyConfig } from '../../types';

interface SetupWizardProps {
  onComplete: (config: CompanyConfig) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  // Fix for line 15: Added missing properties to satisfy CompanyConfig interface requirement
  const [formData, setFormData] = useState<Partial<CompanyConfig>>({
    name: '',
    hstPercent: 13,
    depositPercent: 50,
    laborRates: { crew: 45, lead: 65, operator: 75 },
    markupRules: { materials: 30, subs: 15 },
    currency: 'USD',
    taxEnabled: true,
    roundingRule: 'none',
    minJobSize: 0
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData as CompanyConfig);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to SynkOps</h1>
          <p className="opacity-90">Let's get your business setup in 3 minutes.</p>
          
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-white' : 'bg-white/30'}`}></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Step 1: Company Profile</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Green Acres Landscaping"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">HST/Tax (%)</label>
                  <input 
                    type="number" 
                    value={formData.hstPercent}
                    onChange={e => setFormData({...formData, hstPercent: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Standard Deposit (%)</label>
                  <input 
                    type="number" 
                    value={formData.depositPercent}
                    onChange={e => setFormData({...formData, depositPercent: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Step 2: Labor Rates ($/hr)</h2>
              <div className="space-y-4">
                {Object.entries(formData.laborRates || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700 capitalize">{key} Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">$</span>
                      <input 
                        type="number" 
                        // Fix for type 'unknown' is not assignable to type 'string | number | readonly string[]'
                        value={value as number}
                        onChange={e => setFormData({
                          ...formData, 
                          laborRates: { ...formData.laborRates!, [key]: Number(e.target.value) }
                        })}
                        className="w-20 bg-transparent text-right font-bold outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Step 3: Markup Rules</h2>
              <p className="text-sm text-slate-500 mb-4">Default percentage to add to material and sub-contractor costs.</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Material Markup</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={formData.markupRules?.materials}
                      onChange={e => setFormData({
                        ...formData, 
                        markupRules: { ...formData.markupRules!, materials: Number(e.target.value) }
                      })}
                      className="w-16 bg-transparent text-right font-bold outline-none"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Subcontractor Markup</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={formData.markupRules?.subs}
                      onChange={e => setFormData({
                        ...formData, 
                        markupRules: { ...formData.markupRules!, subs: Number(e.target.value) }
                      })}
                      className="w-16 bg-transparent text-right font-bold outline-none"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-3">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className="flex-1 py-4 px-6 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="flex-[2] py-4 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all"
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                className="flex-[2] py-4 px-6 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Launch Dashboard
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupWizard;