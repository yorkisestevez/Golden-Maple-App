
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Fix for line 4: imports consolidated
import { DailyLog, LogStatus, LogProductionEntry, Job } from '../../types';
import { ICONS } from '../../constants';

const WORK_CATEGORIES = [
  'Layout/Marking', 'Demo/Removal', 'Excavation', 'Fabric Install', 'Base Install', 
  'Compaction', 'Bedding', 'Paver Install', 'Wall Install', 'Step Install', 'Cleanup'
];

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Windy', 'Extreme Heat'];
const SITE_CONDITIONS = ['Dry', 'Muddy', 'Frozen', 'Saturated', 'Dusty'];

interface DailyLogEditorProps {
  job?: Job; // If passed, pre-fills for a specific job
}

interface PhotoSlot {
  id: string;
  category: string;
  required: boolean;
  data: string | null;
  description: string;
}

const DailyLogEditor: React.FC<DailyLogEditorProps> = ({ job }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>('crew');

  // 1. PHOTO STATE MANAGEMENT
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([
    { id: 'p1', category: 'Wide Shot', required: true, data: null, description: 'Overall view of the job site today' },
    { id: 'p2', category: 'Progress Detail', required: true, data: null, description: 'Close-up of specific work completed' },
    { id: 'p3', category: 'Cleanup/Closeout', required: true, data: null, description: 'End-of-day site condition & safety' },
  ]);

  // 2. LOG STATE
  // Fix for line 45: Added all missing DailyLog properties to the initial state
  const [log, setLog] = useState<Partial<DailyLog>>({
    id: id || `LOG-${Date.now()}`,
    jobId: job?.id || 'J101',
    date: new Date().toISOString().split('T')[0],
    status: LogStatus.DRAFT,
    startTime: '07:30',
    endTime: '16:00',
    lunchMinutes: 30,
    weather: 'Sunny',
    siteConditions: [],
    workCompleted: [],
    production: [
      { unitId: 'u1', unitName: 'Patio Pavers', planned: 450, completedToday: 0 },
      { unitId: 'u2', unitName: 'Base Excavation', planned: 450, completedToday: 0 },
    ],
    equipmentIds: [],
    clientSpokeWith: false,
    clientInteractionNotes: '',
    tomorrowPlan: '',
    tomorrowStatus: 'CONTINUE',
    photos: []
  });

  // 3. DYNAMIC PHOTO CATEGORIES
  // If "Base Install" or "Compaction" is selected, we should suggest a "Base Proof" photo
  useEffect(() => {
    // Fix for line 66: Accessing workCompleted which is defined in types.ts
    const needsBaseProof = log.workCompleted?.some(c => c === 'Base Install' || c === 'Compaction');
    const hasBaseProof = photoSlots.some(s => s.id === 'p-base-proof');

    if (needsBaseProof && !hasBaseProof) {
      setPhotoSlots(prev => [
        ...prev, 
        { id: 'p-base-proof', category: 'Base Proof', required: true, data: null, description: 'Photo of compacted base with level' }
      ]);
    } else if (!needsBaseProof && hasBaseProof) {
      setPhotoSlots(prev => prev.filter(s => s.id !== 'p-base-proof'));
    }
    // Fix for line 77: Accessing workCompleted in dependency array
  }, [log.workCompleted]);

  // 4. LOGIC HELPERS
  const toggleSelection = (list: string[], item: string, key: keyof DailyLog) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setLog({ ...log, [key]: newList });
  };

  const updateProduction = (unitId: string, val: number) => {
    // Fix for line 88: Accessing production array in log state
    setLog({
      ...log,
      production: log.production?.map(p => p.unitId === unitId ? { ...p, completedToday: val } : p)
    });
  };

  const handleCapturePhoto = (slotId: string) => {
    // Simulate photo capture (camera frame interaction)
    setPhotoSlots(prev => prev.map(s => s.id === slotId ? { ...s, data: `data:image/jpeg;base64,mock_${Date.now()}` } : s));
  };

  const clearPhoto = (slotId: string) => {
    setPhotoSlots(prev => prev.map(s => s.id === slotId ? { ...s, data: null } : s));
  };

  const photoStats = useMemo(() => {
    const totalRequired = photoSlots.filter(s => s.required).length;
    const filledRequired = photoSlots.filter(s => s.required && s.data).length;
    return { totalRequired, filledRequired, isComplete: filledRequired >= totalRequired };
  }, [photoSlots]);

  const canSubmit = useMemo(() => {
    // Fix for line 108-110: Accessing mandatory DailyLog fields correctly
    const hasWork = log.workCompleted && log.workCompleted.length > 0;
    const hasTomorrow = !!log.tomorrowPlan;
    const hasTimes = !!log.startTime && !!log.endTime;
    return hasTimes && hasWork && hasTomorrow && photoStats.isComplete;
  }, [log, photoStats]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Fix for line 119: Populated submittedAt which is defined in DailyLog interface
    setLog({ 
      ...log, 
      status: LogStatus.SUBMITTED, 
      submittedAt: new Date().toISOString(),
      photos: photoSlots.filter(s => s.data).map(s => s.data!) 
    });
    alert("Daily Log Submitted Successfully! Job metrics updated.");
    navigate('/logs');
  };

  const SectionHeader = ({ id, label, icon, isDone, optionalLabel }: { id: string, label: string, icon: any, isDone: boolean, optionalLabel?: string }) => (
    <button 
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      className={`w-full flex items-center justify-between p-6 rounded-[32px] transition-all border ${
        activeSection === id ? 'bg-white border-slate-900 shadow-xl scale-[1.01]' : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${activeSection === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </div>
        <div className="text-left">
          <span className="font-black text-[11px] uppercase tracking-widest text-slate-900 block">{label}</span>
          {optionalLabel && <span className="text-[10px] font-bold text-slate-400 uppercase">{optionalLabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isDone && <ICONS.CheckCircle2 size={18} className="text-emerald-500" />}
        <ICONS.ChevronRight size={18} className={`text-slate-300 transition-transform ${activeSection === id ? 'rotate-90' : ''}`} />
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-6 overflow-hidden">
      {/* 1. HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
            <ICONS.ChevronRight className="rotate-180" size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Daily Log: {job?.clientName || 'J101'}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <ICONS.Calendar size={12} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              {log.status}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
            canSubmit 
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
          }`}
        >
          {log.status === LogStatus.SUBMITTED ? 'Log Submitted' : 'Submit Log'}
        </button>
      </header>

      {/* 2. MAIN SCROLL AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50">
        <div className="max-w-xl mx-auto space-y-4">
          
          {/* CREW & TIME */}
          <section>
            {/* Fix for line 186: Using property defined in DailyLog */}
            <SectionHeader id="crew" label="Crew & Time" icon={<ICONS.Users size={18} />} isDone={!!log.endTime} />
            {activeSection === 'crew' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Start Time</label>
                    {/* Fix for line 192: Accessing startTime property correctly in setLog */}
                    <input type="time" value={log.startTime} onChange={e => setLog({...log, startTime: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">End Time</label>
                    {/* Fix for line 196: Accessing endTime property correctly in setLog */}
                    <input type="time" value={log.endTime} onChange={e => setLog({...log, endTime: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Lunch Break</label>
                   <div className="flex gap-2">
                      {/* Fix for line 203: Accessing lunchMinutes property correctly in setLog */}
                      {[0, 15, 30, 45, 60].map(min => (
                        <button key={min} onClick={() => setLog({...log, lunchMinutes: min})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${log.lunchMinutes === min ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{min}m</button>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </section>

          {/* CONDITIONS */}
          <section>
            {/* Fix for line 213: Using DailyLog properties for conditions check */}
            <SectionHeader id="conditions" label="Site Conditions" icon={<ICONS.Layers size={18} />} isDone={!!log.weather && log.siteConditions!.length > 0} />
            {activeSection === 'conditions' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-2">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">General Weather</label>
                    <div className="grid grid-cols-2 gap-2">
                       {/* Fix for line 220: Accessing weather property correctly in setLog */}
                       {WEATHER_OPTIONS.map(w => (
                         <button key={w} onClick={() => setLog({...log, weather: w})} className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${log.weather === w ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{w}</button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Site Surface</label>
                    <div className="flex flex-wrap gap-2">
                       {/* Fix for line 228: Calling toggleSelection with valid key 'siteConditions' */}
                       {SITE_CONDITIONS.map(c => (
                         <button key={c} onClick={() => toggleSelection(log.siteConditions!, c, 'siteConditions')} className={`px-4 py-2 rounded-full border font-black text-[10px] uppercase tracking-widest transition-all ${log.siteConditions!.includes(c) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{c}</button>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </section>

          {/* WORK COMPLETED */}
          <section>
            {/* Fix for line 238: Checking length of workCompleted array */}
            <SectionHeader id="work" label="Work Completed" icon={<ICONS.HardHat size={18} />} isDone={log.workCompleted!.length > 0} />
            {activeSection === 'work' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-4 animate-in slide-in-from-top-2">
                 <div className="grid grid-cols-2 gap-2.5">
                    {/* Fix for line 243-245: Calling toggleSelection with valid key 'workCompleted' and checking includes */}
                    {WORK_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => toggleSelection(log.workCompleted!, cat, 'workCompleted')} className={`flex items-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${log.workCompleted!.includes(cat) ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                         <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${log.workCompleted!.includes(cat) ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-slate-300'}`}>
                            {log.workCompleted!.includes(cat) && <ICONS.CheckCircle2 size={10} className="text-white" />}
                         </div>
                         {cat}
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </section>

          {/* PRODUCTION */}
          <section>
            {/* Fix for line 257: Accessing production array in log */}
            <SectionHeader id="production" label="Production" icon={<ICONS.TrendingUp size={18} />} isDone={log.production!.some(p => p.completedToday > 0)} />
            {activeSection === 'production' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-2">
                 {/* Fix for line 260: Accessing production array in log */}
                 {log.production!.map(p => (
                   <div key={p.unitId} className="space-y-4 p-6 bg-slate-50 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:border-slate-200 group">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{p.unitName}</span>
                         <span className="text-[10px] font-bold text-slate-400">PLAN: {p.planned} UNITS</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => updateProduction(p.unitId, Math.max(0, p.completedToday - 10))} className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center font-black text-xl text-slate-400 hover:text-red-500 transition-colors">-</button>
                         <input type="number" value={p.completedToday} onChange={e => updateProduction(p.unitId, Number(e.target.value))} className="flex-1 p-4 bg-white border border-slate-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all group-hover:border-slate-300" />
                         <button onClick={() => updateProduction(p.unitId, p.completedToday + 10)} className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">+</button>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </section>

          {/* PHOTOS (THE CORE REFINEMENT) */}
          <section>
            <SectionHeader 
              id="photos" 
              label="Mandatory Photos" 
              icon={<ICONS.Camera size={18} />} 
              isDone={photoStats.isComplete}
              optionalLabel={`${photoStats.filledRequired}/${photoStats.totalRequired} SLOTS FILLED`}
            />
            {activeSection === 'photos' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-2">
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <ICONS.AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Validation Required</p>
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed">Proof of quality is required for daily logs. Capture clear shots for the categories below.</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {photoSlots.map((slot) => (
                      <div key={slot.id} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${slot.data ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-50 bg-white shadow-sm'}`}>
                         <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group">
                            {slot.data ? (
                              <>
                                <img src={slot.data} alt={slot.category} className="w-full h-full object-cover" />
                                <button onClick={() => clearPhoto(slot.id)} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <ICONS.Trash2 size={20} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleCapturePhoto(slot.id)} className="w-full h-full flex items-center justify-center text-slate-300 hover:text-emerald-500 transition-colors">
                                <ICONS.Plus size={24} />
                              </button>
                            )}
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{slot.category}</span>
                               {slot.required && <span className="text-[8px] font-black text-red-500 bg-red-50 px-1 py-0.5 rounded">REQUIRED</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-tight">{slot.description}</p>
                            {slot.data && (
                               <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                                  <ICONS.CheckCircle2 size={12} />
                                  <span className="text-[9px] font-black uppercase">Captured OK</span>
                               </div>
                            )}
                         </div>
                         {!slot.data && (
                            <button 
                              onClick={() => handleCapturePhoto(slot.id)}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-90"
                            >
                              Capture
                            </button>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </section>

          {/* TOMORROW PLAN */}
          <section>
            {/* Fix for line 343: Checking existence of tomorrowPlan string */}
            <SectionHeader id="tomorrow" label="Tomorrow's Plan" icon={<ICONS.Calendar size={18} />} isDone={!!log.tomorrowPlan} />
            {activeSection === 'tomorrow' && (
              <div className="mt-3 bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-2">
                 {/* Fix for line 349-350: Accessing tomorrowPlan property correctly in setLog */}
                 <textarea 
                   className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold h-32 resize-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300" 
                   placeholder="What is the team doing tomorrow? Be specific..." 
                   value={log.tomorrowPlan} 
                   onChange={e => setLog({...log, tomorrowPlan: e.target.value})} 
                 />
                 <div className="flex gap-2">
                    {/* Fix for line 354: Accessing tomorrowStatus property correctly in setLog */}
                    {['CONTINUE', 'WAITING', 'DECISION'].map(s => (
                      <button key={s} onClick={() => setLog({...log, tomorrowStatus: s as any})} className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${log.tomorrowStatus === s ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{s}</button>
                    ))}
                 </div>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* 3. MOBILE FOOTER PROGRESS */}
      <div className="p-6 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
         <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submit Progress</p>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {/* Fix for line 370: Calculation uses valid DailyLog properties */}
                  {Math.round(((photoStats.filledRequired + (log.endTime ? 1 : 0) + (log.workCompleted!.length > 0 ? 1 : 0) + (log.tomorrowPlan ? 1 : 0)) / (photoStats.totalRequired + 3)) * 100)}%
               </p>
            </div>
            <div className="flex gap-1.5 h-1.5">
               {/* Fix for line 375-378: Visual indicators use valid DailyLog properties */}
               <div className={`flex-1 rounded-full transition-all ${log.endTime ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
               <div className={`flex-1 rounded-full transition-all ${log.workCompleted!.length > 0 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
               <div className={`flex-1 rounded-full transition-all ${photoStats.isComplete ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
               <div className={`flex-1 rounded-full transition-all ${log.tomorrowPlan ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DailyLogEditor;
