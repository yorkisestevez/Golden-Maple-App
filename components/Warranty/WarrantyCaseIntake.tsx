
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Job, 
  WarrantyCase, 
  WarrantyRecord, 
  WarrantyStatus, 
  WarrantyPriority, 
  IssueType 
} from '../../types';
import { ICONS } from '../../constants';

interface WarrantyCaseIntakeProps {
  jobs: Job[];
  records: WarrantyRecord[];
  onSave: (c: WarrantyCase) => void;
  onCancel: () => void;
}

const WarrantyCaseIntake: React.FC<WarrantyCaseIntakeProps> = ({ jobs, records, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<WarrantyCase>>({
    id: `SRV-${Date.now()}`,
    caseNumber: `SRV-${Math.floor(Math.random() * 9000) + 1000}`,
    clientName: '',
    address: '',
    issueType: IssueType.SETTLEMENT,
    description: '',
    priority: WarrantyPriority.MEDIUM,
    status: WarrantyStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [selectedJobId, setSelectedJobId] = useState('');

  // Posture logic: If Settlement, it's presumed covered pending inspection
  useEffect(() => {
    if (formData.issueType === IssueType.SETTLEMENT) {
      setFormData(prev => ({ ...prev, decision: 'covered' }));
    }
  }, [formData.issueType]);

  const linkedRecord = useMemo(() => {
    return records.find(r => r.jobId === selectedJobId);
  }, [records, selectedJobId]);

  const warrantyValid = useMemo(() => {
    if (!linkedRecord) return false;
    const end = new Date(linkedRecord.endDate);
    return end > new Date();
  }, [linkedRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobs.find(j => j.id === selectedJobId);
    
    onSave({
      ...formData as WarrantyCase,
      linkedJobId: selectedJobId || undefined,
      warrantyRecordId: linkedRecord?.id,
      clientName: job?.clientName || formData.clientName || 'Unknown',
      address: job?.address || formData.address || 'Unknown',
      jobType: job?.metrics?.plannedUnits ? 'Hardscape' : 'Service',
      warrantyValid
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Service Intake</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Report a new site issue</p>
           </div>
           <button onClick={onCancel} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl text-slate-400 transition-all">
              <ICONS.Plus className="rotate-45" size={24} />
           </button>
        </div>

        <form id="intake-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
           
           {formData.issueType === IssueType.SETTLEMENT && (
             <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <ICONS.ShieldCheck className="text-emerald-500" size={18} />
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Postue: Presumed Covered (Pending Inspection)</p>
             </div>
           )}

           {/* Job Lookup */}
           <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Link to Original Job</label>
              <select 
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">-- No Match (Unlinked Case) --</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName} — {j.address}</option>)}
              </select>

              {linkedRecord ? (
                <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${warrantyValid ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warrantyValid ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
                      {warrantyValid ? <ICONS.ShieldCheck size={20} /> : <ICONS.AlertCircle size={20} />}
                   </div>
                   <div>
                      <p className="text-xs font-black uppercase tracking-tight">{warrantyValid ? 'In Warranty' : 'Expired Warranty'}</p>
                      <p className="text-[10px] font-bold opacity-70">Coverage ends {new Date(linkedRecord.endDate).toLocaleDateString()}</p>
                   </div>
                </div>
              ) : selectedJobId && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 text-amber-800">
                   <ICONS.AlertCircle className="shrink-0" />
                   <p className="text-xs font-bold leading-tight">Job found but no warranty record exists. This will be created as an Out-of-Warranty case.</p>
                </div>
              )}
           </div>

           {!selectedJobId && (
             <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Client Name</label>
                   <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Address</label>
                   <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Category</label>
                 {/* Fixed: explicitly type v as string to fix mapping errors */}
                 <select value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none">
                    {Object.values(IssueType).map((v: string) => <option key={v} value={v}>{v}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                 {/* Fixed: explicitly type v as string to fix mapping errors */}
                 <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none">
                    {Object.values(WarrantyPriority).map((v: string) => <option key={v} value={v}>{v}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Description</label>
              <textarea 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold h-32 resize-none outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="What did the client report? Be specific about location and symptoms."
              />
           </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
           <button type="button" onClick={onCancel} className="flex-1 py-4 px-6 border border-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white transition-all">Discard</button>
           <button type="submit" form="intake-form" className="flex-[2] py-4 px-6 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all">Open Service Case</button>
        </div>
      </div>
    </div>
  );
};

export default WarrantyCaseIntake;
