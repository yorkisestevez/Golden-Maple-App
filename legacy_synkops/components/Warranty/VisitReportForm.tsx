
import React, { useState } from 'react';
import { VisitReport, User, PhotoCategory, IssueType } from '../../types';
import { ICONS } from '../../constants';

interface VisitReportFormProps {
  caseId: string;
  issueType: IssueType;
  user: User;
  onSave: (report: VisitReport) => void;
  onCancel: () => void;
}

const VisitReportForm: React.FC<VisitReportFormProps> = ({ caseId, issueType, user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<VisitReport>>({
    id: `VIS-${Date.now()}`,
    caseId: caseId,
    date: new Date().toISOString().split('T')[0],
    arrival: '09:00',
    departure: '10:30',
    findings: {
      cause: 'install-related',
      severity: 'minor'
    },
    workPerformed: [],
    notes: '',
    photos: []
  });

  const [capturedPhotos, setCapturedPhotos] = useState<{url: string, category: string}[]>([]);

  const handleCapture = (cat: string) => {
    const mock = `data:image/jpeg;base64,report_${Date.now()}`;
    setCapturedPhotos([...capturedPhotos, { url: mock, category: cat }]);
  };

  const toggleWork = (item: string) => {
    const current = formData.workPerformed || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setFormData({ ...formData, workPerformed: updated });
  };

  const isSettlement = issueType === IssueType.SETTLEMENT;

  const requiredCategories = isSettlement ? [
    'Wide Context Shot',
    'Close-up of settlement edge',
    'Straightedge/level proof',
    'Drainage context'
  ] : [
    'Before',
    'Issue Detail',
    'Repair Progress',
    'Final Result'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (capturedPhotos.length < 4) {
      alert("Please capture all 4 required evidence photos to submit.");
      return;
    }
    onSave({
      ...formData as VisitReport,
      photos: capturedPhotos.map(p => p.url),
      createdBy: user.name,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onCancel} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Visit Report</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{issueType} — Inspection Pipeline</p>
           </div>
           <button onClick={onCancel} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400">
              <ICONS.Plus className="rotate-45" size={24} />
           </button>
        </div>

        <form id="visit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
           {/* Section: Findings */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Diagnostic Findings</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Primary Cause</label>
                    <select 
                      value={formData.findings?.cause}
                      onChange={e => setFormData({ ...formData, findings: { ...formData.findings!, cause: e.target.value as any }})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase"
                    >
                       <option value="install-related">Install Related</option>
                       <option value="drainage-related">Drainage Related</option>
                       <option value="soil-movement">Natural Soil Move</option>
                       <option value="third-party">Third Party Damage</option>
                       <option value="client-maintenance">Maintenance Lack</option>
                       <option value="unknown">Unknown / Other</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Severity</label>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                       {['minor', 'moderate', 'severe'].map(s => (
                         <button 
                          key={s} 
                          type="button" 
                          onClick={() => setFormData({...formData, findings: { ...formData.findings!, severity: s as any }})}
                          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all ${formData.findings?.severity === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Section: Photos */}
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Set ({capturedPhotos.length}/4)</h3>
                <span className="text-[9px] font-bold text-red-500 uppercase">Required for Settlement Claim</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {requiredCategories.map((cat, i) => {
                    const photo = capturedPhotos.find(p => p.category === cat);
                    return (
                      <div key={i} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${photo ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                         <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                            {photo ? <img src={photo.url} className="w-full h-full object-cover" /> : <ICONS.Camera size={20} className="text-slate-300" />}
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black uppercase text-slate-900 truncate">{cat}</p>
                            {!photo ? (
                               <button type="button" onClick={() => handleCapture(cat)} className="text-[9px] font-black text-emerald-600 uppercase hover:underline mt-1">Capture Now</button>
                            ) : (
                               <button type="button" onClick={() => setCapturedPhotos(capturedPhotos.filter(p => p.category !== cat))} className="text-[9px] font-black text-red-400 uppercase mt-1">Remove</button>
                            )}
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Section: Work Performed */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Work Performed Today</h3>
              <div className="grid grid-cols-2 gap-2">
                 {['Reset pavers', 'Recompact base', 'Adjust drainage', 'Apply jointing', 'Replace light fixture', 'Diagnostic only'].map(item => (
                   <button 
                    key={item} 
                    type="button"
                    onClick={() => toggleWork(item)}
                    className={`p-4 rounded-2xl border text-[10px] font-black uppercase text-left transition-all ${formData.workPerformed?.includes(item) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                   >
                     {item}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Notes</label>
              <textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold h-32 resize-none outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
                placeholder="Findings summary and what was communicated to client..." 
              />
           </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
           <button 
            type="submit" 
            form="visit-form"
            disabled={capturedPhotos.length < 4}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-[24px] shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition-all uppercase text-xs tracking-widest shadow-emerald-500/20"
           >
             Log Site Findings
           </button>
        </div>
      </div>
    </div>
  );
};

export default VisitReportForm;
