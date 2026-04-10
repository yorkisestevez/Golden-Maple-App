
import React, { useState } from 'react';
// Fix for line 3: Imports from types.ts consolidated
import { Proposal, ProposalSection, ProposalSectionType, Estimate, CompanyConfig, ProposalStatus } from '../../types';
import { ICONS } from '../../constants';

interface ProposalEditorProps {
  proposal: Proposal;
  estimate: Estimate;
  onSave: (proposal: Proposal) => void;
  onCancel: () => void;
  config: CompanyConfig;
}

const SECTION_TEMPLATES = [
  { type: ProposalSectionType.HERO, title: 'Cover/Hero', icon: <ICONS.Camera size={14} /> },
  { type: ProposalSectionType.WELCOME, title: 'Welcome Intro', icon: <ICONS.User size={14} /> },
  { type: ProposalSectionType.PROJECT_UNDERSTANDING, title: 'Project Vision', icon: <ICONS.Search size={14} /> },
  { type: ProposalSectionType.SCOPE, title: 'Scope of Work', icon: <ICONS.FileEdit size={14} /> },
  { type: ProposalSectionType.MATERIALS, title: 'Materials List', icon: <ICONS.Truck size={14} /> },
  { type: ProposalSectionType.PROCESS, title: 'Our Process', icon: <ICONS.RefreshCcw size={14} /> },
  { type: ProposalSectionType.TIMELINE, title: 'Timeline', icon: <ICONS.Clock size={14} /> },
  { type: ProposalSectionType.INVESTMENT, title: 'Investment', icon: <ICONS.Receipt size={14} /> },
  { type: ProposalSectionType.WARRANTY, title: 'Warranty', icon: <ICONS.ShieldCheck size={14} /> },
  { type: ProposalSectionType.SIGNATURE, title: 'Acceptance', icon: <ICONS.CheckCircle2 size={14} /> },
];

