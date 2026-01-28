
import React, { useState, useEffect } from 'react';
import { CostCode } from '../../../types';
import { ICONS } from '../../../constants';
import { STORAGE_KEYS, safeSetJSON, safeGetJSON, uid } from '../../../lib/storage';

const CostCodeManager: React.FC = () => {
  const [codes, setCodes] = useState<CostCode[]>([]);

  useEffect(() => {
    setCodes(safeGetJSON<CostCode[]>(STORAGE_KEYS.COST_CODES, []));
  }, []);

  const addCode = () => {
    const name = window.prompt("Scope Name (e.g. Paver Installation):");
    const code = window.prompt("Code Prefix (e.g. 02-500):");
    if (!name || !code) return;
    const newCode: CostCode = { id: uid('CC'), code, name, division: 'Hardscape', order: codes.length };
    const updated = [...codes, newCode];
    setCodes(updated);
    safeSetJSON(STORAGE_KEYS.COST_CODES, updated);
  };

  return (
    <div className="max-w-3xl bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase">Cost Codes</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Consistent project divisions for costing.</p>
        </div>
        <button onClick={addCode} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">+ New Code</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {codes.map(c => (
          <div key={c.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center group hover:bg-white hover:border-emerald-200 transition-all">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{c.code}</span>
                <span className="font-black text-sm text-slate-900 uppercase tracking-tight">{c.name}</span>
             </div>
             <button onClick={() => { const u = codes.filter(x => x.id !== c.id); setCodes(u); safeSetJSON(STORAGE_KEYS.COST_CODES, u); }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><ICONS.Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostCodeManager;
