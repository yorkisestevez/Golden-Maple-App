
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Fix for line 4: imports now match types.ts
// Fix: Added missing EstimateStatus, BuildSystem, and AccessCondition to imports
import { Proposal, ProposalStatus, Estimate, CompanyConfig, ProposalSectionType, Job, EstimateStatus, BuildSystem, AccessCondition } from '../../types';
import { ICONS } from '../../constants';
import ProposalEditor from './ProposalEditor';
import JobPickerModal from '../QuickActions/JobPickerModal';
import { createProposalDraft, saveProposal, listProposals } from '../../lib/proposals/store';

interface ProposalsModuleProps {
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  estimates: Estimate[];
  config: CompanyConfig;
}

const STAGES = [
  { id: ProposalStatus.DRAFT, label: 'Draft', color: 'bg-slate-400' },
  { id: ProposalStatus.SENT, label: 'Sent', color: 'bg-blue-500' },
  { id: ProposalStatus.VIEWED, label: 'Viewed', color: 'bg-indigo-500' },
  { id: ProposalStatus.ACCEPTED, label: 'Accepted', color: 'bg-emerald-500' },
  { id: ProposalStatus.DECLINED, label: 'Declined', color: 'bg-red-500' },
];

const ProposalsModule: React.FC<ProposalsModuleProps> = ({ proposals, setProposals, updateProposalStatus, estimates, config }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState<'pipeline' | 'list'>('pipeline');
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<ProposalStatus | null>(null);

  // Sync proposals with store if needed, but App.tsx is the owner for now.
  // We handle navigation to ProposalsModule with an ID.
  const activeProposal = proposals.find(p => p.id === id);

  const handleCreateNewClick = () => {
    setIsJobPickerOpen(true);
  };

  const handleJobSelected = (job: Job) => {
    // Check if there is an existing estimate for this job to use as base
    // This is a simplified lookup
    const estimate = estimates.find(e => e.clientName === job.clientName);
    
    const draft = createProposalDraft({
      jobId: job.id,
      jobName: job.clientName,
      clientName: job.clientName,
      estimateId: estimate?.id,
      totalValue: estimate?.totalValue || 0
    });

    setProposals(prev => [draft, ...prev]);
    setIsJobPickerOpen(false);
    navigate(`/proposals/${draft.id}`);
  };

  const handleSkipJob = () => {
    const draft = createProposalDraft({
      clientName: 'New Proposal'
    });
    setProposals(prev => [draft, ...prev]);
    setIsJobPickerOpen(false);
    navigate(`/proposals/${draft.id}`);
  };

  const handleDragStart = (e: React.DragEvent, propId: string) => {
    e.dataTransfer.setData('proposalId', propId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: ProposalStatus) => {
    e.preventDefault();
    const propId = e.dataTransfer.getData('proposalId');
    updateProposalStatus(propId, stageId);
    setDragOverStage(null);
  };

  if (id && activeProposal) {
    // Find associated estimate for the editor
    // Fix for line 83: Accessing estimateId on proposal
    const associatedEstimate = estimates.find(e => e.id === activeProposal.estimateId);
    
    // Create a mock estimate if none exists so the editor doesn't crash
    // Fix for line 91 & 96: Populated safe estimate with required properties
    const safeEstimate: Estimate = associatedEstimate || {
      id: 'MOCK-EST',
      version: 1,
      status: EstimateStatus.DRAFT,
      clientName: activeProposal.clientName,
      address: activeProposal.address,
      projectType: 'General',
      blocks: [],
      createdDate: new Date().toISOString(),
      totalValue: activeProposal.totalValue,
      depositRequired: activeProposal.depositRequired,
      buildSystem: BuildSystem.STANDARD,
      accessConditions: AccessCondition.NORMAL
    };

    return (
      <ProposalEditor 
        proposal={activeProposal}
        estimate={safeEstimate}
        onSave={(updated) => {
          saveProposal(updated);
          setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
          navigate('/proposals');
        }}
        onCancel={() => navigate('/proposals')}
        config={config}
      />
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
          <p className="text-sm text-slate-500">Premium design-build presentations.</p>
        </div>
        <button 
          onClick={handleCreateNewClick} 
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
        >
          Create Proposal
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit shrink-0 border border-slate-200">
        <button onClick={() => setActiveTab('pipeline')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Pipeline</button>
        <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>List View</button>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'pipeline' ? (
          <div className="flex gap-4 overflow-x-auto pb-6 h-full no-scrollbar">
            {STAGES.map(stage => (
              <div 
                key={stage.id} 
                className="min-w-[320px] flex-1 flex flex-col"
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="flex items-center gap-2 mb-4 px-2">
                  <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stage.label}</h3>
                  <span className="ml-auto bg-slate-100 text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    {proposals.filter(p => p.status === stage.id).length}
                  </span>
                </div>
                <div className={`flex-1 p-2 rounded-[24px] transition-colors ${dragOverStage === stage.id ? 'bg-emerald-50/50 border-2 border-dashed border-emerald-200' : 'bg-transparent border-2 border-transparent'}`}>
                  {proposals.filter(p => p.status === stage.id).map(prop => (
                    <div 
                      key={prop.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, prop.id)} 
                      onClick={() => navigate(`/proposals/${prop.id}`)} 
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-3 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{prop.clientName}</h4>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">#{prop.id.split('-')[1]}</span>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">${prop.totalValue.toLocaleString()}</p>
                    </div>
                  ))}
                  {proposals.filter(p => p.status === stage.id).length === 0 && (
                    <div className="py-10 text-center opacity-20 flex flex-col items-center">
                       <ICONS.Plus size={20} className="mb-1" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {proposals.map(p => (
                    <tr key={p.id} onClick={() => navigate(`/proposals/${p.id}`)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900 group-hover:text-emerald-700">{p.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Issued: {p.createdDate}</p>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">${p.totalValue.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          p.status === ProposalStatus.ACCEPTED ? 'bg-emerald-100 text-emerald-700' :
                          p.status === ProposalStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-slate-300 group-hover:text-emerald-500">
                        <ICONS.ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {proposals.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                   <p className="italic">No proposals generated yet.</p>
                </div>
             )}
          </div>
        )}
      </div>

      {isJobPickerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsJobPickerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Project Context</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Proposal Wizard</p>
               </div>
               <button onClick={() => setIsJobPickerOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                  <ICONS.Plus className="rotate-45" size={24} />
               </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
               {/* Note: In a real app, you'd fetch active jobs from synkops_jobs_v1. 
                  Using the Jobs list provided in props for now (or getting it from localStorage)
               */}
               {getJSON<Job[]>('synkops_jobs_v1', []).filter(j => j.status !== 'CLOSED').map(job => (
                 <button 
                  key={job.id} 
                  onClick={() => handleJobSelected(job)}
                  className="w-full p-6 text-left bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-200 rounded-3xl transition-all group"
                 >
                    <p className="font-black text-slate-900 group-hover:text-emerald-700 uppercase text-sm">{job.clientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{job.address}</p>
                 </button>
               ))}
               {getJSON<Job[]>('synkops_jobs_v1', []).length === 0 && (
                 <p className="text-center py-6 text-slate-400 italic text-sm">No active jobs found to link.</p>
               )}
            </div>

            <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
               <button 
                onClick={handleSkipJob}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all"
               >
                 Create Blank Draft
               </button>
               <button 
                onClick={() => setIsJobPickerOpen(false)}
                className="w-full py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal storage helper mock
const getJSON = <T,>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try { return JSON.parse(item); } catch (e) { return fallback; }
};

export default ProposalsModule;