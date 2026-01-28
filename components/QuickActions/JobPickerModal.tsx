
import React, { useState } from 'react';
import { Job } from '../../types';
import { ICONS } from '../../constants';

interface JobPickerModalProps {
  options: Job[];
  title: string;
  onSelect: (job: Job) => void;
  onClose: () => void;
}

const JobPickerModal: React.FC<JobPickerModalProps> = ({ options, title, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = options.filter(j => 
    j.clientName.toLowerCase().includes(search.toLowerCase()) || 
    j.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
        </div>

        <div className="relative">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by client or address..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto no-scrollbar space-y-2">
          {filtered.map(job => (
            <button 
              key={job.id} 
              onClick={() => onSelect(job)}
              className="w-full p-5 text-left bg-white border border-slate-100 rounded-[28px] hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex justify-between items-center group"
            >
              <div>
                <p className="font-black text-slate-900 group-hover:text-emerald-700">{job.clientName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{job.address}</p>
              </div>
              <ICONS.ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-500" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-slate-300 italic uppercase text-[10px] font-black tracking-widest">No matching jobs found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPickerModal;
