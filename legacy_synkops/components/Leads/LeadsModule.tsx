
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadStatus } from '../../types';
import { ICONS } from '../../constants';

interface LeadsModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
}

const STAGES = [
  { id: LeadStatus.NEW, label: 'New', color: 'bg-blue-500', ringColor: 'ring-blue-200', bgColor: 'bg-blue-50/30' },
  { id: LeadStatus.CONTACTED, label: 'Contacted', color: 'bg-indigo-500', ringColor: 'ring-indigo-200', bgColor: 'bg-indigo-50/30' },
  { id: LeadStatus.SITE_VISIT_BOOKED, label: 'Site Visit', color: 'bg-purple-500', ringColor: 'ring-purple-200', bgColor: 'bg-purple-50/30' },
  { id: LeadStatus.ESTIMATE_IN_PROGRESS, label: 'Estimating', color: 'bg-amber-500', ringColor: 'ring-amber-200', bgColor: 'bg-amber-50/30' },
  { id: LeadStatus.WON, label: 'Won', color: 'bg-emerald-500', ringColor: 'ring-emerald-200', bgColor: 'bg-emerald-50/30' },
];

const LeadsModule: React.FC<LeadsModuleProps> = ({ leads, setLeads, updateLeadStatus }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);
  
  const dragCounters = useRef<Record<string, number>>({});

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    address: '',
    projectType: 'Patio',
    budgetRange: '$10k - $25k',
    source: 'Referral',
    notes: ''
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `L${Math.floor(Math.random() * 900) + 100}`,
      createdDate: new Date().toISOString().split('T')[0],
      source: formData.source,
      clientName: formData.clientName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      projectType: formData.projectType,
      budgetRange: formData.budgetRange,
      timeline: '1-3 Months',
      notes: formData.notes,
      status: LeadStatus.NEW,
    };

    setLeads((prev) => [...prev, newLead]);
    setIsModalOpen(false);
    setFormData({
      clientName: '',
      phone: '',
      email: '',
      address: '',
      projectType: 'Patio',
      budgetRange: '$10k - $25k',
      source: 'Referral',
      notes: ''
    });
  };

  const handleConvert = (lead: Lead) => {
    // Navigate to estimates with pre-filled state via state or query params
    // For this implementation, we'll navigate to estimates and trigger the builder
    navigate('/estimates', { state: { convertFromLead: lead } });
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      setDraggedLeadId(leadId);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStage(null);
    dragCounters.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    dragCounters.current[stageId] = (dragCounters.current[stageId] || 0) + 1;
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    dragCounters.current[stageId] = (dragCounters.current[stageId] || 0) - 1;
    if (dragCounters.current[stageId] <= 0) {
      if (dragOverStage === stageId) setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      updateLeadStatus(leadId, stageId);
    }
    handleDragEnd();
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Leads & Opportunities</h1>
          <p className="text-sm text-slate-500 font-medium">Capture incoming requests and drive the sales process.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <ICONS.Plus size={18} /> New Lead
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit shrink-0 border border-slate-200 shadow-inner">
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pipeline
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Ledger
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'pipeline' ? (
          <div className="flex gap-4 overflow-x-auto pb-6 h-full no-scrollbar">
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.status === stage.id);
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
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`
                    flex-1 space-y-4 p-3 rounded-[32px] transition-all duration-300 ease-out border-2 overflow-y-auto no-scrollbar
                    ${isOver 
                      ? `${stage.bgColor} border-dashed border-emerald-300 scale-[1.01] shadow-inner ring-4 ring-emerald-500/5` 
                      : 'bg-transparent border-transparent'}
                  `}>
                    {stageLeads.map((lead) => (
                      <div 
                        key={lead.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className={`
                          bg-white p-5 rounded-[28px] shadow-sm border border-slate-200 
                          hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1
                          transition-all cursor-grab active:cursor-grabbing group active:scale-[0.98] select-none
                          ${draggedLeadId === lead.id ? 'opacity-30 scale-95 rotate-1 grayscale bg-slate-50' : 'opacity-100'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight uppercase text-sm">{lead.clientName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{lead.projectType} • {lead.source}</p>
                          </div>
                          <span className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">#{lead.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-5">
                          <ICONS.MapPin size={12} className="text-slate-300 shrink-0" /> 
                          <span className="truncate">{lead.address}</span>
                        </p>
                        
                        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-50">
                          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex items-center justify-center p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-100 transition-all">
                            <ICONS.Phone size={14} />
                          </a>
                          <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="flex items-center justify-center p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-100 transition-all">
                            <ICONS.Mail size={14} />
                          </a>
                          <button onClick={(e) => { e.stopPropagation(); navigate('/schedule'); }} className="flex items-center justify-center p-2.5 bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl border border-slate-100 transition-all" title="Book Visit">
                            <ICONS.Calendar size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleConvert(lead); }} className="flex items-center justify-center p-2.5 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl shadow-lg transition-all" title="Estimate">
                            <ICONS.FileEdit size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {stageLeads.length === 0 && !isOver && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] opacity-40 transition-all">
                        <ICONS.Plus size={24} className="text-slate-300 mb-1" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Drop Lead</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col">
            <div className="overflow-y-auto no-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Prospect</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Info</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Captured</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 group transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors text-sm uppercase">{lead.clientName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium tracking-tight">
                          <ICONS.MapPin size={10} className="opacity-60" /> {lead.address}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-700 uppercase">{lead.projectType}</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{lead.budgetRange}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`
                          px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                          ${lead.status === LeadStatus.WON ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                            lead.status === LeadStatus.NEW ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                            'bg-slate-50 border-slate-200 text-slate-500'}
                        `}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase">
                        {lead.createdDate}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleConvert(lead)} className="p-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-emerald-600" title="Convert to Estimate">
                            <ICONS.FileEdit size={14} />
                          </button>
                          <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl shadow-sm">
                            <ICONS.MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Opportunity</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lead Capture Pipeline</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all hover:shadow-sm">
                <ICONS.Plus className="rotate-45" size={28} />
              </button>
            </div>
            <form id="lead-form" onSubmit={handleCreateLead} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Client Identity *</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all shadow-inner" placeholder="e.g. Sarah Johnson" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all shadow-inner" placeholder="555-0123" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all shadow-inner" placeholder="name@email.com" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Installation Address</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all shadow-inner" placeholder="123 Maple Dr, Burlington" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Category</label>
                  <select value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xs uppercase tracking-widest appearance-none cursor-pointer">
                    <option>Patio</option>
                    <option>Driveway</option>
                    <option>Pool Surround</option>
                    <option>Retaining Wall</option>
                    <option>Lighting</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Path</label>
                  <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xs uppercase tracking-widest appearance-none cursor-pointer">
                    <option>Referral</option>
                    <option>Google Search</option>
                    <option>Instagram</option>
                    <option>Home Show</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Investment Range</label>
                <select value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xs uppercase tracking-widest appearance-none cursor-pointer">
                  <option>$5k - $10k</option>
                  <option>$10k - $25k</option>
                  <option>$25k - $50k</option>
                  <option>$50k - $100k</option>
                  <option>$100k+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Site Context / Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[32px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all h-40 resize-none shadow-inner" placeholder="Restricted access? Specific paver preference? Drainage concerns?" />
              </div>
            </form>
            <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 px-6 border border-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-white transition-all shadow-sm">Discard</button>
              <button type="submit" form="lead-form" className="flex-[2] py-5 px-6 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all">Create Opportunity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsModule;
