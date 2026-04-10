
import React, { useState, useMemo } from 'react';
// Added JobStatus to the imports
import { CalendarEvent, Job, Lead, Crew, CalendarEventType, Proposal, ProposalStatus, JobStatus } from '../../types';
import { ICONS } from '../../constants';

interface ScheduleModuleProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  jobs: Job[];
  leads: Lead[];
  crews: Crew[];
  proposals: Proposal[];
}

const ScheduleModule: React.FC<ScheduleModuleProps> = ({ events, onAddEvent, jobs, leads, crews, proposals }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'WEEK' | 'MONTH' | 'DAY'>('WEEK');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(false);

  // MODAL STATE
  const [bookingData, setBookingData] = useState({
    leadId: '',
    date: '',
    time: '10:00',
    notes: ''
  });

  // DATE HELPERS
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Start Monday
    const monday = new Date(start.setDate(diff));
    
    return [...Array(7)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const navigateRange = (direction: number) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(next);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  const handleBookVisit = () => {
    if (!bookingData.leadId || !bookingData.date) return;
    const lead = leads.find(l => l.id === bookingData.leadId);
    
    // Fix for line 65: allDay property populated in Omit<CalendarEvent, 'id'>
    onAddEvent({
      type: CalendarEventType.SITE_VISIT,
      title: `Consult: ${lead?.clientName || 'Lead'}`,
      start: `${bookingData.date}T${bookingData.time}:00`,
      end: `${bookingData.date}T${bookingData.time}:00`,
      allDay: false,
      leadId: bookingData.leadId,
      address: lead?.address,
      notes: bookingData.notes,
      color: 'bg-blue-500'
    });

    setIsBookModalOpen(false);
    setBookingData({ leadId: '', date: '', time: '10:00', notes: '' });
  };

  const getEventsForDay = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return events.filter(e => e.start.startsWith(dStr));
  };

  // READINESS LOGIC
  const getJobReadiness = (job: Job) => {
    // Fix for line 84-87: Job interface now includes these properties
    const checks = [
      job.locatesConfirmed,
      job.materialsOrdered,
      job.depositPaid,
      job.planUploaded
    ];
    const score = checks.filter(Boolean).length;
    if (score === 4) return { status: 'READY', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 2) return { status: 'PENDING PREP', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { status: 'BLOCKED', color: 'text-red-500', bg: 'bg-red-500' };
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Schedule & Planning</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span>{isSyncing ? 'Syncing with G-Cal...' : 'Synced with Google Calendar'}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setWeatherAlert(!weatherAlert)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest ${weatherAlert ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
          >
            <ICONS.AlertCircle size={16} /> Weather Hold
          </button>
          <button 
            onClick={handleSync}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-sm"
          >
            <ICONS.RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} /> Sync
          </button>
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
          >
            <ICONS.Plus size={16} /> Book Consult
          </button>
        </div>
      </div>

      {/* CALENDAR CONTROLS */}
      <div className="flex items-center justify-between shrink-0 bg-white p-2.5 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex gap-1">
          {['DAY', 'WEEK', 'MONTH'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${view === v ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {v}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => navigateRange(-1)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <ICONS.ChevronRight className="rotate-180" size={20} />
          </button>
          <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => navigateRange(1)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <ICONS.ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={() => setCurrentDate(new Date())}
          className="px-5 py-2.5 text-[10px] font-black text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 uppercase tracking-widest"
        >
          Today
        </button>
      </div>

      {/* MAIN CALENDAR CANVAS */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          {weatherAlert && (
             <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-10 pointer-events-none flex items-center justify-center">
                <div className="bg-red-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
                   Weather Delay Mode Active
                </div>
             </div>
          )}

          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shrink-0">
            {weekDays.map(day => (
              <div key={day.toISOString()} className="py-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-black leading-none ${day.toDateString() === new Date().toDateString() ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-7 divide-x divide-slate-100 min-h-0 bg-white">
            {weekDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={i} className="flex flex-col min-h-0 p-3 space-y-3 relative group hover:bg-slate-50/30 transition-colors">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all border-l-4 group/event ${
                        event.type === CalendarEventType.JOB ? 'bg-emerald-50 border-emerald-500' : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-[9px] font-black uppercase leading-none tracking-widest ${
                          event.type === CalendarEventType.JOB ? 'text-emerald-800' : 'text-blue-800'
                        }`}>
                          {event.type}
                        </p>
                        {event.type === CalendarEventType.SITE_VISIT && <ICONS.MapPin size={10} className="text-blue-400" />}
                      </div>
                      <p className="text-xs font-black text-slate-900 tracking-tight leading-tight mb-1">{event.title}</p>
                      <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                        <ICONS.Clock size={8} /> {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  
                  {/* Empty State visual */}
                  {dayEvents.length === 0 && (
                    <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600">
                        <ICONS.Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR: READINESS & UNSCHEDULED */}
        <aside className="w-80 flex flex-col gap-6 shrink-0 overflow-hidden">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Production Readiness</h3>
            <div className="space-y-4">
              {/* Fix for line 245-248: Job interface matches properties used in readiness check */}
              {jobs.filter(j => j.status !== JobStatus.CLOSED).map(job => {
                const readiness = getJobReadiness(job);
                return (
                  <div key={job.id} className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 group cursor-pointer hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-900 truncate pr-2">{job.clientName}</span>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${readiness.color}`}>
                        {readiness.status}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[
                        { label: 'Locates', ok: job.locatesConfirmed },
                        { label: 'Materials', ok: job.materialsOrdered },
                        { label: 'Deposit', ok: job.depositPaid },
                        { label: 'Plan', ok: job.planUploaded }
                      ].map(check => (
                        <div 
                          key={check.label} 
                          className={`w-2 h-2 rounded-full transition-colors ${check.ok ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          title={check.label}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Crew Capacity</h3>
            <div className="space-y-6 overflow-y-auto no-scrollbar">
              {crews.map(crew => (
                <div key={crew.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${crew.color}`}></div>
                      <span className="text-xs font-black text-slate-700">{crew.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">4/5 Days</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${crew.color} rounded-full transition-all duration-1000`} style={{ width: '80%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* APPOINTMENT MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsBookModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Book Site Consultation</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Calendar Integration</p>
              </div>
              <button onClick={() => setIsBookModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                <ICONS.Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Target Lead</label>
                <select 
                  value={bookingData.leadId}
                  onChange={e => setBookingData({...bookingData, leadId: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
                >
                  <option value="">Choose a lead...</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.clientName} — {l.address}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Consult Date</label>
                  <input 
                    type="date" 
                    value={bookingData.date}
                    onChange={e => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Slot</label>
                  <input 
                    type="time" 
                    value={bookingData.time}
                    onChange={e => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Appointment Notes</label>
                <textarea 
                  value={bookingData.notes}
                  onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none h-24 resize-none"
                  placeholder="Items to discuss, specific site challenges..."
                />
              </div>
            </div>

            <button 
              onClick={handleBookVisit}
              disabled={!bookingData.leadId || !bookingData.date}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-xs tracking-[0.2em]"
            >
              Confirm & Sync to Google Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleModule;
