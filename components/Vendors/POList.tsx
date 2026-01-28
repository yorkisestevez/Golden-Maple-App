
import React, { useState, useEffect, useMemo } from 'react';
import { Vendor, User, PurchaseOrder, POStatus } from '../../types';
import { ICONS } from '../../constants';

interface POListProps {
  vendor: Vendor;
  user: User;
}

const PO_STORAGE_KEY = 'synkops_pos_v1';

const POList: React.FC<POListProps> = ({ vendor, user }) => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem(PO_STORAGE_KEY);
    if (saved) {
      const all: PurchaseOrder[] = JSON.parse(saved);
      setPos(all.filter(p => p.vendorId === vendor.id));
    }
  }, [vendor.id]);

  const stats = useMemo(() => {
    return {
      total: pos.reduce((acc, p) => acc + p.totalValue, 0),
      active: pos.filter(p => ![POStatus.RECEIVED, POStatus.CANCELLED].includes(p.status)).length,
      monthly: pos.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    };
  }, [pos]);

  const getStatusStyle = (s: POStatus) => {
    switch (s) {
      case POStatus.ORDERED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case POStatus.RECEIVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case POStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
      case POStatus.PARTIALLY_RECEIVED: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group hover:shadow-xl transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lifecycle Spend</p>
           <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">${stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group hover:shadow-xl transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Orders</p>
           <p className="text-3xl font-black text-slate-900">{stats.active}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1.5">30-Day Activity</p>
           <p className="text-3xl font-black text-emerald-400">{stats.monthly} POs</p>
           <ICONS.TrendingUp className="absolute -bottom-4 -right-4 opacity-5" size={100} />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order # / Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Job</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Investment</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pos.map(po => (
                <tr key={po.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm">{po.poNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(po.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-slate-700 uppercase tracking-tight">{po.jobName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{po.deliveryType}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase">{po.items.length}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(po.status)}`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-sm">
                    ${po.totalValue.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <ICONS.ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pos.length === 0 && (
            <div className="py-24 text-center text-slate-300 flex flex-col items-center gap-4">
              <div className="p-8 bg-slate-50 rounded-full">
                <ICONS.FileText size={48} className="opacity-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Purchase Ledger Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POList;
