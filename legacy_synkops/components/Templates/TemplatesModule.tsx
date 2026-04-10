
import React, { useState, useEffect, useMemo } from 'react';
import { TemplateBase, TemplateType, User, UserRole } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, getJSON, setJSON } from '../../lib/storage';
import TemplateEditor from './TemplateEditor';
import AssembliesModule from './Assemblies/AssembliesModule';
import { SEED_TEMPLATES } from './seedData';

const TABS: { id: string; label: string; icon: any }[] = [
  { id: 'assemblies', label: 'Estimating Assemblies', icon: <ICONS.Layers size={16} /> },
  { id: 'proposal', label: 'Proposals', icon: <ICONS.FileText size={16} /> },
  { id: 'change_order', label: 'Change Orders', icon: <ICONS.RefreshCcw size={16} /> },
  { id: 'warranty_policy', label: 'Warranty Policies', icon: <ICONS.ShieldCheck size={16} /> },
  { id: 'daily_log', label: 'Daily Logs', icon: <ICONS.ClipboardList size={16} /> },
];

const TemplatesModule: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('assemblies');
  const [templates, setTemplates] = useState<TemplateBase[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateBase | null>(null);

  useEffect(() => {
    const existing = getJSON<TemplateBase[]>('synkops_templates_v1', []);
    if (existing.length === 0) {
      setJSON('synkops_templates_v1', SEED_TEMPLATES);
      setTemplates(SEED_TEMPLATES);
    } else {
      setTemplates(existing);
    }
  }, []);

  if (activeTab === 'assemblies') {
    return <AssembliesModule user={user} />;
  }

  if (selectedTemplate) {
    return <TemplateEditor template={selectedTemplate} user={user} onSave={() => setSelectedTemplate(null)} onCancel={() => setSelectedTemplate(null)} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Operational Templates</h1>
          <p className="text-sm text-slate-500 font-medium">Standardize every project document and site process.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[24px] w-fit shrink-0 border border-slate-200 shadow-inner overflow-x-auto no-scrollbar max-w-full">
        {TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
         <ICONS.FileText size={80} className="text-slate-200 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Template Library</h2>
         <p className="text-sm text-slate-500 font-medium">Select a category to manage your standard systems.</p>
      </div>
    </div>
  );
};

export default TemplatesModule;
