
import React from 'react';
import { Vendor, User, UserRole } from '../../types';
import { ICONS } from '../../constants';

interface CompliancePanelProps {
  vendor: Vendor;
  onUpdate: (v: Vendor) => void;
  user: User;
}

const CompliancePanel: React.FC<CompliancePanelProps> = ({ vendor, onUpdate, user }) => {
  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiry < thirtyDays;
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-10">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Insurance Coverage</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Provider & Policy</p>
                <p className="text-sm font-black text-slate-900">{vendor.insurance?.provider || 'Missing'} • {vendor.insurance?.policyNumber || 'N/A'}</p>
              </div>
              <div className={`p-6 rounded-3xl border ${isExpired(vendor.insurance?.expiryDate || '') ? 'bg-red-50 border-red-200' : isExpiringSoon(vendor.insurance?.expiryDate || '') ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-60">Expiry Date</p>
                <p className="text-sm font-black text-slate-900">{vendor.insurance?.expiryDate || 'Missing'}</p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">WSIB / Workers Comp</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Account Number</p>
                <p className="text-sm font-black text-slate-900">{vendor.wsib?.number || 'Missing'}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Next Clearance Review</p>
                <p className="text-sm font-black text-slate-900">{vendor.wsib?.expiryDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className={`p-10 rounded-[40px] text-white shadow-xl ${vendor.compliance.approved ? 'bg-slate-900' : 'bg-red-600'}`}>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Master Status</p>
           <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${vendor.compliance.approved ? 'bg-emerald-500' : 'bg-white/20'}`}>
                 <ICONS.ShieldCheck size={32} />
              </div>
              <div>
                 <p className="text-2xl font-black uppercase tracking-tight">{vendor.compliance.approved ? 'Approved' : 'Restricted'}</p>
                 <p className="text-[10px] font-bold opacity-60 uppercase">Manual Override Required</p>
              </div>
           </div>
           <button 
            onClick={() => onUpdate({ ...vendor, compliance: { ...vendor.compliance, approved: !vendor.compliance.approved } })}
            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
           >
             Toggle Approval
           </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Actions</h3>
           <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest text-slate-600">
                 Request Updated Docs <ICONS.ChevronRight size={14} />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest text-slate-600">
                 Upload New Cert <ICONS.Camera size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;
