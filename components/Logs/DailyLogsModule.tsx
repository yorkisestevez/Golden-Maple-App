
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyLog, LogStatus } from '../../types';
import { ICONS } from '../../constants';

const DailyLogsModule: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<LogStatus | 'ALL'>('ALL');

  const logs: DailyLog[] = [
    { 
      id: 'log1', 
      jobId: 'J101', 
      date: '2024-10-23', 
      status: LogStatus.SUBMITTED, 
      fieldLeadId: 'u1', 
      crewIds: ['u1', 'u2'], 
      startTime: '07:30', 
      endTime: '16:00',
      lunchMinutes: 30,
      weather: 'Sunny',
      siteConditions: ['Dry'],
      workCompleted: ['Excavation', 'Base Prep'],
      production: [],
      equipmentIds: [],
      clientSpokeWith: false,
      clientInteractionNotes: '',
      tomorrowPlan: 'Start paving',
      tomorrowStatus: 'CONTINUE',
      photos: ['1', '2', '3']
    },
    { 
      id: 'log2', 
      jobId: 'J102', 
      date: '2024-10-23', 
      status: LogStatus.DRAFT, 
      fieldLeadId: 'u3', 
      crewIds: ['u3'], 
      startTime: '08:00', 
      endTime: '',
      lunchMinutes: 0,
      weather: 'Rainy',
      siteConditions: ['Muddy'],
      workCompleted: [],
      production: [],
      equipmentIds: [],
      clientSpokeWith: true,
      clientInteractionNotes: 'Client worried about rain runoff',
      tomorrowPlan: 'Pumping water if rain continues',
      tomorrowStatus: 'WAITING',
      photos: []
    },
  ];

  const filteredLogs = activeFilter === 'ALL' ? logs : logs.filter(l => l.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Production Logs</h1>
          <p className="text-sm text-slate-500 font-medium">Field accountability and progress tracking.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs')} 
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Select Job to Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-8">
          <div className="flex items-center gap-3 text-red-700 mb-4">
            <ICONS.AlertCircle size={20} />
            <h3 className="font-black text-xs uppercase tracking-widest">Missing / Late</h3>
          </div>
          <p className="text-sm text-red-900 font-bold mb-4">1 job did not submit a log for yesterday.</p>
          <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-900">Harvey Specter — J105</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Oct 23, 2024</p>
            </div>
            <button className="p-2 bg-red-600 text-white rounded-xl shadow-md active:scale-90 transition-all">
               <ICONS.Bell size={14} />
            </button>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submission Rate</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">92%</span>
            <span className="text-xs text-emerald-600 font-black mb-1.5 flex items-center gap-1">
              +4% <ICONS.TrendingUp size={14} />
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-3">LTM Average: 88%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issues Flagged</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">04</span>
            <span className="text-xs text-amber-600 font-black mb-1.5 uppercase">Open Today</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-3">Avg Resolution Time: 4.2h</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200 shadow-inner mb-6">
        {/* Fixed for line 118: Typed s as string to fix mapping over LogStatus enum */}
        {['ALL', ...Object.values(LogStatus)].map((s: string) => (
          <button 
            key={s}
            onClick={() => setActiveFilter(s as any)}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job / Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Lead</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weather</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 group transition-colors cursor-pointer" onClick={() => navigate(`/logs/edit/${log.id}`)}>
                <td className="px-8 py-6">
                  <div className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">J101 — Sarah Johnson</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{log.date}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-400">AL</div>
                    <span className="text-sm font-bold text-slate-700">Alice (Lead)</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-slate-500">{log.weather}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    log.status === LogStatus.SUBMITTED ? 'bg-emerald-100 text-emerald-700' : 
                    log.status === LogStatus.DRAFT ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">View Log</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyLogsModule;
