
import React, { useState, useEffect, useMemo } from 'react';
import { ChangeOrder, ChangeOrderStatus, Job, User, UserRole } from '../../types';
import { ICONS } from '../../constants';
import ChangeOrderEditor from './ChangeOrderEditor';
import ChangeOrderDocument from './ChangeOrderDocument';

interface ChangeOrdersModuleProps {
  user: User;
  jobs: Job[];
}

const STORAGE_KEY = 'synkops_change_orders_v1';

const ChangeOrdersModule: React.FC<ChangeOrdersModuleProps> = ({ user, jobs }) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChangeOrderStatus | 'ALL'>('ALL');
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDocViewOpen, setIsDocViewOpen] = useState(false);
  const [selectedCO, setSelectedCO] = useState<ChangeOrder | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setChangeOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse change orders", e);
      }
    }
  }, []);

  const saveCOs = (newCOs: ChangeOrder[]) => {
    setChangeOrders(newCOs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCOs));
  };

  const filteredCOs = useMemo(() => {
    return changeOrders.filter(co => {
      const matchesSearch = searchQuery === '' || 
        co.coNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        co.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        co.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || co.status === statusFilter;
      const matchesJob = jobFilter === 'ALL' || co.jobId === jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [changeOrders, searchQuery, statusFilter, jobFilter]);

  const handleCreateNew = () => {
    setSelectedCO(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (co: ChangeOrder) => {
    if (co.status === ChangeOrderStatus.SIGNED || co.status === ChangeOrderStatus.VOID) {
      setSelectedCO(co);
      setIsDocViewOpen(true);
      return;
    }
    setSelectedCO(co);
    setIsEditorOpen(true);
  };

  const handleViewDoc = (co: ChangeOrder) => {
    setSelectedCO(co);
    setIsDocViewOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this Change Order? This action cannot be undone.")) {
      const updated = changeOrders.filter(co => co.id !== id);
      saveCOs(updated);
    }
  };

  const onSave = (co: ChangeOrder) => {
    const exists = changeOrders.find(item => item.id === co.id);
    const newCOs = exists 
      ? changeOrders.map(item => item.id === co.id ? co : item)
      : [...changeOrders, co];
    saveCOs(newCOs);
    setIsEditorOpen(false);
  };

  const getStatusStyle = (status: ChangeOrderStatus) => {
    switch (status) {
      case ChangeOrderStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case ChangeOrderStatus.PENDING_APPROVAL: return 'bg-amber-100 text-amber-700';
      case ChangeOrderStatus.APPROVED: return 'bg-blue-100 text-blue-700';
      case ChangeOrderStatus.SENT: return 'bg-indigo-100 text-indigo-700';
      case ChangeOrderStatus.SIGNED: return 'bg-emerald-100 text-emerald-700';
      case ChangeOrderStatus.DECLINED: return 'bg-red-100 text-red-700';
      case ChangeOrderStatus.VOID: return 'bg-slate-200 text-slate-400 line-through';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Change Orders</h1>
          <p className="text-sm text-slate-500 font-medium">Manage project scope changes and upsells.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
        >
          <ICONS.Plus size={18} /> New Change Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 shrink-0 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search COs..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          {/* Fixed: cast enum to string for replace operation */}
          {Object.values(ChangeOrderStatus).map(s => <option key={s as string} value={s as string}>{(s as string).replace('_', ' ')}</option>)}
        </select>

        <select 
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
        >
          <option value="ALL">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CO # / Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job / Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCOs.map(co => (
                <tr key={co.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">{co.coNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(co.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-700">{co.jobName}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{co.address}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-600 truncate max-w-[200px]">{co.title}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(co.status)}`}>
                      {co.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-sm font-black ${co.priceDelta >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                      {co.priceDelta >= 0 ? '+' : ''}${co.totalWithTax.toLocaleString()}
                    </div>
                    {co.daysImpact > 0 && <div className="text-[9px] text-amber-600 font-bold uppercase mt-1">+{co.daysImpact} Days</div>}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleViewDoc(co)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                        title="View Document"
                      >
                        <ICONS.FileText size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(co)}
                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                        title="Edit / Process"
                      >
                        <ICONS.FileEdit size={16} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(co.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                          title="Delete Permanently"
                        >
                          <ICONS.Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCOs.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ICONS.RefreshCcw size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-bold">No change orders found</p>
                <p className="text-slate-400 text-sm">Create a change order to document scope creep or upgrades.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <ChangeOrderEditor 
          user={user}
          jobs={jobs}
          initialCO={selectedCO}
          onSave={onSave}
          onCancel={() => setIsEditorOpen(false)}
          onDelete={handleDelete}
        />
      )}

      {isDocViewOpen && selectedCO && (
        <ChangeOrderDocument 
          co={selectedCO}
          user={user}
          onClose={() => setIsDocViewOpen(false)}
          onSign={(signature) => {
            const updated = { ...selectedCO, status: ChangeOrderStatus.SIGNED, signature };
            onSave(updated);
            setIsDocViewOpen(false);
          }}
          onStatusChange={(status) => {
            onSave({ ...selectedCO, status });
            setIsDocViewOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ChangeOrdersModule;
