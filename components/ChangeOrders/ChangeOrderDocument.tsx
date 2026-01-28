
import React, { useState } from 'react';
import { ChangeOrder, ChangeOrderStatus, User, UserRole, COSectionType } from '../../types';
import { ICONS } from '../../constants';

interface ChangeOrderDocumentProps {
  co: ChangeOrder;
  user: User;
  onClose: () => void;
  onSign: (signature: ChangeOrder['signature']) => void;
  onStatusChange: (status: ChangeOrderStatus) => void;
}

const ChangeOrderDocument: React.FC<ChangeOrderDocumentProps> = ({ co, user, onClose, onSign, onStatusChange }) => {
  const [signatureName, setSignatureName] = useState('');
  const [isSignMode, setIsSignMode] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSign = () => {
    if (!signatureName || !agreed) return;
    onSign({
      name: signatureName,
      signedAt: new Date().toISOString(),
      method: 'typed',
      ipPlaceholder: '203.0.113.1'
    });
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-100 overflow-y-auto animate-in fade-in duration-300">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
            <ICONS.ChevronRight className="rotate-180" size={20} />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{co.coNumber} — {co.status.toUpperCase()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{co.jobName}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {isAdmin && co.status === ChangeOrderStatus.DRAFT && (
            <button 
              onClick={() => onStatusChange(ChangeOrderStatus.SENT)}
              className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
            >
              Mark as Sent
            </button>
          )}
          {co.status === ChangeOrderStatus.SENT && (
             <button 
               onClick={() => setIsSignMode(true)}
               className="px-6 py-2.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95 transition-all"
             >
               Sign Document
             </button>
          )}
          <button className="px-6 py-2.5 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white">Export PDF</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto my-12 bg-white shadow-2xl rounded-[48px] overflow-hidden min-h-[1000px] flex flex-col p-16 space-y-12">
        {co.sections.sort((a,b) => a.order - b.order).map((section) => {
          if (!section.isVisible) return null;

          switch (section.type) {
            case COSectionType.HEADER:
              return (
                <div key={section.id} className="flex justify-between items-start border-b border-slate-100 pb-12">
                  <div>
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6">S</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Change Order</h1>
                    <p className="text-lg text-slate-500 mt-2">{co.coNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Address</p>
                    <p className="text-sm font-bold text-slate-900">{co.address}</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest pt-4">Date Created</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(co.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              );

            case COSectionType.REASON:
              return (
                <div key={section.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Request</h3>
                  <p className="text-xl font-black text-slate-900">{co.reason}</p>
                </div>
              );

            case COSectionType.SCOPE:
              return (
                <div key={section.id} className="space-y-4">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">{co.title}</h2>
                   <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{co.description}</p>
                </div>
              );

            case COSectionType.PRICING:
              return (
                <div key={section.id} className="space-y-6">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Impact</h3>
                   <div className="bg-slate-900 rounded-[40px] p-12 text-white flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Final Change Total</p>
                         <h4 className="text-6xl font-black tracking-tighter text-emerald-400">${co.totalWithTax.toLocaleString()}</h4>
                         <p className="text-xs font-bold opacity-60 mt-4">Calculated including {co.taxRate}% HST tax</p>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-3 text-amber-500 mb-2">
                            <ICONS.Clock size={20} />
                            <p className="text-sm font-black uppercase tracking-widest">Timeline Impact</p>
                         </div>
                         <p className="text-3xl font-black">{co.scheduleAffected ? `+ ${co.daysImpact} Work Days` : 'No Impact'}</p>
                      </div>
                   </div>
                </div>
              );

            case COSectionType.SIGNATURE:
              return (
                <div key={section.id} className="pt-12 border-t border-slate-100 space-y-8">
                   {co.status === ChangeOrderStatus.SIGNED ? (
                      <div className="flex items-center gap-8">
                         <div className="flex-1 p-8 bg-emerald-50 border border-emerald-100 rounded-[32px]">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Digitally Signed By</p>
                            <p className="text-4xl font-black text-emerald-900 italic tracking-tight">{co.signature?.name}</p>
                            <div className="mt-6 flex gap-6 text-[10px] font-bold text-emerald-600/60 uppercase">
                               <span>Date: {new Date(co.signature!.signedAt).toLocaleString()}</span>
                            </div>
                         </div>
                         <div className="w-48 h-48 bg-emerald-100 rounded-[32px] flex items-center justify-center text-emerald-500">
                            <ICONS.CheckCircle2 size={100} />
                         </div>
                      </div>
                   ) : isSignMode ? (
                      <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-200 animate-in slide-in-from-bottom-4 space-y-8">
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight">Authorization Signature</h3>
                         <div className="space-y-6">
                            <input 
                              type="text"
                              value={signatureName}
                              onChange={e => setSignatureName(e.target.value)}
                              className="w-full p-6 bg-white border border-slate-200 rounded-3xl font-black text-3xl italic tracking-tight outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                              placeholder="Full Legal Name"
                            />
                            <label className="flex items-start gap-4 cursor-pointer group">
                               <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-6 h-6 rounded-lg accent-emerald-500" />
                               <span className="text-sm font-medium text-slate-600">I authorize the changes outlined in this document.</span>
                            </label>
                         </div>
                         <button onClick={handleSign} disabled={!agreed || !signatureName} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 disabled:opacity-50">Sign & Approve</button>
                      </div>
                   ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
                         <ICONS.Lock className="mx-auto text-slate-200 mb-4" size={48} />
                         <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Waiting for Client Acceptance</p>
                      </div>
                   )}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default ChangeOrderDocument;
