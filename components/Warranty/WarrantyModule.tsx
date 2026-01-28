
import React, { useState, useEffect, useMemo } from 'react';
import { 
  WarrantyCase, 
  WarrantyStatus, 
  WarrantyRecord, 
  Job, 
  User, 
  UserRole, 
  WarrantyPriority,
  IssueType
} from '../../types';
import { ICONS } from '../../constants';
import WarrantyCaseIntake from './WarrantyCaseIntake';
import WarrantyWorkspace from './WarrantyWorkspace';

interface WarrantyModuleProps {
  user: User;
  jobs: Job[];
}

const CASES_KEY = 'synkops_warranty_cases_v1';
const RECORDS_KEY = 'synkops_warranty_records_v1';

const WarrantyModule: React.FC<WarrantyModuleProps> = ({ user, jobs }) => {
  const [cases, setCases] = useState<WarrantyCase[]>([]);
  const [records, setRecords] = useState<WarrantyRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'ALL'>('ALL');
  
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<WarrantyCase | null>(null);

  // Load Data
  useEffect(() => {
    const savedCases = localStorage.getItem(CASES_KEY);
    const savedRecords = localStorage.getItem(RECORDS_KEY);
    if (savedCases) setCases(JSON.parse(savedCases));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  }, []);

  const persistCases = (newCases: WarrantyCase[]) => {
    setCases(newCases);
    localStorage.setItem(CASES_KEY, JSON.stringify(newCases));
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cases, searchQuery, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const last30Days = cases.filter(c => {
      const created = new Date(c.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    });

    return {
      openCount: cases.filter(c => ![WarrantyStatus.CLOSED, WarrantyStatus.RESOLVED, WarrantyStatus.DENIED].includes(c.status)).length,
      highPriority: cases.filter(c => c.priority === WarrantyPriority.HIGH && c.status !== WarrantyStatus.CLOSED).length,
      claimsThisMonth: last30Days.length,
      resolvedRate: cases.length > 0 ? Math.round((cases.filter(c => c.status === WarrantyStatus.CLOSED).length / cases.length) * 100) : 0
    };
  }, [cases]);

  const handleSaveCase = (newCase: WarrantyCase) => {
    const exists = cases.find(c => c.id === newCase.id);
    const updated = exists 
      ? cases.map(c => c.id === newCase.id ? newCase : c)
      : [newCase, ...cases];
    persistCases(updated);
    setIsIntakeOpen(false);
    setSelectedCase(null);
  };

  const handleDeleteCase = (id: string) => {
    if (window.confirm("Permanently delete this service case? This cannot be undone.")) {
      persistCases(cases.filter(c => c.id !== id));
      setSelectedCase(null);
    }
  };

  const getPriorityStyle = (p: WarrantyPriority) => {
    switch (p) {
      case WarrantyPriority.HIGH: return 'bg-red-100 text-red-700 ring-1 ring-red-200';
      case WarrantyPriority.MEDIUM: return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      case WarrantyPriority.LOW: return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    }
  };

  const getStatusStyle = (s: WarrantyStatus) => {
    if ([WarrantyStatus.RESOLVED, WarrantyStatus.CLOSED].includes(s)) return 'bg-emerald-100 text-emerald-700';
    if ([WarrantyStatus.DENIED, WarrantyStatus.PAID_OPTION].includes(s)) return 'bg-slate-100 text-slate-500';
    if (s === WarrantyStatus.NEW) return 'bg-blue-600 text-white shadow-sm';
    return 'bg-slate-100 text-slate-600';
  };

  if (selectedCase) {
    return (
      <WarrantyWorkspace 
        user={user}
        warrantyCase={selectedCase}
        records={records}
        onSave={handleSaveCase}
        onDelete={handleDeleteCase}
        onClose={() => setSelectedCase(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Warranty & Service</h1>
          <p className="text-sm text-slate-500 font-medium">Protect your reputation. Track post-installation lifecycle.</p>
        </div>
        <button 
          onClick={() => setIsIntakeOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
        >
          <ICONS.Plus size={18} /> New Service Request
        </button>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Cases</p>
           <p className="text-3xl font-black text-slate-900">{metrics.openCount}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 shadow-sm">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">High Priority</p>
           <p className="text-3xl font-black text-red-600">{metrics.highPriority}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last 30 Days</p>
           <p className="text-3xl font-black text-slate-900">{metrics.claimsThisMonth}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Closure Rate</p>
           <p className="text-3xl font-black text-emerald-600">{metrics.resolvedRate}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 shrink-0 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by case #, client, or city..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
        >
          <option value="ALL">All Life-Cycle Stages</option>
          {/* Fixed: explicitly type s as string to fix mapping errors */}
          {Object.values(WarrantyStatus).map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case # / Reported</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Address</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warranty?</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCases.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 group transition-colors cursor-pointer" onClick={() => setSelectedCase(c)}>
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900">{c.caseNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-700">{c.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{c.address}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.issueType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityStyle(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${c.warrantyValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                       <span className="text-[10px] font-black uppercase text-slate-600">{c.warrantyValid ? 'Valid Coverage' : 'Out of Warranty'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ICONS.ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ICONS.ShieldCheck size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-bold">No warranty cases found</p>
                <p className="text-slate-400 text-sm">Capture service requests to track them here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isIntakeOpen && (
        <WarrantyCaseIntake 
          jobs={jobs}
          records={records}
          onSave={handleSaveCase}
          onCancel={() => setIsIntakeOpen(false)}
        />
      )}
    </div>
  );
};

export default WarrantyModule;
