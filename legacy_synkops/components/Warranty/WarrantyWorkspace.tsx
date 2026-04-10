
import React, { useState, useEffect, useMemo } from 'react';
import { 
  WarrantyCase, 
  WarrantyStatus, 
  WarrantyRecord, 
  User, 
  UserRole, 
  VisitReport,
  Photo,
  PhotoCategory,
  DenialReason,
  ResolutionOutcome,
  IssueType,
  WarrantyPriority
} from '../../types';
import { ICONS } from '../../constants';
import VisitReportForm from './VisitReportForm';

interface WarrantyWorkspaceProps {
  warrantyCase: WarrantyCase;
  records: WarrantyRecord[];
  user: User;
  onSave: (c: WarrantyCase) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const REPORTS_KEY = 'synkops_visit_reports_v1';

const WarrantyWorkspace: React.FC<WarrantyWorkspaceProps> = ({ warrantyCase, records, user, onSave, onDelete, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  
  const record = useMemo(() => records.find(r => r.id === warrantyCase.warrantyRecordId), [records, warrantyCase]);

  // Standardized Denial Logic
  const [denialForm, setDenialForm] = useState({
    reason: DenialReason.THIRD_PARTY,
    summary: ''
  });

  const [resolutionForm, setResolutionForm] = useState({
    outcome: ResolutionOutcome.COVERED_REPAIRED,
    note: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(REPORTS_KEY);
    if (saved) {
      const all: VisitReport[] = JSON.parse(saved);
      setReports(all.filter(r => r.caseId === warrantyCase.id));
    }
  }, [warrantyCase.id]);

  const handleAddReport = (report: VisitReport) => {
    const saved = localStorage.getItem(REPORTS_KEY);
    const all = saved ? JSON.parse(saved) : [];
    localStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...all]));
    setReports([report, ...reports]);
    setIsReportFormOpen(false);
    
