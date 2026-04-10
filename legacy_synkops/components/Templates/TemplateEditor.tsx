
import React, { useState, useMemo } from 'react';
import { TemplateBase, User, DocSection, DocSectionType, TemplateStatus, DocTemplatePayload } from '../../types';
import { ICONS } from '../../constants';
import { renderTemplate } from '../../lib/templates/engine';

interface TemplateEditorProps {
  template: TemplateBase;
  user: User;
  onSave: (updated: TemplateBase) => void;
  onCancel: () => void;
}

const SECTION_OPTIONS: { type: DocSectionType; label: string; icon: any }[] = [
  { type: 'header', label: 'Header', icon: <ICONS.Layers size={14} /> },
  { type: 'summary', label: 'Summary', icon: <ICONS.Search size={14} /> },
  { type: 'scope', label: 'Scope', icon: <ICONS.FileEdit size={14} /> },
  { type: 'materials', label: 'Materials', icon: <ICONS.Truck size={14} /> },
  { type: 'pricing', label: 'Pricing', icon: <ICONS.Receipt size={14} /> },
  { type: 'terms', label: 'Terms', icon: <ICONS.ShieldCheck size={14} /> },
  { type: 'acceptance', label: 'Acceptance', icon: <ICONS.CheckCircle2 size={14} /> },
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template: initialTemplate, user, onSave, onCancel }) => {
  const [template, setTemplate] = useState<TemplateBase>(initialTemplate);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const payload: DocTemplatePayload = template.versions[template.versions.length - 1].payload;

  const updatePayload = (updates: Partial<DocTemplatePayload>) => {
    const latestVersion = template.versions[template.versions.length - 1];
    const newPayload = { ...latestVersion.payload, ...updates };
    const newVersion = { ...latestVersion, payload: newPayload, createdAt: new Date().toISOString() };
    setTemplate({
      ...template,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
      versions: [...template.versions.slice(0, -1), newVersion]
    });
  };

  const addSection = (type: DocSectionType) => {
    const newSection: DocSection = {
      id: `sec-${Date.now()}`,
      type,
      title: type.toUpperCase(),
      enabled: true,
      locked: ['header', 'acceptance'].includes(type),
      content: `Standardized ${type} content for our projects. Use {{clientName}} to personalize.`,
      variablesUsed: [],
      style: { emphasis: 'normal' },
      order: (payload.sections?.length || 0)
    };
    updatePayload({ sections: [...(payload.sections || []), newSection] });
    setActiveSectionId(newSection.id);
  };

  const updateSection = (id: string, updates: Partial<DocSection>) => {
    const updatedSections = payload.sections.map(s => s.id === id ? { ...s, ...updates } : s);
    updatePayload({ sections: updatedSections });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sections = [...payload.sections];
    const index = sections.findIndex(s => s.id === id);
    if (index < 0) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    // Check lock rules
    if (sections[index].locked || sections[newIndex].locked) return;

    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    const updated = sections.map((s, i) => ({ ...s, order: i }));
    updatePayload({ sections: updated });
  };

  const activeSection = useMemo(() => payload.sections?.find(s => s.id === activeSectionId), [payload.sections, activeSectionId]);

  const handleSave = () => {
    onSave({ ...template, status: 'published', publishedAt: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-xl text-slate-500">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">{template.name}</h2>
              <span className="text-[9px] font-black text-white/40 bg-white/5 px-1.5 py-0.5 rounded uppercase">v{template.versions.length}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{template.type.replace('_', ' ')} Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl mr-4">
            <button onClick={() => setIsPreview(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!isPreview ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}>Edit</button>
            <button onClick={() => setIsPreview(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isPreview ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}>Preview</button>
          </div>
          <button onClick={handleSave} className="px-8 py-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">Publish Version</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Library / Sections */}
        <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <div className="p-6 space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Structure</h3>
              <div className="space-y-2">
                {payload.sections?.sort((a,b) => a.order - b.order).map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setActiveSectionId(s.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${activeSectionId === s.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                       {s.locked ? <ICONS.Lock size={12} className="opacity-40" /> : <ICONS.GripVertical size={14} className="opacity-20" />}
                       <span className="text-[10px] font-black uppercase tracking-widest truncate">{s.title}</span>
                    </div>
                    {activeSectionId === s.id && (
                      <div className="flex gap-1">
                         <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'up'); }} className="p-1 hover:bg-black/20 rounded"><ICONS.ChevronRight className="-rotate-90" size={10} /></button>
                         <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'down'); }} className="p-1 hover:bg-black/20 rounded"><ICONS.ChevronRight className="rotate-90" size={10} /></button>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Add Content Block</h3>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_OPTIONS.map(opt => (
                  <button 
                    key={opt.type}
                    onClick={() => addSection(opt.type)}
                    className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 group transition-all"
                  >
                    <span className="text-slate-500 group-hover:text-emerald-500 mb-2">{opt.icon}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: Canvas */}
        <main className="flex-1 bg-slate-950 overflow-y-auto no-scrollbar p-12 flex flex-col items-center">
          <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-[40px] min-h-[1100px] flex flex-col p-20 space-y-12">
            {!payload.sections?.length && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-200 border-4 border-dashed border-slate-50 rounded-[40px] p-20">
                <ICONS.Plus size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Canvas Empty</p>
              </div>
            )}
            
            {payload.sections?.sort((a,b) => a.order - b.order).map(section => (
              <div 
                key={section.id} 
                className={`relative p-8 rounded-3xl transition-all ${activeSectionId === section.id ? 'ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-500/10' : 'hover:bg-slate-50/50'}`}
                onClick={() => setActiveSectionId(section.id)}
              >
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{section.title}</h3>
                </div>
                
                {isPreview ? (
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {renderTemplate(section.content, { clientName: 'Sarah Johnson', jobAddress: '123 Oak St', todayDate: 'Oct 25, 2024' })}
                    </p>
                  </div>
                ) : (
                  <textarea 
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    className="w-full text-lg text-slate-700 leading-relaxed bg-transparent border-none focus:ring-0 p-0 h-32 resize-none"
                    placeholder="Enter section content here..."
                  />
                )}
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT: Inspector */}
        <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          {activeSection ? (
            <div className="p-8 space-y-10">
               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Section Identity</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Display Title</label>
                        <input 
                          type="text" 
                          value={activeSection.title}
                          onChange={(e) => updateSection(activeSection.id, { title: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-white text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Available Variables</h3>
                  <div className="flex flex-wrap gap-2">
                     {['clientName', 'jobAddress', 'jobType', 'todayDate', 'priceTotal'].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateSection(activeSection.id, { content: activeSection.content + ` {{${v}}}` })}
                          className="px-2 py-1 bg-white/5 text-slate-400 hover:text-white rounded text-[10px] font-mono border border-white/5"
                        >
                           {v}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {['normal', 'callout', 'fineprint'].map(s => (
                       <button 
                        key={s}
                        onClick={() => updateSection(activeSection.id, { style: { emphasis: s as any } })}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${activeSection.style.emphasis === s ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}
                       >
                         {s}
                       </button>
                     ))}
                  </div>
               </div>

               {!activeSection.locked && (
                 <div className="pt-10 border-t border-white/5">
                    <button 
                      onClick={() => updatePayload({ sections: payload.sections.filter(s => s.id !== activeSection.id) })}
                      className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <ICONS.Trash2 size={14} /> Remove Block
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
               <ICONS.FileSearch size={40} className="text-slate-500 mb-4" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Select a section to configure properties.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TemplateEditor;
