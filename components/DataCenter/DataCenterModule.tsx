
import React, { useState, useEffect } from 'react';
import { User, Job, Crew } from '../../types';
import { ICONS } from '../../constants';
import ItemsUsageSection from './ItemsUsageSection';
import FinancialMetricsSection from './FinancialMetricsSection';
import LaborMetricsSection from './LaborMetricsSection';
import ProposalSummarySection from './ProposalSummarySection';
import VisitNotesSection from './VisitNotesSection';
import CapacityHeatmap from './CapacityHeatmap';
import { getJSON, STORAGE_KEYS } from '../../lib/storage';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const STORAGE_ORDER_KEY = 'synkops_datacenter_order_v2';

const DataCenterModule: React.FC<{ user: User }> = ({ user }) => {
  const jobs = getJSON<Job[]>('synkops_jobs_v1', []);
  const crews = getJSON<Crew[]>('synkops_crews_v1', []);

  const [sections, setSections] = useState<Section[]>([
    { id: 'capacity', title: 'Crew Capacity Heatmap', icon: <ICONS.TrendingUp size={18} />, component: <CapacityHeatmap jobs={jobs} crews={crews} /> },
    { id: 'usage', title: 'Items & Catalog Usage', icon: <ICONS.Layers size={18} />, component: <ItemsUsageSection /> },
    { id: 'financials', title: 'Invoicing & Receivables', icon: <ICONS.Receipt size={18} />, component: <FinancialMetricsSection /> },
    { id: 'labor', title: 'Labor Performance & Time Clock', icon: <ICONS.Clock size={18} />, component: <LaborMetricsSection /> },
    { id: 'proposals', title: 'Proposal Summary', icon: <ICONS.FileText size={18} />, component: <ProposalSummarySection /> },
    { id: 'notes', title: 'Visit & Site Notes', icon: <ICONS.MessageSquare size={18} />, component: <VisitNotesSection /> },
  ]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['capacity']));
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
    if (savedOrder) {
      const order = JSON.parse(savedOrder) as string[];
      const sorted = [...sections].sort((a, b) => {
        const aIdx = order.indexOf(a.id);
        const bIdx = order.indexOf(b.id);
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
      });
      setSections(sorted);
    }
  }, []);

  const saveOrder = (newSections: Section[]) => {
    localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(newSections.map(s => s.id)));
    setSections(newSections);
  };

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    saveOrder(next);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    
    const dragIdx = sections.findIndex(s => s.id === draggedId);
    const hoverIdx = sections.findIndex(s => s.id === id);
    
    const next = [...sections];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(hoverIdx, 0, removed);
    setSections(next);
  };

  const handleDragEnd = () => {
    saveOrder(sections);
    setDraggedId(null);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Intelligence Terminal</h1>
          <p className="text-sm text-slate-500 font-medium">Global operational data, cross-module analytics, and utilization tracking.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setExpandedSections(new Set())} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Collapse All</button>
           <button onClick={() => setExpandedSections(new Set(sections.map(s => s.id)))} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Expand All</button>
        </div>
      </div>

      <div className="space-y-4 px-2">
        {sections.map((section, idx) => {
          const isExpanded = expandedSections.has(section.id);
          const isDragging = draggedId === section.id;

          return (
            <div 
              key={section.id}
              className={`bg-white rounded-[40px] border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden ${isDragging ? 'opacity-30 scale-[0.98] border-emerald-500 ring-4 ring-emerald-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, section.id)}
            >
              <div className="flex items-center">
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, section.id)}
                  onDragEnd={handleDragEnd}
                  className="px-6 py-8 text-slate-300 hover:text-slate-900 cursor-grab active:cursor-grabbing border-r border-slate-50 transition-colors"
                  title="Drag to reorder"
                >
                  <ICONS.GripVertical size={22} />
                </div>

                <div 
                  className="flex-1 flex items-center justify-between p-8 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all ${isExpanded ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{section.title}</h3>
                      {!isExpanded && <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Section Collapsed</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 md:opacity-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up'); }}
                        disabled={idx === 0}
                        className="p-2 text-slate-300 hover:text-slate-900 disabled:opacity-0 transition-all hover:bg-white rounded-xl border border-transparent hover:border-slate-200"
                        title="Move Up"
                      >
                        <ICONS.ChevronRight className="-rotate-90" size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down'); }}
                        disabled={idx === sections.length - 1}
                        className="p-2 text-slate-300 hover:text-slate-900 disabled:opacity-0 transition-all hover:bg-white rounded-xl border border-transparent hover:border-slate-200"
                        title="Move Down"
                      >
                        <ICONS.ChevronRight className="rotate-90" size={18} />
                      </button>
                    </div>
                    <div className={`w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-900 border-slate-900 text-white rotate-90' : 'bg-white text-slate-300'}`}>
                      <ICONS.ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden`}>
                <div className="p-10 border-t border-slate-50 bg-slate-50/20">
                  {section.component}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataCenterModule;
