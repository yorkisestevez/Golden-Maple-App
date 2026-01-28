
import React, { useMemo } from 'react';
import { Job, User, UserRole } from '../../../types';
import { ICONS } from '../../../constants';

const CostingSnapshot: React.FC<{ job: Job; user: User }> = ({ job, user }) => {
  const laborPerformance = useMemo(() => {
    const planned = job.metrics.plannedLaborHours;
    const actual = job.metrics.actualLaborHours;
    const progress = job.progressPercent / 100;
    const projectedFinal = progress > 0 ? actual / progress : 0;
    const variance = planned - projectedFinal;
    
    return { planned, actual, projectedFinal, variance, status: variance >= 0 ? 'ON TRACK' : 'OVER BUDGET' };
  }, [job]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cost Intelligence</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Estimate vs Actual Analysis</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl">
           <ICONS.RefreshCcw size={14}/> Sync All Actuals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Labor Variance</p>
           <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-black tracking-tighter ${laborPerformance.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {laborPerformance.variance > 0 ? '+' : ''}{laborPerformance.variance.toFixed(1)}h
              </p>
              <span className="text-[10px] font-black text-slate-400 uppercase">Projected</span>
           </div>
           <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${laborPerformance.variance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (laborPerformance.actual / laborPerformance.planned) * 100)}%` }}
              />
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Production Velocity</p>
           <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                {(job.metrics.actualUnitsCompleted / job.metrics.actualLaborHours || 0).toFixed(1)}
              </p>
              <span className="text-[10px] font-black text-slate-400 uppercase">Units/Hr</span>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase mt-4">Target: {(job.metrics.plannedUnits / job.metrics.plannedLaborHours).toFixed(1)} Units/Hr</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Gross Profit Target</p>
             <p className="text-4xl font-black text-emerald-400 tracking-tighter">38.4%</p>
           </div>
           <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase opacity-60">Status</span>
              <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">High Margin</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Labor Breakdown</h3>
              <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">View Timesheets</button>
            </div>
            <div className="space-y-6">
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Estimated Labor</span>
                  <span className="text-sm font-black text-slate-900">{job.metrics.plannedLaborHours} Hours</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Logged Actuals</span>
                  <span className="text-sm font-black text-slate-900">{job.metrics.actualLaborHours} Hours</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Projected at 100%</span>
                  <span className={`text-sm font-black ${laborPerformance.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {laborPerformance.projectedFinal.toFixed(1)} Hours
                  </span>
               </div>
               <button className="w-full py-4 mt-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  Push Actual Rates to Global Library
               </button>
            </div>
         </section>

         <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Material spend</h3>
              <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">View Orders</button>
            </div>
            <div className="space-y-6">
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Estimated Materials</span>
                  <span className="text-sm font-black text-slate-900">$12,450.00</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Committed POs</span>
                  <span className="text-sm font-black text-slate-900">$8,200.00</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Other Expenses</span>
                  <span className="text-sm font-black text-slate-900">$450.00</span>
               </div>
               <div className="pt-4 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400">Total Actual</span>
                  <span className="text-lg font-black text-slate-900">$8,650.00</span>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};

export default CostingSnapshot;
