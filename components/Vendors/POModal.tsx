import React, { useState, useMemo } from 'react';
// Fix for line 3: Imports consolidated
import { Vendor, PurchaseOrder, POStatus, POLineItem, Job, CatalogItem } from '../../types';
import { ICONS } from '../../constants';

interface POModalProps {
  vendor: Vendor;
  onSave: (po: PurchaseOrder) => void;
  onCancel: () => void;
}

const POModal: React.FC<POModalProps> = ({ vendor, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [items, setItems] = useState<POLineItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [window, setWindow] = useState('');
  
  // Mock Jobs for selection
  const jobs: Partial<Job>[] = [
    { id: 'J1', clientName: 'Sarah Johnson', address: '123 Oak St' },
    { id: 'J2', clientName: 'Mike Ross', address: '45 Pine Ave' }
  ];

  // Fix for line 26: unitCost renamed to unitPrice to match POLineItem interface
  const totalValue = useMemo(() => items.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0), [items]);

  const handleAddItem = (catalogItem: CatalogItem) => {
    const exists = items.find(i => i.id === catalogItem.id);
    if (exists) {
      setItems(items.map(i => i.id === catalogItem.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      // Fix for line 38: Accessing tradePrice via the pricing object in CatalogItem
      // Fix for line 39: unitCost renamed to unitPrice to match POLineItem interface
      setItems([...items, { 
        id: catalogItem.id, 
        name: catalogItem.name, 
        qty: 1, 
        unit: catalogItem.unitOfMeasure, 
        unitPrice: catalogItem.pricing.tradePrice, 
        receivedQty: 0 
      }]);
    }
  };

  const handleFinalize = () => {
    const job = jobs.find(j => j.id === selectedJobId);
    // Fix for line 44: Populating all mandatory PurchaseOrder fields defined in types.ts
    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      jobId: selectedJobId,
      jobName: job?.clientName || 'N/A',
      status: POStatus.ORDERED,
      items: items,
      deliveryType: deliveryType,
      requestedWindow: window || 'ASAP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalValue: totalValue
    };
    onSave(newPO);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onCancel} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Procurement Pipeline</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">PO for {vendor.name}</p>
           </div>
           <button onClick={onCancel} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400">
              <ICONS.Plus className="rotate-45" size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* STEP NAVIGATION / LEFT PANEL */}
          <div className="w-80 border-r border-slate-100 bg-slate-50/50 p-8 space-y-6">
             {[
               { s: 1, label: 'Job & Logistics', icon: <ICONS.Briefcase size={16} /> },
               { s: 2, label: 'Select Materials', icon: <ICONS.Layers size={16} /> },
               { s: 3, label: 'Review & Order', icon: <ICONS.CheckCircle2 size={16} /> }
             ].map(i => (
               <div key={i.s} className={`flex items-center gap-4 transition-all ${step === i.s ? 'translate-x-2' : 'opacity-40 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step === i.s ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                    {i.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{i.label}</span>
               </div>
             ))}

             <div className="pt-20">
                <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">PO Estimate</p>
                   <p className="text-3xl font-black text-emerald-400 tracking-tighter">${totalValue.toLocaleString()}</p>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
             {step === 1 && (
               <div className="space-y-10 animate-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Job Linkage</h3>
                    <p className="text-sm font-medium text-slate-400">Every purchase order must be assigned to a project for costing.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {jobs.map(j => (
                      <button 
                        key={j.id} 
                        onClick={() => setSelectedJobId(j.id!)}
                        className={`w-full p-6 rounded-[28px] border-2 text-left transition-all flex items-center justify-between group ${selectedJobId === j.id ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                      >
                         <div>
                            <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm">{j.clientName}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-tighter">{j.address}</p>
                         </div>
                         {selectedJobId === j.id && <ICONS.CheckCircle2 className="text-emerald-600" size={24} />}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Type</h4>
                    <div className="flex gap-4">
                       <button onClick={() => setDeliveryType('delivery')} className={`flex-1 p-6 rounded-[24px] border-2 font-black uppercase text-xs tracking-widest transition-all ${deliveryType === 'delivery' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>Standard Delivery</button>
                       <button onClick={() => setDeliveryType('pickup')} className={`flex-1 p-6 rounded-[24px] border-2 font-black uppercase text-xs tracking-widest transition-all ${deliveryType === 'pickup' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>Crew Pickup</button>
                    </div>
                  </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-10 animate-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Select Materials</h3>
                    <p className="text-sm font-medium text-slate-400">Quick-tap items from the {vendor.name} catalog.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     {/* Fixed: Completed truncated map function and added return statement to fix ReactNode error */}
                     {(vendor.catalog || []).map(item => {
                        const inCart = items.find(i => i.id === item.id);
                        return (
                          <button 
                            key={item.id}
                            onClick={() => handleAddItem(item)}
                            className={`p-4 rounded-2xl border transition-all text-left group ${inCart ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                          >
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black uppercase text-slate-900 truncate pr-2">{item.name}</p>
                                {inCart && <ICONS.CheckCircle2 className="text-emerald-600" size={12} />}
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${item.pricing.tradePrice.toFixed(2)} / {item.unitOfMeasure}</p>
                          </button>
                        );
                     })}
                  </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-10 animate-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Review Order</h3>
                    <p className="text-sm font-medium text-slate-400">Verify items and delivery details before dispatching.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase">{item.name}</p>
                          {/* Fix for line 179: unitCost renamed to unitPrice to match POLineItem interface */}
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.qty} {item.unit} @ ${item.unitPrice.toFixed(2)}</p>
                        </div>
                        {/* Fix for line 181: unitCost renamed to unitPrice to match POLineItem interface */}
                        <p className="text-sm font-black text-slate-900">${(item.qty * item.unitPrice).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
           {step === 1 ? (
             <button onClick={() => setStep(2)} disabled={!selectedJobId} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all uppercase text-xs tracking-widest">Next: Select Materials</button>
           ) : step === 2 ? (
             <>
               <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Back</button>
               <button onClick={() => setStep(3)} disabled={items.length === 0} className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all uppercase text-xs tracking-widest">Next: Review Order</button>
             </>
           ) : (
             <>
               <button onClick={() => setStep(2)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Back</button>
               <button onClick={handleFinalize} className="flex-[2] py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all uppercase text-xs tracking-widest">Finalize Purchase Order</button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default POModal;