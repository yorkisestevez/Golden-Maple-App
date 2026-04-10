
import React, { useState } from 'react';
import { Invoice, Payment } from '../../types';
import { ICONS } from '../../constants';

interface PaymentModalProps {
  invoice: Invoice;
  onSave: (payment: Payment) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
    invoiceId: invoice.id,
    amount: invoice.balance,
    date: new Date().toISOString().split('T')[0],
    method: 'e-transfer',
    reference: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `PAY-${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record Payment</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{invoice.invoiceNumber} — Balance: ${invoice.balance.toLocaleString()}</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label>
              <input 
                required 
                type="number" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Date</label>
              <input 
                required 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method</label>
             <div className="grid grid-cols-3 gap-2">
                {['e-transfer', 'cash', 'cheque', 'credit card', 'bank transfer', 'other'].map(m => (
                  <button 
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, method: m as any})}
                    className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all text-center ${formData.method === m ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    {m}
                  </button>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference / Notes</label>
            <input 
              type="text" 
              placeholder="e.g. Transaction ID, Cheque #..."
              value={formData.reference}
              onChange={e => setFormData({...formData, reference: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-[24px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all uppercase text-xs tracking-widest shadow-emerald-500/20"
          >
            Confirm Payment Receipt
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
