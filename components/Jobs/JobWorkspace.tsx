
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserRole, 
  User as UserType, 
  JobStatus, 
  Job, 
  DailyLog, 
  LogStatus, 
  WarrantyRecord, 
  WarrantyPolicy 
} from '../../types';
import { ICONS } from '../../constants';
import PermitsTab from './Permits/PermitsTab';
import CostingSnapshot from './Costing/CostingSnapshot';
import ProductionPredictor from './Health/ProductionPredictor';

interface JobWorkspaceProps {
  user: UserType;
}

const JobWorkspace: React.FC<JobWorkspaceProps> = ({ user }) => {
  const { id, "*": subPath } = useParams();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    if (!subPath) return 'overview';
    return subPath.split('/')[0] || 'overview';
  }, [subPath]);

  const setActiveTab = (tabId: string) => {
    navigate(`/jobs/${id}/${tabId}`);
  };

  const [job, setJob] = useState<Job>({
    id: id || 'J101',
    clientName: 'Sarah Johnson',
    address: '123 Oak St, Toronto',
    status: JobStatus.IN_PROGRESS,
    crewIds: ['c1'],
    fieldLeadId: 'u1',
    startDate: '2025-05-15',
    targetEndDate: '2025-05-25',
    budgetTotal: 28500,
    hidePricingFromField: true,
    warnings: ['Narrow driveway (7ft max)'],
    locatesConfirmed: true,
    materialsOrdered: true,
    depositPaid: true,
    planUploaded: true,
    gateOverrides: {},
    progressPercent: 85,
    metrics: {
      plannedLaborHours: 120,
      plannedDays: 8,
      plannedUnits: 450,
      actualLaborHours: 102,
      actualDaysElapsed: 6,
      actualUnitsCompleted: 380
    }
  });

  const toggleGate = (key: keyof Pick<Job, 'locatesConfirmed' | 'materialsOrdered' | 'depositPaid' | 'planUploaded'>) => {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.OFFICE) return;
    setJob(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  const allTabs = [
    { id: 'overview', label: 'Overview', icon: <ICONS.Search size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE, UserRole.FIELD_LEAD, UserRole.CREW, UserRole.SUB] },
    { id: 'costing', label: 'Cost Analysis', icon: <ICONS.BarChart3 size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE] },
    { id: 'permits', label: 'Permits & Locates', icon: <ICONS.ShieldCheck size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE, UserRole.FIELD_LEAD] },
    { id: 'checklists', label: 'Checklists', icon: <ICONS.CheckCircle2 size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE, UserRole.FIELD_LEAD, UserRole.CREW] },
    { id: 'logs', label: 'Daily Logs', icon: <ICONS.ClipboardList size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE, UserRole.FIELD_LEAD, UserRole.CREW] },
    { id: 'photos', label: 'Photos', icon: <ICONS.Camera size={16} />, roles: [UserRole.OWNER, UserRole.OFFICE, UserRole.FIELD_LEAD, UserRole.CREW] },
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-4 md:-m-6 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/jobs')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
              <ICONS.ChevronRight className="rotate-180" size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{job.clientName}</h1>
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-blue-100 text-blue-700">
                  {job.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{job.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => navigate(`/logs/edit/new-${job.id}`)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Submit Log</button>
             <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><ICONS.MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          {activeTab === 'overview' && (
             <div className="space-y-10 animate-in fade-in duration-500">
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { key: 'locatesConfirmed', label: 'Utility Locates', icon: <ICONS.MapPin size={18}/>, color: 'blue' },
                     { key: 'materialsOrdered', label: 'Materials Ready', icon: <ICONS.Truck size={18}/>, color: 'emerald' },
                     { key: 'depositPaid', label: 'Deposit Paid', icon: <ICONS.Receipt size={18}/>, color: 'emerald' },
                     { key: 'planUploaded', label: 'Final Plans', icon: <ICONS.ImageIcon size={18}/>, color: 'indigo' },
                   ].map(gate => (
                     <button 
                      key={gate.key}
                      onClick={() => toggleGate(gate.key as any)}
                      disabled={!isAdmin}
                      className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 group ${job[gate.key as keyof Job] ? 'bg-white border-emerald-500 ring-4 ring-emerald-50' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'}`}
                     >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${job[gate.key as keyof Job] ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                           {gate.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${job[gate.key as keyof Job] ? 'text-emerald-700' : 'text-slate-400'}`}>{gate.label}</span>
                        {job[gate.key as keyof Job] ? <ICONS.CheckCircle2 className="text-emerald-500" size={14} /> : <span className="text-[8px] font-black text-slate-300 uppercase">Awaiting</span>}
                     </button>
                   ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <div className="lg:col-span-8 space-y-8">
                      <ProductionPredictor job={job} />

                      <section className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Operational Health</h3>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Sync Active</span>
                         </div>
                         <div className="grid grid-cols-3 gap-10">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Site Progress</p>
                               <p className="text-4xl font-black text-slate-900 tracking-tighter">{job.progressPercent}%</p>
                               <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${job.progressPercent}%` }}></div>
                               </div>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Labor Accuracy</p>
                               <p className="text-4xl font-black text-slate-900 tracking-tighter">92<span className="text-sm opacity-30">%</span></p>
                               <p className="text-[9px] font-bold text-emerald-600 uppercase mt-2">+2.4% vs Target</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Revenue Goal</p>
                               <p className="text-4xl font-black text-slate-900 tracking-tighter">28<span className="text-sm opacity-30">k</span></p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Target Completion: May 25</p>
                            </div>
                         </div>
                      </section>
                   </div>

                   <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-6">Field Warnings</p>
                         {job.warnings?.map((w, i) => (
                           <div key={i} className="flex gap-4 items-start mb-6">
                              <div className="mt-1 p-2 bg-red-500 text-white rounded-xl shadow-lg">
                                 <ICONS.AlertCircle size={18} />
                              </div>
                              <p className="text-sm font-black uppercase tracking-tight">{w}</p>
                           </div>
                         ))}
                         <ICONS.Construction className="absolute -bottom-10 -right-10 opacity-5" size={180} />
                      </div>

                      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                         <div className="space-y-6">
                            {[
                              { time: '2h ago', user: 'John O.', action: 'Photo Upload', detail: '3 Closeout shots' },
                              { time: '5h ago', user: 'Sarah L.', action: 'Materials', detail: 'PO #1042 Received' },
                            ].map((activity, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                    {activity.user.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{activity.action}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">{activity.detail}</p>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">{activity.time}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
          {activeTab === 'costing' && <CostingSnapshot job={job} user={user} />}
          {activeTab === 'permits' && <PermitsTab jobId={job.id} user={user} jobStartDate={job.startDate} />}
          {activeTab === 'logs' && (
             <div className="h-[500px] flex items-center justify-center border-4 border-dashed border-slate-100 rounded-[60px]">
                <div className="text-center">
                   <ICONS.ClipboardList size={48} className="text-slate-200 mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Job Log History</p>
                   <button onClick={() => navigate(`/logs/edit/new-${job.id}`)} className="mt-6 text-xs font-black text-emerald-600 uppercase hover:underline">+ Submit New Daily Log</button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobWorkspace;
