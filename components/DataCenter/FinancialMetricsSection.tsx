
import React, { useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../../types';
import { ICONS } from '../../constants';
import { getJSON, STORAGE_KEYS } from '../../lib/storage';

const FinancialMetricsSection: React.FC = () => {
  // Fix: Used the now-defined STORAGE_KEYS.INVOICES
  const invoices = getJSON<Invoice[]>(STORAGE_KEYS.INVOICES, []);

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
    const balance = invoices.reduce((acc, i) => acc + (i.balance || 0), 0);
    const overdue = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;
    const paid = invoices.filter(i => i.status === InvoiceStatus.PAID).length;
    return { total, balance, overdue, paid };
  }, [invoices]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lifecycle Invoiced</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">${stats.total.toLocaleString()}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base documentation</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Receivables</p>
           <p className="text-4xl font-black text-red-600 tracking-tighter">${stats.balance.toLocaleString()}</p>
           <p className="mt-4 text-[9px] font-bold text-red-400 uppercase tracking-widest">Pending cash flow</p>
        </div>
        <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 shadow-sm transition-all hover:bg-red-100/30">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Overdue Alerts</p>
           <div className="flex items-center gap-4">
              <p className="text-4xl font-black text-red-700 tracking-tighter">{stats.overdue}</p>
              <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                <ICONS.AlertCircle size={20} />
              </div>
           </div>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 shadow-sm transition-all hover:bg-emerald-100/30">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Closed Invoices</p>
           <p className="text-4xl font-black text-emerald-700 tracking-tighter">{stats.paid}</p>
           <p className="mt-4 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">100% Resolved</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Recent Financial Ledger
           </h4>
           <button className="text-[9px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">View All Receivables</button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-5">Reference #</th>
                <th className="px-10 py-5">Job Context</th>
                <th className="px-10 py-5 text-right">Total Doc</th>
                <th className="px-10 py-5 text-right">Current Balance</th>
                <th className="px-10 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.length > 0 ? invoices.slice(0, 15).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 group transition-colors cursor-pointer">
                  <td className="px-10 py-5 text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">{inv.invoiceNumber}</td>
                  <td className="px-10 py-5">
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-tight truncate max-w-[200px]">{inv.jobName}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{inv.clientName}</p>
                  </td>
                  <td className="px-10 py-5 text-sm font-black text-right text-slate-400 uppercase">${(inv.total || 0).toLocaleString()}</td>
                  <td className="px-10 py-5 text-right">
                    <span className={`text-sm font-black ${(inv.balance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${(inv.balance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-10 py-5 text-center">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${
                      inv.status === InvoiceStatus.PAID ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      inv.status === InvoiceStatus.OVERDUE ? 'bg-red-50 border-red-100 text-red-700' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-300 italic uppercase text-[10px] font-black tracking-widest flex flex-col items-center">
                    <ICONS.Receipt size={32} className="mb-4 opacity-10" />
                    Ledger Empty — No invoices recorded in system
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

export default FinancialMetricsSection;