
import React from 'react';
import { VisitNote } from '../../types';
import { ICONS } from '../../constants';
import { getJSON } from '../../lib/storage';

const VisitNotesSection: React.FC = () => {
  const notes = getJSON<VisitNote[]>('synkops_visit_notes_v1', []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Historical Notes</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{notes.length}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Site observation entries</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Proof Documentation</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">482</p>
           <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
              <ICONS.Camera size={12}/> Sync'd to Drive
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-2 flex items-center gap-2 mb-6">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Latest Site Observations
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length > 0 ? notes.slice(0, 10).map(note => (
            <div key={note.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all group flex flex-col h-full">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase">{note.author?.charAt(0) || 'U'}</div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">{note.jobName}</p>
                        <p className="text-sm font-black text-slate-900 uppercase mt-0.5 tracking-tight">{note.author || 'Anonymous User'}</p>
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{new Date(note.createdAt).toLocaleDateString()}</span>
               </div>
               <div className="flex-1 relative">
                  <ICONS.MessageSquare className="absolute -top-2 -left-2 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
                  <p className="text-sm text-slate-600 leading-relaxed italic relative z-10">"{note.content}"</p>
               </div>
               <div className="mt-8 flex justify-end">
                  <button className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors flex items-center gap-2">
                     Go to Project File <ICONS.ChevronRight size={10}/>
                  </button>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[60px] flex flex-col items-center">
               <div className="p-8 bg-slate-50 rounded-full mb-6">
                  <ICONS.MessageSquare size={48} className="text-slate-200" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Journal Empty — No Site Notes Logged</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitNotesSection;