    if (warrantyCase.status === WarrantyStatus.NEW || warrantyCase.status === WarrantyStatus.SCHEDULED) {
      onSave({ ...warrantyCase, status: WarrantyStatus.IN_REPAIR });
    }
  };

  const handleDeny = () => {
    // Check evidence photos (reports usually carry these)
    const evidencePhotos = reports.flatMap(r => r.photos);
    if (evidencePhotos.length < 2) {
      alert("Denial requires at least 2 evidence photos from site inspection reports.");
      return;
    }
    if (!denialForm.summary) {
      alert("Written summary required for denial.");
      return;
    }

    onSave({ 
      ...warrantyCase, 
      status: WarrantyStatus.DENIED, 
      decision: 'denied',
      denialReason: denialForm.reason,
      closureNote: denialForm.summary,
      updatedAt: new Date().toISOString()
    });
    setIsDenyModalOpen(false);
  };

  const handleFinalResolve = () => {
    onSave({ 
      ...warrantyCase, 
      status: WarrantyStatus.RESOLVED, 
      decision: resolutionForm.outcome.includes('Denied') ? 'denied' : 'covered',
      outcome: resolutionForm.outcome,
      closureNote: resolutionForm.note,
      updatedAt: new Date().toISOString()
    });
    setIsResolveModalOpen(false);
  };

  const handleUpdateStatus = (s: WarrantyStatus) => {
    onSave({ ...warrantyCase, status: s, updatedAt: new Date().toISOString() });
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-4 md:-m-6 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
              <ICONS.ChevronRight className="rotate-180" size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{warrantyCase.caseNumber}</h1>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-blue-100 text-blue-700`}>
                  {warrantyCase.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-tight">
                {warrantyCase.clientName} — {warrantyCase.address}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {![WarrantyStatus.RESOLVED, WarrantyStatus.CLOSED, WarrantyStatus.DENIED].includes(warrantyCase.status) && (
              <button 
                onClick={() => setIsReportFormOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
              >
                <ICONS.ClipboardList size={16} /> Submit Visit Report
              </button>
            )}
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <ICONS.MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: <ICONS.Search size={14} /> },
            { id: 'visits', label: 'Site Visits', icon: <ICONS.Truck size={14} /> },
            { id: 'photos', label: 'Photos', icon: <ICONS.Camera size={14} /> },
            { id: 'policy', label: 'Warranty Policy', icon: <ICONS.ShieldCheck size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reported Issue</h3>
                     <div>
                        <div className="flex items-center gap-3 mb-4">
                           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{warrantyCase.issueType}</span>
                           {/* Fixed: Comparison correctly uses WarrantyPriority enum value */}
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${warrantyCase.priority === WarrantyPriority.HIGH ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>{warrantyCase.priority} Priority</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 leading-tight">{warrantyCase.description}</p>
                     </div>
                  </section>

                  <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline & History</h3>
                     <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {reports.map(report => (
                          <div key={report.id} className="relative pl-12">
                             <div className="absolute left-0 top-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                <ICONS.Truck size={14} />
                             </div>
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                   <p className="text-xs font-black uppercase tracking-widest text-slate-900">Visit Report: {report.findings.severity.toUpperCase()}</p>
                                   <span className="text-[10px] font-bold text-slate-400">{new Date(report.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{report.notes}</p>
                                <div className="flex gap-2">
                                   {report.photos.slice(0,3).map((p, i) => (
                                     <div key={i} className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden border border-slate-100">
                                        <img src={p} className="w-full h-full object-cover" />
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                        ))}
                        <div className="relative pl-12">
                           <div className="absolute left-0 top-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                              <ICONS.AlertCircle size={14} />
                           </div>
                           <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                              <p className="text-xs font-black uppercase tracking-widest text-blue-900">Case Reported</p>
                              <p className="text-[10px] font-bold text-blue-400 mt-1">{new Date(warrantyCase.createdAt).toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Warranty Status</p>
                     <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${warrantyCase.warrantyValid ? 'bg-emerald-500' : 'bg-red-500'} shadow-lg`}>
                           {warrantyCase.warrantyValid ? <ICONS.ShieldCheck size={24} /> : <ICONS.AlertCircle size={24} />}
                        </div>
                        <div>
                           <p className="text-xl font-black">{warrantyCase.warrantyValid ? 'Active Coverage' : 'Out of Warranty'}</p>
                           {record && <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Expires {new Date(record.endDate).toLocaleDateString()}</p>}
                        </div>
                     </div>
                     <div className="space-y-3 pt-6 border-t border-white/10">
                        {isAdmin && ![WarrantyStatus.RESOLVED, WarrantyStatus.CLOSED, WarrantyStatus.DENIED].includes(warrantyCase.status) && (
                          <>
                            <button onClick={() => setIsResolveModalOpen(true)} className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">Resolve & Close Out</button>
                            <button onClick={() => setIsDenyModalOpen(true)} className="w-full py-4 bg-red-600/20 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600/30 transition-all">Deny Claim</button>
                          </>
                        )}
                        {isAdmin && (warrantyCase.status === WarrantyStatus.CLOSED || warrantyCase.status === WarrantyStatus.RESOLVED || warrantyCase.status === WarrantyStatus.DENIED) && (
                          <div className="p-4 bg-white/5 rounded-2xl text-center">
                             <p className="text-[10px] font-black uppercase text-white/40 mb-1">Final Decision</p>
                             <p className="text-xs font-bold text-white uppercase">{warrantyCase.outcome || warrantyCase.status}</p>
                          </div>
                        )}
                        {isAdmin && (
                          <button onClick={() => onDelete(warrantyCase.id)} className="w-full py-4 text-white/20 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-400 transition-all">Delete Case</button>
                        )}
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</h3>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                           <ICONS.User size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">{warrantyCase.assignedToId || 'Unassigned'}</p>
                           <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Assign Field Lead</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-12">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Coverage Policy</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Snapshot frozen at job close</p>
                  </div>
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                     <ICONS.ShieldCheck size={32} />
                  </div>
               </div>

               {record ? (
                 <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                          <p className="text-xl font-black text-slate-900">{record.policySnapshot.durationMonths} Months</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Policy Name</p>
                          <p className="text-sm font-black text-slate-900">{record.policySnapshot.name}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Included Coverage</h4>
                       <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{record.policySnapshot.coverageText}</p>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-sm font-black text-red-600 uppercase tracking-widest border-b border-red-50 pb-2">Exclusions</h4>
                       <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{record.policySnapshot.exclusionsText}</p>
                    </div>
                 </div>
               ) : (
                 <div className="py-20 text-center text-slate-400">
                    <p className="italic">No original warranty record found for this client.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {reports.flatMap(r => r.photos).map((p, i) => (
                 <div key={i} className="aspect-square rounded-[28px] overflow-hidden border border-slate-200 bg-slate-100 group relative">
                    <img src={p} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Evidence Detail</span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Denial Dialog */}
      {isDenyModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDenyModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Standardized Denial</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Legally sound justification required.</p>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Denial Reason</label>
                   <select 
                     value={denialForm.reason}
                     onChange={e => setDenialForm({...denialForm, reason: e.target.value as any})}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                   >
                      {Object.values(DenialReason).map((r: string) => <option key={r} value={r}>{r}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Findings Summary (Required)</label>
                   <textarea 
                     value={denialForm.summary}
                     onChange={e => setDenialForm({...denialForm, summary: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold h-32 resize-none"
                     placeholder="Explain exactly what was observed that voids coverage..."
                   />
                </div>
                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3">
                   <ICONS.AlertCircle className="text-red-500 mt-0.5 shrink-0" />
                   <p className="text-[10px] text-red-800 font-bold uppercase leading-relaxed">
                      EVIDENCE CHECK: {reports.flatMap(r => r.photos).length}/2 Inspection Photos found in site reports.
                   </p>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setIsDenyModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
                <button 
                  onClick={handleDeny} 
                  disabled={reports.flatMap(r => r.photos).length < 2}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-50"
                >
                  Confirm Denial
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Resolution Dialog */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsResolveModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Case Closeout</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Final outcome for {warrantyCase.issueType}.</p>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Outcome</label>
                   <select 
                     value={resolutionForm.outcome}
                     onChange={e => setResolutionForm({...resolutionForm, outcome: e.target.value as any})}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                   >
                      {Object.values(ResolutionOutcome).map((r: string) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolution Note (Client-Safe)</label>
                   <textarea 
                     value={resolutionForm.note}
                     onChange={e => setResolutionForm({...resolutionForm, note: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold h-32 resize-none"
                     placeholder="Summary of work performed or decision reach..."
                   />
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setIsResolveModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
                <button onClick={handleFinalResolve} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Resolve Case</button>
             </div>
          </div>
        </div>
      )}

      {isReportFormOpen && (
        <VisitReportForm 
          caseId={warrantyCase.id}
          issueType={warrantyCase.issueType}
          user={user}
          onSave={handleAddReport}
          onCancel={() => setIsReportFormOpen(false)}
        />
      )}
    </div>
  );
};

export default WarrantyWorkspace;
