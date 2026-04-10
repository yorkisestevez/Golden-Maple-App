
import React from 'react';
import { TimeClockEntry, DailyLog } from '../../types';
import { ICONS } from '../../constants';
import { getJSON, STORAGE_KEYS } from '../../lib/storage';

const LaborMetricsSection: React.FC = () => {
  const clockEntries = getJSON<TimeClockEntry[]>(STORAGE_KEYS.SETTINGS, []); // Fallback for prototype data structure
  const logs = getJSON<DailyLog[]>('synkops_daily_logs_v1', []);

  // Productivity Mock Data derived from trend logic
  const performanceTrend = [72, 64, 88, 54, 91, 77, 85];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Attendance Logs</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{clockEntries.length}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Check-in/out events</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Production Docs</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{logs.length}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Validated daily logs</p>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 shadow-sm">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Labor Efficiency</p>
           <p className="text-4xl font-black text-emerald-700 tracking-tighter">84.2%</p>
           <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
              <ICONS.TrendingUp size={12}/> Above Benchmark
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Headcount (Est)</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">12</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active field users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Real-time Site Activity
           </h4>
           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {clockEntries.length > 0 ? clockEntries.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:text-emerald-500 transition-colors uppercase text-xs">{entry.userName?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase">{entry.userName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Project ID: {entry.jobId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{new Date(entry.timestamp).toLocaleDateString()}</p>
                   </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                   <ICONS.HardHat size={32} className="mb-4 opacity-10" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No site traffic today</p>
                </div>
              )}
           </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[48px] text-white shadow-xl relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-10">Production Yield Trend (L7D)</h4>
              <div className="flex items-end justify-between h-48 gap-3 px-2 mb-8 border-b border-white/5 pb-2">
                 {performanceTrend.map((h, i) => (
                   <div key={i} className="flex-1 bg-white/10 rounded-t-2xl hover:bg-emerald-400 transition-all duration-700 cursor-help group/bar relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl scale-75 group-hover/bar:scale-100 border border-slate-100">
                         {h}% Yield
                      </div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="mt-12 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Avg Weekly Performance</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">78.4%</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black uppercase text-white/80 bg-white/5 px-3 py-1 rounded-lg">High Velocity</p>
                 </div>
              </div>
           </div>
           <ICONS.TrendingUp className="absolute -bottom-10 -right-10 opacity-5 scale-150 transition-transform duration-1000 group-hover:rotate-6" size={240} />
        </div>
      </div>
    </div>
  );
};

export default LaborMetricsSection;
