
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, Job, CalendarEvent, User, UserRole, TimeClockEntry, AppNotification } from '../types';
import { ICONS } from '../constants';
import { getTodayScheduleItems, resolveJobContext } from '../lib/quickActions/jobContext';
import { getJSON, setJSON } from '../lib/storage';
import { computePermitAlerts } from '../lib/permits/store';
import JobPickerModal from './QuickActions/JobPickerModal';
import MaterialRequestModal from './QuickActions/MaterialRequestModal';
import PhotoUploadModal from './Photos/PhotoUploadModal';

interface DashboardProps {
  leads: Lead[];
  jobs: Job[];
  events: CalendarEvent[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads, jobs, events }) => {
  const navigate = useNavigate();
  const currentUser: User = { id: 'u1', name: 'John Owner', role: UserRole.FIELD_LEAD, email: 'john@greenlandscape.com' };
  
  const [activeCheckIn, setActiveCheckIn] = useState<TimeClockEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<any>(null);
  const [jobOptions, setJobOptions] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Compliance Logic
  const [complianceAlerts, setComplianceAlerts] = useState<AppNotification[]>([]);

  useEffect(() => {
    // 1. Time Clock Check
    const clock = getJSON<TimeClockEntry[]>('synkops_timeclock_v1', []);
    const last = clock[0];
    if (last && last.type === 'check_in' && last.userId === currentUser.id) {
      setActiveCheckIn(last);
      const j = jobs.find(job => job.id === last.jobId);
      if (j) setSelectedJob(j);
    }
    
    // 2. Compliance Audit
    setComplianceAlerts(computePermitAlerts(jobs));
  }, [jobs]);

  useEffect(() => {
    if (!activeCheckIn) return;
    const interval = setInterval(() => {
      const diff = Date.now() - new Date(activeCheckIn.timestamp).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCheckIn]);

  const handleQuickAction = (action: string) => {
    setActiveAction(action);
    const today = getTodayScheduleItems(currentUser.id);
    resolveJobContext(today, setJobOptions, (job) => executeAction(action, job));
    if (today.length !== 1) setIsPickerOpen(true);
  };

  const executeAction = (action: string, job: Job) => {
    setSelectedJob(job);
    if (action === 'ARRIVE') {
       const entry: TimeClockEntry = { id: `TC-${Date.now()}`, jobId: job.id, userId: currentUser.id, userName: currentUser.name, type: 'check_in', timestamp: new Date().toISOString() };
       const existing = getJSON<TimeClockEntry[]>('synkops_timeclock_v1', []);
       setJSON('synkops_timeclock_v1', [entry, ...existing]);
       setActiveCheckIn(entry);
    } else if (action === 'LOG') navigate(`/logs/edit/new-${job.id}`);
    else if (action === 'PHOTO') setIsPhotoModalOpen(true);
    else if (action === 'MATERIAL') setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Control Center</h1>
          <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> System Live
        </span>
      </div>

      {/* Alerts Engine */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceAlerts.map(alert => (
          <div key={alert.id} onClick={() => navigate(`/jobs/${alert.jobId}/permits`)} className={`p-4 rounded-2xl border-l-4 flex gap-3 items-start shadow-sm cursor-pointer hover:shadow-md transition-all ${alert.severity === 'high' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-amber-50 border-amber-500 text-amber-900'}`}>
            <div className="mt-1 opacity-80 shrink-0"><ICONS.ShieldCheck size={18} /></div>
            <p className="text-sm font-bold leading-tight">{alert.message}</p>
          </div>
        ))}
        {complianceAlerts.length === 0 && (
          <div className="p-4 rounded-2xl border-l-4 bg-emerald-50 border-emerald-500 text-emerald-900 flex gap-3 items-start shadow-sm">
             <div className="mt-1 opacity-80 shrink-0"><ICONS.CheckCircle2 size={18} /></div>
             <p className="text-sm font-bold leading-tight">All permits & locates approved for next 7 days.</p>
          </div>
        )}
      </section>

      {/* Quick Launch Card Grid (Identical style, wired logic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button onClick={() => handleQuickAction('ARRIVE')} className={`group p-6 bg-white rounded-[32px] shadow-sm border transition-all active:scale-95 flex flex-col items-center gap-4 ${activeCheckIn ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-emerald-500'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform bg-emerald-600 text-white`}>
            {activeCheckIn ? <ICONS.Clock className="animate-pulse" /> : <ICONS.MapPin />}
          </div>
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{activeCheckIn ? 'ON SITE' : 'Arrived at Site'}</span>
          {activeCheckIn && <p className="text-[10px] font-black text-emerald-600 mt-1">{elapsedTime}</p>}
        </button>
        {/* Other Buttons remain identical in style but wired to handleQuickAction */}
        <button onClick={() => handleQuickAction('LOG')} className="group p-6 bg-white rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center gap-4 hover:border-emerald-500 transition-all active:scale-95">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform"><ICONS.ClipboardList /></div>
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Submit Daily Log</span>
        </button>
        <button onClick={() => handleQuickAction('PHOTO')} className="group p-6 bg-white rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center gap-4 hover:border-emerald-500 transition-all active:scale-95">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform"><ICONS.Camera /></div>
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Job Site Photos</span>
        </button>
        <button onClick={() => handleQuickAction('MATERIAL')} className="group p-6 bg-white rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center gap-4 hover:border-emerald-500 transition-all active:scale-95">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform"><ICONS.Truck /></div>
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Material Request</span>
        </button>
      </div>

      {/* Main Schedule Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-black text-slate-900 flex items-center gap-3 uppercase text-xs tracking-widest"><ICONS.Calendar className="text-emerald-500" size={18} /> Today's Schedule</h2>
            <button className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Full Calendar</button>
          </div>
          <div className="divide-y divide-slate-100">
             {events.filter(e => e.start.startsWith(new Date().toISOString().split('T')[0])).map(ev => (
               <div key={ev.id} onClick={() => navigate(`/jobs/${ev.jobId}`)} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{ev.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 font-medium"><ICONS.MapPin size={14} /> {ev.address}</p>
                  </div>
                  <ICONS.ChevronRight size={18} className="text-slate-300" />
               </div>
             ))}
          </div>
        </div>
        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Approved Contracts</p>
           <p className="text-5xl font-black mb-6 tracking-tighter">$128,400</p>
           <ICONS.ShieldCheck className="absolute -bottom-10 -right-10 opacity-5" size={180} />
        </div>
      </div>

      {/* Picker Modal for Job Ambiguity */}
      {isPickerOpen && <JobPickerModal options={jobOptions} title="Select Job Context" onSelect={(j) => { setIsPickerOpen(false); executeAction(activeAction, j); }} onClose={() => setIsPickerOpen(false)} />}
    </div>
  );
};

export default Dashboard;