const ProposalEditor: React.FC<ProposalEditorProps> = ({ proposal: initialProposal, estimate, onSave, onCancel, config }) => {
  const [proposal, setProposal] = useState<Proposal>(initialProposal);
  // Fix for line 29: Accessing sections property from Proposal interface
  const [activeSectionId, setActiveSectionId] = useState<string>(initialProposal.sections[0]?.id || '');

  const addSection = (type: ProposalSectionType, title: string) => {
    const newSection: ProposalSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      isVisible: true,
      content: {}
    };
    // Fix for line 39: Appending to sections array in Proposal
    setProposal(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setActiveSectionId(newSection.id);
  };

  const updateSection = (id: string, updates: any) => {
    // Fix for line 46: Mapping over sections array in Proposal
    setProposal(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...updates } } : s)
    }));
  };

  // Fix for line 50: Finding section in Proposal sections
  const activeSection = proposal.sections.find(s => s.id === activeSectionId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{proposal.clientName} Proposal</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">v{estimate.version}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{proposal.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-white transition-all"
          >
            <ICONS.Search size={16} /> Preview Link
          </button>
          <button 
            // Fix for line 76: Populated sentDate which is defined in Proposal interface
            onClick={() => onSave({ ...proposal, status: ProposalStatus.SENT, sentDate: new Date().toISOString() })}
            className="px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
          >
            Send to Client
          </button>
          <button 
            onClick={() => onSave(proposal)}
            className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: SECTIONS */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Proposal Sections</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {/* Fix for line 97: Accessing sections from Proposal */}
            {proposal.sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeSectionId === section.id 
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'text-slate-500 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-slate-300 font-black">{idx + 1}</span>
                <span className="truncate">{section.title}</span>
                {!section.isVisible && <ICONS.AlertCircle size={14} className="ml-auto text-slate-300" />}
              </button>
            ))}
            
            <div className="pt-6 mt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4">Add Content</h4>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_TEMPLATES.map(tmpl => (
                  <button 
                    key={tmpl.type}
                    onClick={() => addSection(tmpl.type, tmpl.title)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-emerald-300 hover:bg-white transition-all text-slate-500 group"
                  >
                    <span className="mb-1 group-hover:text-emerald-600">{tmpl.icon}</span>
                    <span className="text-[9px] font-black uppercase text-center">{tmpl.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: LIVE PREVIEW CANVAS */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-8 no-scrollbar flex justify-center">
          <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[40px] overflow-hidden min-h-[1400px]">
            {/* RENDER ACTIVE SECTION CONTENT */}
            {activeSection?.type === ProposalSectionType.HERO && (
              <div className="relative h-[600px] flex items-center justify-center bg-slate-900">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1558904541-efa8c1965f1e?q=80&w=2000')] bg-cover bg-center"></div>
                <div className="relative z-10 text-center px-12">
                  <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black">S</div>
                  <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
                    {activeSection.content.title || 'Outdoor Living Project'}
                  </h1>
                  <p className="text-2xl text-white/80 font-medium">
                    {activeSection.content.tagline || 'Building Your Dream Escape'}
                  </p>
                  <div className="mt-12 h-1 w-24 bg-emerald-500 mx-auto rounded-full"></div>
                  <p className="mt-8 text-white/60 font-black uppercase tracking-widest text-sm">{proposal.clientName}</p>
                </div>
              </div>
            )}

            {activeSection?.type === ProposalSectionType.WELCOME && (
              <div className="p-20 max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Introduction</h2>
                <div className="prose prose-slate prose-xl text-slate-600 leading-relaxed">
                   <p>{activeSection.content.text}</p>
                   <p className="mt-8">We take pride in our "Build Once, Build Right" philosophy. Every paver, every stone, and every joint is installed to meet or exceed the highest industry standards for drainage and longevity.</p>
                </div>
                <div className="mt-16 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-900">JO</div>
                  <div>
                    <p className="font-bold text-slate-900">John Owner</p>
                    <p className="text-sm text-slate-500">Founder & Project Manager</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection?.type === ProposalSectionType.SCOPE && (
              <div className="p-20">
                <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Scope of Work</h2>
                <div className="space-y-12">
                  {estimate.blocks.map((block, idx) => (
                    <div key={block.id} className="flex gap-10 border-b border-slate-100 pb-12 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 mb-4">{block.name}</h3>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                          {block.clientNotes || `Professional installation of ${block.name} following our standard multi-step process for preparation, base compaction, and structural integrity.`}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Coverage Area</span>
                             <span className="text-lg font-bold text-slate-700">{block.qty} {block.unit}</span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Key Materials</span>
                             <span className="text-lg font-bold text-slate-700">{block.materials.length} Premium Products</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection?.type === ProposalSectionType.INVESTMENT && (
              <div className="p-20 bg-slate-50/50">
                 <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Investment Summary</h2>
                 <div className="bg-white rounded-[32px] shadow-xl p-10 border border-slate-100">
                    <div className="space-y-6 mb-10">
                       <div className="flex justify-between items-center text-xl">
                          <span className="text-slate-500 font-bold">Base Project Value</span>
                          <span className="font-black text-slate-900">${estimate.totalValue.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="font-bold">Estimated Tax (HST {config.hstPercent}%)</span>
                          <span>Included in total</span>
                       </div>
                       <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                          <div>
                             <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Total Estimated Investment</p>
                             <h4 className="text-5xl font-black text-slate-900 tracking-tighter">${estimate.totalValue.toLocaleString()}</h4>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Deposit Required</p>
                             <p className="text-xl font-bold text-slate-900">${estimate.depositRequired.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-sm font-medium leading-relaxed">
                       <p><span className="font-black uppercase text-[10px] tracking-widest mr-2">Payment Terms:</span> 50% Deposit to secure your spot on the schedule. Progress draws billed at milestones. Final 10% on project completion and site walk-through.</p>
                    </div>
                 </div>
              </div>
            )}
            
            {activeSection?.type === ProposalSectionType.SIGNATURE && (
              <div className="p-20 text-center">
                 <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Ready to Start?</h2>
                 <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto">Digitally sign below to accept this proposal and begin the construction process.</p>
                 <div className="w-full max-w-md mx-auto aspect-[3/1] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
                    <p className="text-slate-300 font-bold uppercase text-xs tracking-widest">Sign Here on Completion</p>
                 </div>
                 <div className="mt-8 text-slate-400 text-xs font-medium">By signing, you agree to the terms, conditions, and warranty policies outlined in this proposal.</div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: SETTINGS */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Section Settings</h3>
            <button className="text-slate-300 hover:text-red-500"><ICONS.Plus className="rotate-45" size={18} /></button>
          </div>
          <div className="p-6 space-y-6">
            {activeSection ? (
              <>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Section Title</label>
                   <input 
                     type="text"
                     value={activeSection.title}
                     // Fix for line 259: Mapping over sections in Proposal
                     onChange={e => setProposal(prev => ({ ...prev, sections: prev.sections.map(s => s.id === activeSection.id ? { ...s, title: e.target.value } : s) }))}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                   />
                </div>
                
                {activeSection.type === ProposalSectionType.HERO && (
                  <>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Headline</label>
                       <input 
                         type="text"
                         value={activeSection.content.title || ''}
                         onChange={e => updateSection(activeSection.id, { title: e.target.value })}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                       <input 
                         type="text"
                         value={activeSection.content.tagline || ''}
                         onChange={e => updateSection(activeSection.id, { tagline: e.target.value })}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                  </>
                )}

                {activeSection.type === ProposalSectionType.WELCOME && (
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Text</label>
                     <textarea 
                       value={activeSection.content.text || ''}
                       onChange={e => updateSection(activeSection.id, { text: e.target.value })}
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none"
                     />
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Visible to Client</span>
                  <button 
                    // Fix for line 301: Mapping over sections in Proposal
                    onClick={() => setProposal(prev => ({ ...prev, sections: prev.sections.map(s => s.id === activeSection.id ? { ...s, isVisible: !s.isVisible } : s) }))}
                    className={`w-10 h-6 rounded-full transition-all relative ${activeSection.isVisible ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activeSection.isVisible ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 text-sm italic">Select a section to edit its settings.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProposalEditor;
