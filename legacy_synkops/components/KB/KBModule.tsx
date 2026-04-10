
import React, { useState, useEffect, useMemo } from 'react';
import { User, KBEntry } from '../../types';
import { ICONS } from '../../constants';
import { getJSON, setJSON, uid } from '../../lib/storage';

const STORAGE_KEY = 'synkops_kb_entries_v1';

const INITIAL_KB: KBEntry[] = [
  {
    id: 'kb-1',
    type: 'kb_entry',
    title: 'Standard Hardscape Base Preparation',
    categoryPath: 'Standards > Hardscape',
    tags: ['installation', 'hardscape', 'base'],
    markdown: '# Hardscape Base Standard\n\n1. Excavate to required depth (usually 10-12").\n2. Install non-woven separation fabric.\n3. Add 3/4" clear stone in 4" lifts.\n4. Compact thoroughly.',
    lastUpdated: new Date().toISOString(),
    author: 'Owner'
  },
  {
    id: 'kb-2',
    type: 'kb_entry',
    title: 'Employee Time Clock Policy',
    categoryPath: 'Policies > HR',
    tags: ['hr', 'payroll', 'policy'],
    markdown: '# Time Clock Policy\n\nEmployees must check in immediately upon arrival at the designated job site using the OPS dashboard.',
    lastUpdated: new Date().toISOString(),
    author: 'Owner'
  }
];

const KBModule: React.FC<{ user: User }> = ({ user }) => {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = getJSON<KBEntry[]>(STORAGE_KEY, []);
    if (saved.length === 0) {
      setJSON(STORAGE_KEY, INITIAL_KB);
      setEntries(INITIAL_KB);
    } else {
      setEntries(saved);
    }
  }, []);

  const filtered = useMemo(() => {
    return entries.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      e.categoryPath.toLowerCase().includes(search.toLowerCase())
    );
  }, [entries, search]);

  const selectedEntry = entries.find(e => e.id === selectedId);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
             <ICONS.BookOpen size={24} className="text-blue-600" /> Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 font-medium">Standard Operating Procedures & Company Standards.</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">
           + Create SOP
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar Browser */}
        <aside className="w-80 flex flex-col gap-4 shrink-0">
           <div className="relative">
              <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search standards..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
           </div>

           <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Library Navigator</h3>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                 {filtered.map(entry => (
                   <button 
                    key={entry.id} 
                    onClick={() => setSelectedId(entry.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all group ${selectedId === entry.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}
                   >
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1 opacity-60">{entry.categoryPath}</p>
                      <p className={`text-xs font-black uppercase leading-tight ${selectedId === entry.id ? 'text-blue-900' : 'text-slate-700'}`}>{entry.title}</p>
                   </button>
                 ))}
                 {filtered.length === 0 && (
                   <div className="py-12 text-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest px-4">No SOPs matched your query</div>
                 )}
              </div>
           </div>
        </aside>

        {/* Main Content Viewer */}
        <main className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           {selectedEntry ? (
             <>
               <header className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedEntry.title}</h2>
                     <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">{selectedEntry.categoryPath}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Last Sync: {new Date(selectedEntry.lastUpdated).toLocaleDateString()}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-600"><ICONS.FileText size={18} /></button>
                     <button className="p-3 bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition-all"><ICONS.FileEdit size={18} /></button>
                  </div>
               </header>
               <div className="flex-1 p-12 overflow-y-auto no-scrollbar">
                  <div className="prose prose-slate max-w-none">
                     {/* Basic Markdown Rendering Simulation */}
                     {selectedEntry.markdown.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100">{line.replace('# ', '')}</h1>;
                        if (line.match(/^\d+\./)) return <div key={i} className="flex gap-4 mb-4"><span className="font-black text-blue-500">{line.split('.')[0]}.</span><p className="text-lg text-slate-600 font-medium">{line.split('.').slice(1).join('.').trim()}</p></div>;
                        return <p key={i} className="text-lg text-slate-600 mb-6 leading-relaxed">{line}</p>;
                     })}
                  </div>
                  
                  <div className="mt-20 pt-10 border-t border-slate-100">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Metadata Tags</h3>
                     <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">#{tag}</span>
                        ))}
                     </div>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                   <ICONS.FileSearch size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Knowledge Repository</h2>
                <p className="text-slate-500 max-w-sm font-medium">Select a standard operating procedure or policy from the browser to view specifications.</p>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default KBModule;
