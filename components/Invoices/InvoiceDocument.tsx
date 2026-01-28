
import React from 'react';
// Fix for line 3: imports consolidated
import { Invoice, Payment, InvoiceStatus } from '../../types';
import { ICONS } from '../../constants';

interface InvoiceDocumentProps {
  invoice: Invoice;
  companyName: string;
  payments: Payment[];
  onClose: () => void;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, companyName, payments, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-slate-100 overflow-y-auto animate-in fade-in duration-300">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
            <ICONS.ChevronRight className="rotate-180" size={20} />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{invoice.invoiceNumber} — {invoice.status.toUpperCase()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{invoice.jobName}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Send Link</button>
          <button className="px-6 py-2.5 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">Print PDF</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto my-12 bg-white shadow-2xl rounded-[48px] overflow-hidden min-h-[1100px] flex flex-col p-20 space-y-12 relative">
        {invoice.status === InvoiceStatus.VOID && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 rotate-[-45deg] z-0">
              <span className="text-[150px] font-black text-red-600 uppercase border-[20px] border-red-600 px-20">VOID</span>
           </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-8">S</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Invoice</h1>
            <p className="text-lg text-slate-500 mt-2 font-bold uppercase tracking-widest">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Details</p>
            <p className="text-sm font-bold text-slate-900">{invoice.jobName}</p>
            {/* Fix for line 50: Accessing address from Invoice */}
            <p className="text-sm font-medium text-slate-500">{invoice.address}</p>
            <div className="pt-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</p>
              <p className="text-sm font-bold text-slate-900">Issued: {new Date(invoice.issueDate).toLocaleDateString()}</p>
              {/* Fix for line 54: Accessing dueDate from Invoice */}
              <p className={`text-sm font-black ${new Date(invoice.dueDate) < new Date() && invoice.status !== InvoiceStatus.PAID ? 'text-red-600' : 'text-slate-900'}`}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-2 gap-12 relative z-10">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                 <p className="text-xl font-black text-slate-900">{invoice.clientName}</p>
                 {/* Fix for line 65: Accessing address from Invoice */}
                 <p className="text-sm text-slate-500 font-medium mt-1">{invoice.address}</p>
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Company Details</p>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                 <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{companyName}</p>
                 <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Professional Hardscape Services</p>
              </div>
           </div>
        </div>

        {/* Line Items */}
        <div className="flex-1 relative z-10">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Fix for line 89: Accessing lineItems from Invoice */}
              {invoice.lineItems.map(item => (
                <tr key={item.id}>
                  <td className="py-6">
                    <p className="text-sm font-black text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{item.category}</p>
                  </td>
                  <td className="py-6 text-center text-sm font-bold text-slate-700">{item.qty} {item.unit}</td>
                  <td className="py-6 text-right text-sm font-bold text-slate-700">${item.unitPrice.toLocaleString()}</td>
                  <td className="py-6 text-right text-sm font-black text-slate-900">${item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Payments */}
        <div className="grid grid-cols-2 gap-20 relative z-10">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment History</p>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <div className="flex items-center gap-3">
                          <ICONS.CheckCircle2 className="text-emerald-500" size={16} />
                          <div>
                            <p className="text-xs font-black text-emerald-900 uppercase tracking-tighter">{p.method}</p>
                            <p className="text-[9px] font-bold text-emerald-600/60">{new Date(p.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <span className="font-black text-emerald-700">-${p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">No payments recorded</p>
              )}
           </div>
           <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                 <span className="uppercase tracking-widest">Subtotal</span>
                 {/* Fix for line 130: Accessing subtotal from Invoice */}
                 <span>${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500 pb-4 border-b">
                 <span className="uppercase tracking-widest">Tax (HST)</span>
                 {/* Fix for line 134: Accessing tax from Invoice */}
                 <span>${invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                 <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Total Investment</span>
                 <span className="text-4xl font-black text-slate-900 tracking-tighter">${invoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end p-6 bg-slate-900 rounded-[32px] text-white">
                 <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Balance Due</span>
                 <span className={`text-2xl font-black ${invoice.balance <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${invoice.balance.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Footer Payment Instructions */}
        <div className="pt-20 border-t border-slate-100 relative z-10 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Instructions</p>
           <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-xs font-bold text-slate-600 leading-relaxed">Please send all e-transfers to <span className="text-slate-900 font-black">billing@synkops.com</span>. Include Invoice Number in the message field. Cheques can be mailed to our main office.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDocument;
