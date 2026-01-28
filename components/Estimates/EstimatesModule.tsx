
import React, { useState, useRef } from 'react';
import { Estimate, EstimateStatus, CompanyConfig } from '../../types';
import { ICONS } from '../../constants';
import EstimateBuilder from './EstimateBuilder';

interface EstimatesModuleProps {
  estimates: Estimate[];
  setEstimates: React.Dispatch<React.SetStateAction<Estimate[]>>;
  updateEstimateStatus: (id: string, status: EstimateStatus) => void;
  config: CompanyConfig;
}

const STAGES = [
  { id: EstimateStatus.DRAFT, label: 'Draft', color: 'bg-slate-400', ringColor: 'ring-slate-200', bgColor: 'bg-slate-50/50' },
  { id: EstimateStatus.SENT, label: 'Sent', color: 'bg-blue-500', ringColor: 'ring-blue-200', bgColor: 'bg-blue-50/30' },
  { id: EstimateStatus.ACCEPTED, label: 'Accepted', color: 'bg-emerald-500', ringColor: 'ring-emerald-200', bgColor: 'bg-emerald-50/30' },
  { id: EstimateStatus.DECLINED, label: 'Declined', color: 'bg-red-500', ringColor: 'ring-red-200', bgColor: 'bg-red-50/30' },
];

const EstimatesModule: React.FC<EstimatesModuleProps> = ({ estimates, setEstimates, updateEstimateStatus, config }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'list'>('pipeline');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<EstimateStatus | null>(null);
  const [draggedEstimateId, setDraggedEstimateId] = useState<string | null>(null);
  
  const dragCounters = useRef<Record<string, number>>({});

  const handleCreateNew = () => {
    setSelectedEstimate(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (est: Estimate) => {
    setSelectedEstimate(est);
    setIsBuilderOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, estimateId: string) => {
    e.dataTransfer.setData('estimateId', estimateId);
    e.dataTransfer.effectAllowed = 'move';
    
    setTimeout(() => {
      setDraggedEstimateId(estimateId);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedEstimateId(null);
    setDragOverStage(null);
    dragCounters.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, stageId: EstimateStatus) => {
    e.preventDefault();
    dragCounters.current[stageId] = (dragCounters.current[stageId] || 0) + 1;
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent, stageId: EstimateStatus) => {
    e.preventDefault();
    dragCounters.current[stageId] = (dragCounters.current[stageId] || 0) - 1;
    if (dragCounters.current[stageId] <= 0) {
      if (dragOverStage === stageId) setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: EstimateStatus) => {
    e.preventDefault();
    const estimateId = e.dataTransfer.getData('estimateId');
    if (estimateId) {
      updateEstimateStatus(estimateId, stageId);
    }
    handleDragEnd();
  };

  if (isBuilderOpen) {
    return (
      <EstimateBuilder 
        initialData={selectedEstimate} 
        config={config} 
        onSave={(newEst) => {
          if (selectedEstimate) {
            setEstimates(prev => prev.map(e => e.id === newEst.id ? newEst : e));
          } else {
            setEstimates(prev => [...prev, newEst]);
          }
          setIsBuilderOpen(false);
        }}
        onCancel={() => setIsBuilderOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Estimates & Quotes</h1>
          <p className="text-sm text-slate-500 font-medium">Build professional production scopes and pricing.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <ICONS.Plus size={18} /> New Estimate
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit shrink-0 border border-slate-200 shadow-inner">
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pipeline View
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          List View
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'pipeline' ? (
          <div className="flex gap-4 overflow-x-auto pb-6 h-full no-scrollbar">
            {STAGES.map(stage => {
              const stageEstimates = estimates.filter(e => e.status === stage.id);
              const isOver = dragOverStage === stage.id;
              
              return (
                <div 
                  key={stage.id} 
                  className="min-w-[320px] flex-1 flex flex-col h-full"
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => handleDragEnter(e, stage.id)}
                  onDragLeave={(e) => handleDragLeave(e, stage.id)}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-sm shadow-slate-300`}></span>
                      <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{stage.label}</h3>
                      <span className="bg-slate-200/80 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {stageEstimates.length}
                      </span>
                    </div>
                  </div>

                  <div className={`
                    flex-1 space-y-3 p-3 rounded-[24px] transition-all duration-300 ease-out border-2 overflow-y-auto no-scrollbar
                    ${isOver 
                      ? `${stage.bgColor} border-dashed border-emerald-300 scale-[1.01] shadow-inner ring-4 ring-emerald-500/5` 
                      : 'bg-transparent border-transparent'}
                  `}>
                    {stageEstimates.map((est) => (
                      <div 
                        key={est.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, est.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleEdit(est)}
                        className={`
                          bg-white p-4 rounded-2xl shadow-sm border border-slate-200 
                          hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5
                          transition-all cursor-grab active:cursor-grabbing group select-none active:scale-[0.98]
                          ${draggedEstimateId === est.id ? 'opacity-30 scale-95 rotate-1 grayscale bg-slate-50' : 'opacity-100'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight truncate pr-2">
                            {est.clientName}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">v{est.version}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-4">
                          <ICONS.MapPin size={12} className="text-slate-300 shrink-0" />
                          <span className="truncate">{est.address}</span>
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Value</span>
                            <span className="text-sm font-black text-slate-900 tracking-tight">${est.totalValue.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                              {est.projectType}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {stageEstimates.length === 0 && !isOver && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
                        <ICONS.Plus size={20} className="text-slate-300 mb-1" />
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Drop here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="overflow-y-auto no-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client & Address</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Value</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Build System</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estimates.map(est => (
                    <tr key={est.id} onClick={() => handleEdit(est)} className="hover:bg-slate-50/80 cursor-pointer group transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">{est.clientName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium tracking-tight truncate max-w-xs">
                          <ICONS.MapPin size={10} className="opacity-60" /> {est.address}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-slate-900">${est.totalValue.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">Deposit: ${est.depositRequired.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`
                          px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                          ${est.status === EstimateStatus.ACCEPTED ? 'bg-emerald-100 text-emerald-700' : 
                            est.status === EstimateStatus.DRAFT ? 'bg-slate-100 text-slate-600' : 
                            est.status === EstimateStatus.DECLINED ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                        `}>
                          {est.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-tighter">
                            {est.buildSystem}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ICONS.ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {estimates.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ICONS.FileEdit size={32} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">No estimates found</p>
                    <p className="text-slate-400 text-sm">Start by creating a new estimate for a lead.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimatesModule;
