
import React, { useState, useEffect, useMemo } from 'react';
import { PermitRecord, User, UserRole, PermitStatus, PermitChecklistItem } from '../../../types';
import { ICONS } from '../../../constants';
import { listPermitsByJob, createPermit, updatePermit, deletePermit } from '../../../lib/permits/store';

const STATUS_OPTIONS: { label: string; value: PermitStatus; color: string }[] = [
  { label: 'Required', value: 'required', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Applied', value: 'applied', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Approved', value: 'approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Rejected', value: 'rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Expired', value: 'expired', color: 'bg-slate-200 text-slate-600 border-slate-300' },
  { label: 'Not Needed', value: 'not_needed', color: 'bg-slate-100 text-slate-400 border-slate-200' },
];

const PermitsTab: React.FC<{ jobId: string; user: User; jobStartDate?: string }> = ({ jobId, user, jobStartDate }) => {
  const [permits, setPermits] = useState<PermitRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('LIST');

  useEffect(() => {
    setPermits(listPermitsByJob(jobId));
  }, [jobId]);

  const selectedPermit = useMemo(() => permits.find(p => p.id === selectedId), [permits, selectedId]);

  const handleCreate = () => {
    const p = createPermit(jobId, { title: 'New Permit/Locate', type: 'Utility Locate' });
    setPermits(prev => [p, ...prev]);
    setSelectedId(p.id);
  };

  const handleUpdate = (patch: Partial<PermitRecord>) => {
    if (!selectedId) return;
    updatePermit(selectedId, patch);
    setPermits(prev => prev.map(p => p.id === selectedId ? { ...p, ...patch } : p));
  };

  const isAtRisk = (p: PermitRecord) => {
    if (p.status === 'approved' || p.status === 'not_needed') return false;
    if (!jobStartDate) return false;
    const start = new Date(jobStartDate);
    const now = new Date();
    const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      {/* 1. LEFT: MASTER LIST */}
      <div className="w-[450px] flex flex-col gap-6 h-full min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ICONS.Layers size={16} className="text-emerald-500" /> Current Scopes
          </h2>
          <div className="flex gap-2">
             <button onClick={() => setViewMode(viewMode === 'LIST' ? 'BOARD' : 'LIST')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm"><ICONS.GripVertical size={16} /></button>
             <button onClick={handleCreate} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200">+ New Entry</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
          {permits.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left p-6 rounded-[32px] border transition-all relative group ${selectedId === p.id ? 'bg-white border-slate-900 shadow-2xl scale-[1.02] z-10' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-4">
                 <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_OPTIONS.find(s => s.value === p.status)?.color}`}>
                    {p.status.replace('_', ' ')}
                 </div>
                 {isAtRisk(p) && (
                   <span className="flex items-center gap-1.5 text-[8px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md animate-pulse">
                      <ICONS.AlertCircle size={10} /> AT RISK
                   </span>
                 )}
              </div>
              <h3 className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm tracking-tight mb-1">{p.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.authorityName || 'Agency Not Specified'}</p>
              
              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                 <div className="flex -space-x-1.5">
                    {p.checklist.map((item, i) => (
                      <div key={item.id} className={`w-2.5 h-2.5 rounded-full border border-white ${item.status === 'done' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {p.responsibility} — {p.inspections.length} Insp.
                 </span>
              </div>
            </button>
          ))}

          {permits.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] opacity-40">
               <ICONS.FileSearch size={48} className="mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No permits recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT: INSPECTOR PANEL */}
      <div className="flex-1 min-w-0 bg-white rounded-[48px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {selectedPermit ? (
          <>
            <header className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
               <div className="flex-1">
                  <input 
                    className="bg-transparent border-none p-0 text-2xl font-black text-slate-900 tracking-tight uppercase focus:ring-0 w-full"
                    value={selectedPermit.title}
                    onChange={e => handleUpdate({ title: e.target.value })}
                  />
                  <div className="flex items-center gap-4 mt-1">
                     <select 
                        value={selectedPermit.status}
                        onChange={e => handleUpdate({ status: e.target.value as any })}
                        className="bg-transparent border-none p-0 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] focus:ring-0 cursor-pointer hover:underline"
                     >
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                     </select>
                     <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PERMIT ID: {selectedPermit.id}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedId(null)} className="p-3 hover:bg-white rounded-2xl text-slate-300 transition-all"><ICONS.Plus className="rotate-45" size={24} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
               {/* Core Specs */}
               <section className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authority / Agency</label>
                     <input className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0" value={selectedPermit.authorityName} onChange={e => handleUpdate({ authorityName: e.target.value })} placeholder="e.g. City of Toronto" />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permit Number</label>
                     <input className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0" value={selectedPermit.permitNumber || ''} onChange={e => handleUpdate({ permitNumber: e.target.value })} placeholder="Pending..." />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsibility</label>
                     <select className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0 uppercase tracking-tighter" value={selectedPermit.responsibility} onChange={e => handleUpdate({ responsibility: e.target.value as any })}>
                        <option value="contractor">Contractor (Us)</option>
                        <option value="client">Client (Owner)</option>
                        <option value="shared">Shared / Partial</option>
                     </select>
                  </div>
               </section>

               {/* Checklist */}
               <section className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Compliance Checklist</h3>
                     <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Add Task</button>
                  </div>
                  <div className="space-y-2">
                     {selectedPermit.checklist.map((item, idx) => (
                        <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                           <div className="flex items-center gap-4 flex-1">
                              <button className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                                 {item.status === 'done' && <ICONS.CheckCircle2 size={12} className="text-white" />}
                              </button>
                              <input className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0" value={item.label} onChange={() => {}} />
                           </div>
                           <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              <button className="p-1 text-slate-300 hover:text-slate-600"><ICONS.GripVertical size={14} /></button>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Dates Inspector */}
               <section className="pt-10 border-t border-slate-50">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Workflow Chronology</h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due By</span>
                           <input type="date" className="text-xs font-black uppercase text-slate-900 border-none p-0 focus:ring-0 text-right" value={selectedPermit.dueByISO?.split('T')[0] || ''} onChange={e => handleUpdate({ dueByISO: e.target.value })} />
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Date</span>
                           <input type="date" className="text-xs font-black uppercase text-slate-900 border-none p-0 focus:ring-0 text-right" value={selectedPermit.appliedAtISO?.split('T')[0] || ''} onChange={e => handleUpdate({ appliedAtISO: e.target.value })} />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Date</span>
                           <input type="date" className="text-xs font-black uppercase text-slate-900 border-none p-0 focus:ring-0 text-right" value={selectedPermit.approvedAtISO?.split('T')[0] || ''} onChange={e => handleUpdate({ approvedAtISO: e.target.value })} />
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-red-400">Expires Date</span>
                           <input type="date" className="text-xs font-black uppercase text-red-600 border-none p-0 focus:ring-0 text-right" value={selectedPermit.expiresAtISO?.split('T')[0] || ''} onChange={e => handleUpdate({ expiresAtISO: e.target.value })} />
                        </div>
                     </div>
                  </div>
               </section>

               {/* Attachments UI Stub */}
               <section className="pt-10 border-t border-slate-50">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Official Attachments</h3>
                     <button className="text-[10px] font-black text-slate-400 uppercase hover:text-emerald-600">+ Upload Media</button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     <div className="aspect-square bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-200 transition-all">
                        <ICONS.Camera size={24} className="text-slate-300 group-hover:text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Capture</span>
                     </div>
                  </div>
               </section>
            </div>

            <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <button onClick={() => { if(window.confirm('Wipe this permit record?')) { deletePermit(selectedId); setPermits(permits.filter(p=>p.id!==selectedId)); setSelectedId(null); }}} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Delete Permanently</button>
               <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Last Updated: {new Date(selectedPermit.updatedAtISO).toLocaleString()}</span>
               </div>
            </footer>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center animate-in zoom-in-95">
             <div className="p-10 bg-slate-50 rounded-full mb-8">
                <ICONS.Construction size={64} className="text-slate-200" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Compliance Hub</h2>
             <p className="text-sm text-slate-400 max-w-sm font-medium">Select a permit or utility locate from the left panel to manage checklists, inspections, and documents.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitsTab;
