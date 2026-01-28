
import React, { useState, useMemo, useEffect } from 'react';
import { Estimate, EstimateBlock, EstimateStatus, BuildSystem, AccessCondition, CompanyConfig, EstimateLineItem, ProductionRate } from '../../types';
import { ICONS } from '../../constants';
import { computeLaborHours, listProductionRates } from '../../lib/production/rates';
import { listAssemblies } from '../../lib/production/assemblies';
import { analyzeProjectForEstimation } from '../../lib/ai/estimator';

interface EstimateBuilderProps {
  initialData: Estimate | null;
  config: CompanyConfig;
  onSave: (est: Estimate) => void;
  onCancel: () => void;
}

const DEFAULT_BLOCKS = [
  { category: 'Mobilization', name: 'Mobilization & Setup' },
  { category: 'Excavation', name: 'Standard Excavation (10-12")' },
  { category: 'Base Prep', name: 'Aggregates & Compaction' },
  { category: 'Installation', name: 'Paver/Stone Install' },
  { category: 'Cleanup', name: 'Site Cleanup & Restoration' }
];

const EstimateBuilder: React.FC<EstimateBuilderProps> = ({ initialData, config, onSave, onCancel }) => {
  const [productionLibrary] = useState<ProductionRate[]>(listProductionRates());
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [estimate, setEstimate] = useState<Partial<Estimate>>(initialData || {
    id: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
    version: 1,
    status: EstimateStatus.DRAFT,
    clientName: '',
    address: '',
    projectType: 'Patio',
    buildSystem: BuildSystem.STANDARD,
    accessConditions: AccessCondition.NORMAL,
    blocks: DEFAULT_BLOCKS.map(db => ({
      id: Math.random().toString(36).substr(2, 9),
      ...db,
      qty: 1,
      unit: 'SQFT',
      materials: [],
      laborHours: 0,
      equipmentHours: 0,
      subCost: 0,
      clientNotes: '',
      internalNotes: ''
    })),
    createdDate: new Date().toISOString().split('T')[0]
  });

  const handleAiAssist = async () => {
    if (!estimate.projectType) return;
    setIsAiLoading(true);
    const result = await analyzeProjectForEstimation({
      projectType: estimate.projectType,
      notes: estimate.blocks?.[0]?.internalNotes || "Standard installation",
      address: estimate.address || "Unknown"
    });

    if (result && result.suggestedBlocks) {
      const newBlocks = result.suggestedBlocks.map((b: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        category: 'AI Suggested',
        name: b.name,
        qty: b.qty,
        unit: b.unit,
        materials: [],
        laborHours: 0,
        equipmentHours: 0,
        subCost: 0,
        clientNotes: b.logic,
        internalNotes: 'AI Generated'
      }));
      setEstimate(prev => ({ ...prev, blocks: [...(prev.blocks || []), ...newBlocks] }));
    }
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (!estimate.blocks) return;

    const updatedBlocks = estimate.blocks.map(block => {
      const matchingRate = productionLibrary.find(r => 
        block.name.toLowerCase().includes(r.taskName.toLowerCase()) || 
        r.taskName.toLowerCase().includes(block.name.toLowerCase())
      );

      if (matchingRate && block.qty > 0) {
        const difficulty = estimate.accessConditions === AccessCondition.RESTRICTED ? 'restricted' : 'normal';
        const suggestedHours = computeLaborHours(matchingRate.id, block.qty, difficulty);
        if (block.laborHours === 0) {
          return { ...block, laborHours: Number(suggestedHours.toFixed(1)) };
        }
      }
      return block;
    });

    const hasChanged = JSON.stringify(updatedBlocks) !== JSON.stringify(estimate.blocks);
    if (hasChanged) {
      setEstimate(prev => ({ ...prev, blocks: updatedBlocks }));
    }
  }, [estimate.blocks?.map(b => b.qty), estimate.accessConditions]);

  const totals = useMemo(() => {
    let materialsRaw = 0;
    let laborHoursTotal = 0;
    let equipmentHoursTotal = 0;
    let subsRaw = 0;

    estimate.blocks?.forEach(block => {
      block.materials.forEach(m => materialsRaw += m.total);
      laborHoursTotal += block.laborHours;
      equipmentHoursTotal += block.equipmentHours;
      subsRaw += block.subCost;
    });

    const laborCost = laborHoursTotal * (config.laborRates?.lead || 65); 
    const equipmentCost = equipmentHoursTotal * (config.laborRates?.operator || 75);
    const materialsMarked = materialsRaw * (1 + ((config.markupRules?.materials || 30) / 100));
    const subsMarked = subsRaw * (1 + ((config.markupRules?.subs || 15) / 100));
    const subtotal = materialsMarked + laborCost + equipmentCost + subsMarked;
    const tax = subtotal * ((config.hstPercent || 13) / 100);
    const total = subtotal + tax;

    return { materialsRaw, materialsMarked, laborCost, equipmentCost, subsMarked, subtotal, tax, total, laborHours: laborHoursTotal };
  }, [estimate, config]);

  const addBlock = () => {
    const newBlock: EstimateBlock = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'Installation',
      name: 'New Custom Block',
      qty: 0,
      unit: 'SQFT',
      materials: [],
      laborHours: 0,
      equipmentHours: 0,
      subCost: 0,
      clientNotes: '',
      internalNotes: ''
    };
    setEstimate(prev => ({ ...prev, blocks: [...(prev.blocks || []), newBlock] }));
  };

  const updateBlock = (id: string, updates: Partial<EstimateBlock>) => {
    setEstimate(prev => ({
      ...prev,
      blocks: prev.blocks?.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const handleSave = () => {
    if (!estimate.clientName || !estimate.address) {
      alert("Please fill in Client Name and Address");
      return;
    }
    onSave({
      ...estimate,
      totalValue: totals.total,
      depositRequired: totals.total * ((config.depositPercent || 50) / 100)
    } as Estimate);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-6 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {initialData ? 'Refine Estimate' : 'Project Estimator'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest">ID: {estimate.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleAiAssist}
            disabled={isAiLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAiLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}
          >
            {isAiLoading ? <ICONS.RefreshCcw className="animate-spin" size={14} /> : <ICONS.Database size={14} />}
            AI Estimator
          </button>
          <button onClick={onCancel} className="px-6 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl">Discard</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-xl active:scale-95 transition-all">Commit to CRM</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-10">
            <section className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">01</div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Baseline Parameters</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
                  <input type="text" value={estimate.clientName} onChange={e => setEstimate({...estimate, clientName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold" placeholder="e.g. Sarah Johnson" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                  <input type="text" value={estimate.address} onChange={e => setEstimate({...estimate, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold" placeholder="123 Oak Street..." />
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">02</div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Production Stack</h3>
                </div>
                <div className="flex gap-3">
                  <button onClick={addBlock} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/10">+ Custom Block</button>
                </div>
              </div>

              {estimate.blocks?.map((block) => (
                <div key={block.id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden group hover:border-emerald-200 transition-all">
                  <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
                    <input 
                      className="bg-transparent border-none p-0 text-lg font-black text-slate-900 focus:ring-0 outline-none w-96"
                      value={block.name}
                      onChange={e => updateBlock(block.id, { name: e.target.value })}
                    />
                    <button onClick={() => setEstimate(prev => ({ ...prev, blocks: prev.blocks?.filter(b => b.id !== block.id) }))} className="p-2 text-slate-300 hover:text-red-500"><ICONS.Trash2 size={18} /></button>
                  </div>
                  <div className="p-8 grid grid-cols-4 gap-8">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Qty ({block.unit})</label>
                      <input type="number" value={block.qty} onChange={e => updateBlock(block.id, { qty: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Labor Hrs</label>
                      <input type="number" value={block.laborHours} onChange={e => updateBlock(block.id, { laborHours: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Equip Hrs</label>
                      <input type="number" value={block.equipmentHours} onChange={e => updateBlock(block.id, { equipmentHours: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sub Allow ($)</label>
                      <input type="number" value={block.subCost} onChange={e => updateBlock(block.id, { subCost: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <textarea 
                      placeholder="Notes for client..." 
                      value={block.clientNotes} 
                      onChange={e => updateBlock(block.id, { clientNotes: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium resize-none h-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-[400px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Financial Snapshot</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>Materials (Marked)</span>
                <span className="text-slate-900">${totals.materialsMarked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>Labor Cost ({totals.laborHours.toFixed(1)}h)</span>
                <span className="text-slate-900">${totals.laborCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>Equipment</span>
                <span className="text-slate-900">${totals.equipmentCost.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t flex justify-between items-end">
                 <span className="text-xs font-black text-slate-900 uppercase">Subtotal</span>
                 <span className="text-4xl font-black text-emerald-600 tracking-tighter">${totals.subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase text-center mt-8">Tax and Deposit factored on acceptance</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EstimateBuilder;
