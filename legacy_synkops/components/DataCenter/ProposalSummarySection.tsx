
import React, { useMemo } from 'react';
import { Proposal, ProposalStatus } from '../../types';
import { ICONS } from '../../constants';
import { getJSON, STORAGE_KEYS } from '../../lib/storage';

const ProposalSummarySection: React.FC = () => {
  const proposals = getJSON<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);

  const stats = useMemo(() => {
    const total = proposals.length;
    const accepted = proposals.filter(p => p.status === ProposalStatus.ACCEPTED).length;
    const value = proposals.reduce((acc, p) => acc + (p.totalValue || 0), 0);
    const winRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const pendingValue = proposals.filter(p => p.status === ProposalStatus.SENT).reduce((acc, p) => acc + (p.totalValue || 0), 0);
    return { total, accepted, value, winRate, pendingValue };
  }, [proposals]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Proposals</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.total}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lifetime issued</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Win Benchmark</p>
           <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.winRate}%</p>
           <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
              <ICONS.TrendingUp size={12}/> Conversion OK
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Quotations</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">${stats.value.toLocaleString()}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. project value</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pending Pipeline</p>
           <p className="text-4xl font-black text-blue-600 tracking-tighter">${stats.pendingValue.toLocaleString()}</p>
           <p className="mt-4 text-[9px] font-bold text-blue-400 uppercase tracking-widest">Sent awaiting views</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Project Proposal Log
           </h4>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-5">Prospect / Client</th>
                <th className="px-10 py-5">Life-Cycle Status</th>
                <th className="px-10 py-5 text-right">Investment Delta</th>
                <th className="px-10 py-5 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {proposals.length > 0 ? proposals.slice(0, 15).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 group transition-colors">
                  <td className="px-10 py-5 text-sm font-black text-slate-900 uppercase group-hover:text-emerald-700 transition-colors">{p.clientName}</td>
                  <td className="px-10 py-5">
                     <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${
                       p.status === ProposalStatus.ACCEPTED ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' :
                       p.status === ProposalStatus.SENT ? 'bg-blue-50 border-blue-100 text-blue-700' :
                       'bg-slate-100 border-slate-200 text-slate-500'
                     }`}>
                        {p.status}
                     </span>
                  </td>
                  <td className="px-10 py-5 text-sm font-black text-right text-slate-700 tracking-tight">${(p.totalValue || 0).toLocaleString()}</td>
                  <td className="px-10 py-5 text-sm font-bold text-right text-slate-400 uppercase tracking-tighter">{p.createdDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-slate-300 italic uppercase text-[10px] font-black tracking-widest flex flex-col items-center">
                    <ICONS.FileText size={32} className="mb-4 opacity-10" />
                    No proposals generated in current library
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProposalSummarySection;
