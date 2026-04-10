
import React, { useState, useEffect } from 'react';
import { Assembly, User, UserRole } from '../../../types';
import { ICONS } from '../../../constants';
import { listAssemblies, saveAssembly, deleteAssembly } from '../../../lib/production/assemblies';

const AssembliesModule: React.FC<{ user: User }> = ({ user }) => {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setAssemblies(listAssemblies());
  }, []);

  const handleCreate = () => {
    const newA: Assembly = {
      id: `AS-${Date.now()}`,
      name: 'New Base System',
      jobType: 'hardscape',
      unit: 'SQFT',
      items: [],
      defaultDifficulty: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveAssembly(newA);
    setAssemblies(listAssemblies());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-slate-100 p-1.5 rounded-[24px] w-fit shrink-0 border border-slate-200 shadow-inner mb-8">
        <button className="flex items-center gap-3 px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 shadow-md">Estimating Assemblies</button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Estimating Recipes</h2>
          <p className="text-sm font-medium text-slate-400">Bundle materials and labor into automated systems.</p>
        </div>
        <button onClick={handleCreate} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
           + Create Assembly
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assemblies.map(a => (
          <div key={a.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group cursor-pointer">
             <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500">
                   <ICONS.Layers size={28}/>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteAssembly(a.id); setAssemblies(listAssemblies()); }} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                   <ICONS.Trash2 size={16}/>
                </button>
             </div>
             <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase leading-tight mb-2">{a.name}</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.items.length} Component(s) • Base per {a.unit}</p>
             
             <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded uppercase">{a.jobType}</span>
                <ICONS.ChevronRight className="text-slate-200" size={18}/>
             </div>
          </div>
        ))}
        {assemblies.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] opacity-40">
              <ICONS.Layers size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">No standard assemblies defined</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AssembliesModule;
