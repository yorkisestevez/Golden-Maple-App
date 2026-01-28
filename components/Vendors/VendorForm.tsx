import React, { useState } from 'react';
import { Vendor, VendorType } from '../../types';
import { ICONS } from '../../constants';

const VendorForm: React.FC<{ onSave: (v: Vendor) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Vendor>>({
    id: `V-${Date.now()}`,
    name: '',
    vendorTypes: ['supplier'],
    tags: [],
    region: '',
    active: true,
    compliance: { approved: false, doNotAssign: false },
    // Fixed error on lines 15-16: Use correct property names from Vendor interface
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Vendor);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 uppercase">Partner Setup</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><ICONS.Plus className="rotate-45" size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region / City</label>
              <input required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Type</label>
             <div className="flex gap-2">
                {['supplier', 'subcontractor', 'rental', 'disposal'].map(t => (
                  <button 
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, vendorTypes: [t as any]})}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${formData.vendorTypes?.includes(t as any) ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (Separated by commas)</label>
            <input 
              placeholder="e.g. hardscape, lighting, aggregates" 
              onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
           <button type="button" onClick={onCancel} className="flex-1 py-5 font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
           <button type="submit" onClick={handleSubmit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20">Initialize Profile</button>
        </div>
      </div>
    </div>
  );
};

export default VendorForm;