
import React, { useState, useMemo } from 'react';
import { ICONS } from '../../constants';
import { fetchData, exportToCSV } from '../../lib/reports/adapter';

const SOURCES = [
  { id: 'synkops_jobs_v1', label: 'Jobs', icon: <ICONS.Briefcase size={14} /> },
  { id: 'synkops_leads_v1', label: 'Leads', icon: <ICONS.Users size={14} /> },
  { id: 'synkops_invoices_v1', label: 'Invoices', icon: <ICONS.Receipt size={14} /> },
  { id: 'synkops_change_orders_v1', label: 'Change Orders', icon: <ICONS.RefreshCcw size={14} /> },
  { id: 'synkops_warranty_cases_v1', label: 'Warranty Cases', icon: <ICONS.ShieldCheck size={14} /> },
  { id: 'synkops_vendors_v1', label: 'Vendors', icon: <ICONS.Truck size={14} /> },
];

const CustomReportBuilder: React.FC = () => {
  const [source, setSource] = useState(SOURCES[0].id);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  
  const rawData = useMemo(() => fetchData<any>(source), [source]);
  
  const availableCols = useMemo(() => {
    if (!rawData.length) return [];
    return Object.keys(rawData[0]).filter(k => typeof rawData[0][k] !== 'object');
  }, [rawData]);

  const handleToggleCol = (col: string) => {
    setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">1. Choose Data Source</h3>
              <div className="space-y-2">
                 {SOURCES.map(s => (
                   <button 
                    key={s.id} 
                    onClick={() => { setSource(s.id); setSelectedCols([]); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${source === s.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                   >
                     {s.icon} {s.label}
                   </button>
                 ))}
              </div>
           </div>

           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">2. Select Columns</h3>
              <div className="flex flex-wrap gap-2">
                 {availableCols.map(col => (
                   <button 
                    key={col} 
                    onClick={() => handleToggleCol(col)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight border transition-all ${selectedCols.includes(col) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'}`}
                   >
                     {col}
                   </button>
                 ))}
              </div>
              {availableCols.length === 0 && <p className="text-[10px] text-slate-400 italic">No data found in this source.</p>}
           </div>

           <button 
             onClick={() => exportToCSV(rawData.map(row => {
               const filtered: any = {};
               selectedCols.forEach(c => filtered[c] = row[c]);
               return filtered;
             }), `custom_${source}`)}
             disabled={selectedCols.length === 0}
             className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
           >
             Export Custom Table
           </button>
        </aside>

        <main className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Preview</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{rawData.length} Records</span>
           </div>
           <div className="flex-1 overflow-auto no-scrollbar">
              {selectedCols.length > 0 ? (
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {selectedCols.map(col => <th key={col} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{col}</th>)}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {rawData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                           {selectedCols.map(col => <td key={col} className="px-6 py-4 text-xs font-bold text-slate-700 truncate max-w-[200px]">{String(row[col])}</td>)}
                        </tr>
                      ))}
                   </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                   <ICONS.Layers size={48} className="mb-4 opacity-20" />
                   <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Select columns on the left<br/>to build your ad-hoc report.</p>
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
