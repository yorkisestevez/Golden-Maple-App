
import React, { useMemo } from 'react';
import { Job, Crew } from '../../types';
import { ICONS } from '../../constants';

interface CapacityHeatmapProps {
  jobs: Job[];
  crews: Crew[];
}

const CapacityHeatmap: React.FC<CapacityHeatmapProps> = ({ jobs, crews }) => {
  const workload = useMemo(() => {
    return crews.map(crew => {
      const assignedJobs = jobs.filter(j => j.crewIds.includes(crew.id) && j.status === 'IN_PROGRESS');
      const totalPlanned = assignedJobs.reduce((acc, j) => acc + (j.metrics.plannedLaborHours / j.metrics.plannedDays), 0);
      const intensity = (totalPlanned / 8) * 100; // 8hr standard day
      
      return {
        id: crew.id,
        name: crew.name,
        jobsCount: assignedJobs.length,
        intensity,
        status: intensity > 110 ? 'OVERLOADED' : intensity > 85 ? 'OPTIMAL' : 'AVAILABLE'
      };
    });
  }, [jobs, crews]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-4 px-2">
         <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Saturation</h4>
            <p className="text-sm font-black text-slate-900 uppercase mt-1">Cross-Project Resource Heatmap</p>
         </div>
         <span className="text-[9px] font-bold text-slate-400 uppercase">Calculated daily @ 06:00</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workload.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">{c.name.charAt(0)}</div>
                   <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{c.jobsCount} Active Sites</p>
                   </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${c.status === 'OVERLOADED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                   {c.status}
                </div>
             </div>

             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Burn</span>
                   <span className={`text-xl font-black ${c.intensity > 100 ? 'text-red-600' : 'text-slate-900'}`}>{c.intensity.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${c.intensity > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, c.intensity)}%` }}
                   />
                </div>
             </div>
             
             {c.intensity > 100 && (
               <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-pulse">
                  <ICONS.AlertCircle size={14} />
                  <p className="text-[9px] font-black uppercase tracking-tight">Scheduling Conflict: 100%+ Capacity</p>
               </div>
             )}

             <ICONS.Users className="absolute -bottom-6 -right-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" size={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapacityHeatmap;
