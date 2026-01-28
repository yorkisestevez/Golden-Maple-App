
import React, { useState, useMemo } from 'react';
// Fix for line 3: Imports consolidated
import { Invoice, InvoiceType, InvoiceStatus, Job, CompanyConfig, ChangeOrder, ChangeOrderStatus, InvoiceLineItem } from '../../types';
import { ICONS } from '../../constants';

interface InvoiceEditorProps {
  jobs: Job[];
  config: CompanyConfig;
  changeOrders: ChangeOrder[];
  onSave: (invoice: Invoice, linkedCOIds: string[]) => void;
  onCancel: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ jobs, config, changeOrders, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(InvoiceType.DEPOSIT);
  
  const [formData, setFormData] = useState<Partial<Invoice>>({
    id: `INV-${Math.random().toString(36).substr(2, 9)}`,
    invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
    issueDate: new Date().toISOString().split('T')[0],
    // Fix for line 23: Populated dueDate property defined in Invoice interface
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notesClient: 'Thank you for choosing us for your landscape project.',
    notesInternal: ''
  });

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);
  
  const availableCOs = useMemo(() => 
    changeOrders.filter(co => co.jobId === selectedJobId && co.status === ChangeOrderStatus.SIGNED && !co.invoicedAt),
  [changeOrders, selectedJobId]);

  const [selectedCOIds, setSelectedCOIds] = useState<string[]>([]);

  // Step 3 Content Generation Logic
  const handleGenerateContent = () => {
    if (!selectedJob) return;

    let items: InvoiceLineItem[] = [];
    
    if (invoiceType === InvoiceType.DEPOSIT) {
      const depositAmt = selectedJob.budgetTotal * (config.depositPercent / 100);
      items = [{
        id: 'li-1',
        name: `Project Deposit (${config.depositPercent}%)`,
        category: 'Base Contract',
        qty: 1,
        unit: 'EA',
        unitPrice: depositAmt,
        taxable: true,
        total: depositAmt
      }];
    } else if (invoiceType === InvoiceType.CHANGE_ORDER) {
      const selectedCOs = availableCOs.filter(co => selectedCOIds.includes(co.id));
      items = selectedCOs.map(co => ({
        id: `li-co-${co.id}`,
        name: `Change Order ${co.coNumber}: ${co.title}`,
        category: 'Change Order',
        qty: 1,
        unit: 'EA',
        unitPrice: co.priceDelta,
        taxable: true,
        total: co.priceDelta
      }));
    } else if (invoiceType === InvoiceType.FINAL) {
      // Logic for calculating remaining balance would go here
      const amt = selectedJob.budgetTotal * 0.1; // Placeholder: Final 10%
      items = [{
        id: 'li-final',
        name: 'Final Project Milestone (Remaining Balance)',
        category: 'Base Contract',
        qty: 1,
        unit: 'EA',
        unitPrice: amt,
        taxable: true,
        total: amt
      }];
    } else {
      items = [{
        id: 'li-custom',
        name: 'Progress Milestone',
        category: 'Base Contract',
        qty: 1,
        unit: 'EA',
        unitPrice: 5000,
        taxable: true,
        total: 5000
      }];
    }

    const sub = items.reduce((acc, i) => acc + i.total, 0);
    const tax = sub * (config.hstPercent / 100);
    
    // Fix for line 103: Updating state with address which is now defined in Invoice interface
    setFormData({
      ...formData,
      jobId: selectedJob.id,
      jobName: selectedJob.clientName,
      address: selectedJob.address,
      clientName: selectedJob.clientName,
      type: invoiceType,
      lineItems: items,
      subtotal: sub,
      tax: tax,
      total: sub + tax,
      balance: sub + tax
    });
    setStep(4);
  };

  const finalize = () => {
    // Fix for line 120: Populated updatedAt defined in Invoice interface
    onSave({
      ...formData as Invoice,
      status: InvoiceStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, selectedCOIds);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Invoice Wizard</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Step {step} of 4</p>
          </div>
        </div>
        <div className="flex gap-2">
           {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest">Back</button>}
           {step === 4 && <button onClick={finalize} className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">Create Draft</button>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-12 flex justify-center">
        <div className="w-full max-w-xl space-y-8">
          
          {step === 1 && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-bottom-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Select Target Job</h2>
                <p className="text-sm text-slate-400 font-medium">Every invoice must be linked to a project.</p>
              </div>
              <div className="space-y-3">
                {jobs.map(j => (
                  <button 
                    key={j.id} 
                    onClick={() => { setSelectedJobId(j.id); setStep(2); }}
                    className={`w-full p-6 text-left border rounded-[32px] transition-all flex items-center justify-between group ${selectedJobId === j.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
                  >
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-emerald-700">{j.clientName}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{j.address}</p>
                    </div>
                    <ICONS.ChevronRight size={20} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-right-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Billing Phase</h2>
                <p className="text-sm text-slate-400 font-medium">Select the type of invoice for {selectedJob?.clientName}.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[InvoiceType.DEPOSIT, InvoiceType.PROGRESS, InvoiceType.CHANGE_ORDER, InvoiceType.FINAL].map(t => (
                  <button 
                    key={t}
                    onClick={() => { setInvoiceType(t); setStep(3); }}
                    className={`p-6 text-left border rounded-3xl transition-all flex items-center justify-between group ${invoiceType === t ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
                  >
                    <span className="font-black text-slate-700 uppercase tracking-widest text-sm">{t}</span>
                    <ICONS.ChevronRight size={18} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-right-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Invoicing Details</h2>
                {invoiceType === InvoiceType.CHANGE_ORDER ? (
                   <p className="text-sm text-slate-400 font-medium">Select the signed Change Orders to include.</p>
                ) : (
                   <p className="text-sm text-slate-400 font-medium">Review parameters before generating content.</p>
                )}
              </div>

              {invoiceType === InvoiceType.CHANGE_ORDER && (
                <div className="space-y-3">
                  {availableCOs.length > 0 ? availableCOs.map(co => (
                    <label key={co.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
                       <input 
                         type="checkbox" 
                         checked={selectedCOIds.includes(co.id)}
                         onChange={e => {
                            if (e.target.checked) setSelectedCOIds([...selectedCOIds, co.id]);
                            else setSelectedCOIds(selectedCOIds.filter(id => id !== co.id));
                         }}
                         className="w-5 h-5 rounded-lg accent-emerald-500"
                       />
                       <div className="flex-1">
                          <p className="font-bold text-slate-900">{co.title}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{co.coNumber} — ${co.totalWithTax.toLocaleString()}</p>
                       </div>
                    </label>
                  )) : <p className="text-center py-10 text-slate-400 italic">No uninvoiced signed Change Orders for this job.</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Date</label>
                   <input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                   {/* Fix for line 230: Accessing dueDate property correctly in setLog */}
                   <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
              </div>

              <button 
                onClick={handleGenerateContent}
                disabled={invoiceType === InvoiceType.CHANGE_ORDER && selectedCOIds.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50"
              >
                Generate Invoice Preview
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-10 animate-in zoom-in-95">
               <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">S</div>
                  <div className="text-right">
                     <h3 className="text-2xl font-black text-slate-900 uppercase">Draft Preview</h3>
                     <p className="text-xs text-slate-400 font-bold">{formData.invoiceNumber}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Line Items</p>
                  {/* Fix for line 256: Accessing lineItems from formData */}
                  {formData.lineItems?.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-50">
                       <div>
                          <p className="font-black text-slate-800 text-sm">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                       </div>
                       <p className="font-black text-slate-900">${item.total.toLocaleString()}</p>
                    </div>
                  ))}
               </div>

               <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                     <span>Subtotal</span>
                     {/* Fix for line 270: Accessing subtotal from formData */}
                     <span>${formData.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                     <span>Tax ({config.hstPercent}%)</span>
                     {/* Fix for line 274: Accessing tax from formData */}
                     <span>${formData.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t flex justify-between items-center">
                     <span className="font-black text-slate-900 uppercase text-sm tracking-widest">Total Due</span>
                     <span className="text-2xl font-black text-emerald-600">${formData.total?.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
