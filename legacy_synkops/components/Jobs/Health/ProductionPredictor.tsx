
import React, { useMemo, useState, useEffect } from 'react';
import { Job } from '../../../types';
import { ICONS } from '../../../constants';
import { scanWeatherRisk, WeatherRisk } from '../../../lib/ai/weatherScanner';

const ProductionPredictor: React.FC<{ job: Job }> = ({ job }) => {
  const [weatherRisk, setWeatherRisk] = useState<WeatherRisk | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (job.address && job.status === 'IN_PROGRESS') {
      setIsScanning(true);
      scanWeatherRisk(job.address, new Date().toISOString())
        .then(risk => {
          setWeatherRisk(risk);
          setIsScanning(false);
        });
    }
  }, [job.id]);

  const predictions = useMemo(() => {
    const { plannedLaborHours, actualLaborHours } = job.metrics;
    if (actualLaborHours === 0 || job.progressPercent === 0) return null;

    const velocity = job.progressPercent / actualLaborHours;
    const remainingProgress = 100 - job.progressPercent;
    const estRemainingHours = remainingProgress / velocity;
    
    const totalEstHours = actualLaborHours + estRemainingHours;
    const efficiency = (plannedLaborHours / totalEstHours) * 100;
    
    const workDaysLeft = Math.ceil(estRemainingHours / 8);
    const estCompletion = new Date();
    estCompletion.setDate(estCompletion.getDate() + workDaysLeft);

    return {
      efficiency,
      estRemainingHours,
      estCompletion,
      status: efficiency >= 100 ? 'ON_BUDGET' : efficiency > 85 ? 'AT_RISK' : 'OVER_BUDGET'
    };
  }, [job]);

  return (
    <div className="space-y-4">
      {weatherRisk?.hasRisk && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-[32px] flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
             <ICONS.AlertCircle size={20} />
          </div>
          <div>
             <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Weather Hazard Detected</p>
             <p className="text-sm font-bold text-amber-900 mt-1">{weatherRisk.summary}</p>
             <p className="text-[10px] font-black text-amber-600 uppercase mt-2">AI Suggestion: {weatherRisk.recommendedAction}</p>
          </div>
        </div>
      )}

      <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 overflow-hidden relative group">
         <div className="flex justify-between items-start">
            <div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Velocity Engine</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Live AI completion forecast</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${!predictions ? 'bg-slate-100 text-slate-400' : predictions.status === 'ON_BUDGET' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
               {predictions?.status.replace('_', ' ') || 'Awaiting Logs'}
            </div>
         </div>

         {predictions ? (
           <div className="grid grid-cols-2 gap-10">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Projected Completion</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{predictions.estCompletion.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                 <p className="text-[10px] font-bold text-emerald-600 uppercase mt-2">Target: {job.targetEndDate ? new Date(job.targetEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Efficiency</p>
                 <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-black tracking-tighter ${predictions.efficiency >= 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {predictions.efficiency.toFixed(1)}%
                    </p>
                 </div>
              </div>
           </div>
         ) : (
           <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Insufficient real-world data to generate forecast</p>
           </div>
         )}

         <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
            <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-blue-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
              {isScanning ? 'Grounding data with live weather search...' : predictions?.status === 'OVER_BUDGET' 
                ? 'Warning: Crew velocity is 15% below target. Intervention recommended.' 
                : 'System performing at peak efficiency.'}
            </p>
         </div>
         <ICONS.TrendingUp className="absolute -bottom-6 -right-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" size={120} />
      </section>
    </div>
  );
};

export default ProductionPredictor;
