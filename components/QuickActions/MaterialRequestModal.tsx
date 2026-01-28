
import React, { useState } from 'react';
import { Job, MaterialRequest, MaterialRequestItem, User } from '../../types';
import { ICONS } from '../../constants';
import { setJSON, getJSON } from '../../lib/storage';

interface MaterialRequestModalProps {
  job: Job;
  user: User;
  onClose: () => void;
}

const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({ job, user, onClose }) => {
  const [items, setItems] = useState<MaterialRequestItem[]>([
    { id: '1', name: '', qty: 0, unit: 'EA' }
  ]);
  const [neededBy, setNeededBy] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', qty: 0, unit: 'EA' }]);
  
  const updateItem = (id: string, field: keyof MaterialRequestItem, val: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: MaterialRequest = {
      id: `REQ-${Date.now()}`,
      jobId: job.id,
      jobName: job.clientName,
      requestedBy: user.name,
      requestedById: user.id,
      requestedAt: new Date().toISOString(),
      neededBy,
      deliveryType,
      location: job.address,
      priority,
      items: items.filter(i => i.name && i.qty > 0),
      status: 'submitted'
    };

    const existing = getJSON<MaterialRequest[]>('synkops_material_requests_v1', []);
    setJSON('synkops_material_requests_v1', [request, ...existing]);

    // Create Notification
    const notes = getJSON<any[]>('synkops_notifications_v1', []);
    setJSON('synkops_notifications_v1', [{
      id: `NOT-${Date.now()}`,
      type: 'material_request',
      jobId: job.id,
      referenceId: request.id,
      message: `New ${priority} request: ${job.clientName}`,
      priority,
      timestamp: new Date().toISOString(),
      read: false
    }, ...notes]);

    alert("Material Request Submitted to Office");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Material Request</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-1">FOR: {job.clientName}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Needed By</label>
                <input type="date" value={neededBy} onChange={e => setNeededBy(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="normal">Normal</option>
                  <option value="urgent">URGENT</option>
                </select>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Line Items</h3>
              <button type="button" onClick={addItem} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Add Item</button>
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input 
                  className="col-span-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" 
                  placeholder="Item Name (e.g. 3/4 Clear Stone)" 
                  value={item.name} 
                  onChange={e => updateItem(item.id, 'name', e.target.value)} 
                />
                <input 
                  type="number" 
                  className="col-span-3 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center" 
                  value={item.qty} 
                  onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} 
                />
                <select 
                  className="col-span-3 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase"
                  value={item.unit}
                  onChange={e => updateItem(item.id, 'unit', e.target.value)}
                >
                  <option>EA</option><option>Tonne</option><option>Yard</option><option>Pallet</option><option>Bag</option>
                </select>
              </div>
            ))}
          </div>
        </form>

        <footer className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button type="submit" onClick={handleSubmit} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest">
            Submit Request to Office
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MaterialRequestModal;
