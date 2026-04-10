
import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChangeOrder, 
  ChangeOrderStatus, 
  ChangeOrderReason, 
  Job, 
  User, 
  UserRole, 
  COLineItem, 
  COSection, 
  COSectionType,
  Photo,
  PhotoCategory
} from '../../types';
import { ICONS } from '../../constants';

interface ChangeOrderEditorProps {
  user: User;
  jobs: Job[];
  initialCO: ChangeOrder | null;
  onSave: (co: ChangeOrder) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const TEMPLATE_BLOCKS = [
  { id: 'tmpl-1', type: COSectionType.SCOPE, title: 'Scope Detail', content: 'Provide a clear, granular breakdown of the specific adjustments made to the original contract.' },
  { id: 'tmpl-2', type: COSectionType.NOTES, title: 'Warranty Note', content: 'All hardscape work is warrantied for a period of 5 years against excessive settling or stone failure.' },
  { id: 'tmpl-3', type: COSectionType.NOTES, title: 'Restricted Access', content: 'Site has restricted access requiring motorized carts for aggregate movement.' },
];

const DEFAULT_SECTIONS: Omit<COSection, 'id'>[] = [
  { type: COSectionType.HEADER, title: 'Document Header', isVisible: true, isLocked: true, order: 0, content: {} },
  { type: COSectionType.REASON, title: 'Reason for Change', isVisible: true, isLocked: false, order: 1, content: {} },
  { type: COSectionType.SCOPE, title: 'Detailed Scope', isVisible: true, isLocked: false, order: 2, content: {} },
  { type: COSectionType.PRICING, title: 'Pricing Delta', isVisible: true, isLocked: false, order: 3, content: {} },
  { type: COSectionType.SIGNATURE, title: 'Acceptance', isVisible: true, isLocked: true, order: 4, content: {} },
];

const ChangeOrderEditor: React.FC<ChangeOrderEditorProps> = ({ user, jobs, initialCO, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState<ChangeOrder>(initialCO || {
    id: `CO-${Math.random().toString(36).substr(2, 9)}`,
    coNumber: `CO-${Math.floor(Math.random() * 9000) + 1000}`,
    jobId: '',
    jobName: '',
    address: '',
    title: '',
    reason: ChangeOrderReason.CLIENT_REQUEST,
    description: '',
    pricingMode: 'fixed',
    lineItems: [],
    priceDelta: 0,
    taxRate: 13,
    taxIncluded: true,
    totalWithTax: 0,
    daysImpact: 0,
    scheduleAffected: false,
    status: user.role === UserRole.FIELD_LEAD ? ChangeOrderStatus.PENDING_APPROVAL : ChangeOrderStatus.DRAFT,
    createdBy: user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: DEFAULT_SECTIONS.map(s => ({ ...s, id: `sec-${Math.random().toString(36).substr(2, 9)}` })),
    attachments: []
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(formData.sections[0]?.id);
  const [draggedItem, setDraggedItem] = useState<{ type: 'section' | 'lineItem' | 'photo', id: string, index: number } | null>(null);

  // --- HELPERS ---
  const reorder = <T extends { order: number; id: string }>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((item, index) => ({ ...item, order: index }));
  };

  const handleDragStart = (e: React.DragEvent, type: 'section' | 'lineItem' | 'photo', id: string, index: number) => {
    setDraggedItem({ type, id, index });
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('id', id);
  };

  const handleDropSection = (e: React.DragEvent, index: number) => {
    if (!draggedItem || draggedItem.type !== 'section') return;
    if (formData.sections[index].isLocked || formData.sections[draggedItem.index].isLocked) return;
    const updated = reorder(formData.sections, draggedItem.index, index);
    setFormData({ ...formData, sections: updated });
    setDraggedItem(null);
  };

  // --- PRICING HELPERS ---
  const addLineItem = () => {
    const newItem: COLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Item...',
      qty: 1,
      unit: 'EA',
      unitPrice: 0,
      category: 'material',
      order: formData.lineItems.length
    };
    setFormData({ ...formData, lineItems: [...formData.lineItems, newItem] });
  };

  const updateLineItem = (id: string, updates: Partial<COLineItem>) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const deleteLineItem = (id: string) => {
    setFormData({ ...formData, lineItems: formData.lineItems.filter(item => id !== item.id) });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    if (formData.pricingMode === 'fixed') {
      subtotal = formData.priceDelta;
    } else {
      subtotal = formData.lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    }
    const tax = formData.taxIncluded ? subtotal * (formData.taxRate / 100) : 0;
    return { subtotal, tax, total: subtotal + tax };
  }, [formData]);

  const handleFinalSave = () => {
    onSave({ 
      ...formData, 
      priceDelta: totals.subtotal, 
      totalWithTax: totals.total, 
      updatedAt: new Date().toISOString() 
    });
  };

  const handleDeleteSelf = () => {
    if (onDelete && window.confirm("Delete this document entirely?")) {
      onDelete(formData.id);
      onCancel();
    }
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">{formData.coNumber} — Interactive Builder</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{formData.jobName || 'Unlinked Project'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mr-4">
            <button onClick={() => setFormData({...formData, pricingMode: 'fixed'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.pricingMode === 'fixed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Fixed Price</button>
            <button onClick={() => setFormData({...formData, pricingMode: 'line_items'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.pricingMode === 'line_items' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Line Items</button>
          </div>
          <button onClick={handleFinalSave} className="px-8 py-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">Update & Close</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: LIBRARY */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Linked Job</h3>
              <select 
                value={formData.jobId} 
                onChange={e => {
                  const job = jobs.find(j => j.id === e.target.value);
                  if (job) setFormData({...formData, jobId: job.id, jobName: job.clientName, address: job.address});
                }}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
              >
                <option value="">Select Job...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName}</option>)}
              </select>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Templates</h3>
              <div className="space-y-3">
                {TEMPLATE_BLOCKS.map(tmpl => (
                  <button 
                    key={tmpl.id}
                    onClick={() => {
                      const newSec: COSection = { id: `sec-${Date.now()}`, type: tmpl.type, title: tmpl.title, isVisible: true, isLocked: false, order: formData.sections.length - 1, content: {} };
                      setFormData({ ...formData, description: formData.description + '\n' + tmpl.content, sections: [...formData.sections.filter(s => !s.isLocked), ...formData.sections.filter(s => s.isLocked)].sort((a,b) => a.order - b.order) });
                    }}
                    className="w-full p-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-left hover:border-emerald-300 hover:bg-white transition-all group"
                  >
                    <p className="text-xs font-black text-slate-700 mb-1">{tmpl.title}</p>
                    <p className="text-[10px] text-slate-400 group-hover:text-slate-500 truncate">Insert text into scope...</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Structure</h3>
               <div className="space-y-2">
                {formData.sections.sort((a,b) => a.order - b.order).map((s, i) => (
                  <div 
                    key={s.id}
                    draggable={!s.isLocked}
                    onDragStart={(e) => handleDragStart(e, 'section', s.id, i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropSection(e, i)}
                    onClick={() => setActiveSectionId(s.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      activeSectionId === s.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {!s.isLocked ? <ICONS.GripVertical size={14} className="text-slate-300" /> : <ICONS.Lock size={12} className="text-slate-200" />}
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{s.title}</span>
                    </div>
                    {!s.isLocked && (
                      <button onClick={(e) => { e.stopPropagation(); setFormData({...formData, sections: formData.sections.filter(sec => sec.id !== s.id)}); }} className="text-slate-300 hover:text-red-500">
                        <ICONS.Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: INTERACTIVE CANVAS */}
        <main className="flex-1 bg-slate-100 overflow-y-auto no-scrollbar p-12 flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white shadow-2xl rounded-[48px] overflow-hidden min-h-[1200px] flex flex-col p-16 space-y-12 transition-all">
            {formData.sections.sort((a,b) => a.order - b.order).map((section, idx) => (
              <div 
                key={section.id} 
                className={`relative group/section pb-12 border-b border-slate-50 last:border-0 ${activeSectionId === section.id ? 'ring-2 ring-emerald-500/10 rounded-3xl' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropSection(e, idx)}
              >
                {!section.isLocked && (
                   <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'section', section.id, idx)}
                    className="absolute -left-12 top-0 p-2 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover/section:opacity-100 transition-all"
                   >
                     <ICONS.GripVertical size={20} />
                   </div>
                )}

                {section.type === COSectionType.HEADER && (
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">S</div>
                    <div className="text-right">
                       <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Change Order</h2>
                       <input 
                         className="bg-transparent border-none p-0 text-slate-400 font-bold mt-1 text-right focus:ring-0 focus:text-slate-900" 
                         value={formData.coNumber}
                         onChange={e => setFormData({...formData, coNumber: e.target.value})}
                       />
                    </div>
                  </div>
                )}

                {section.type === COSectionType.REASON && (
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment Intent</h3>
                     {/* Fixed: explicitly type r as string to fix mapping errors */}
                     <select 
                       value={formData.reason}
                       onChange={e => setFormData({...formData, reason: e.target.value as any})}
                       className="w-full p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-2xl font-black text-slate-900 appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                     >
                       {Object.values(ChangeOrderReason).map((r: string) => <option key={r} value={r}>{r}</option>)}
                     </select>
                  </div>
                )}

                {section.type === COSectionType.SCOPE && (
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope Modification Breakdown</h3>
                     <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full text-lg text-slate-600 leading-relaxed border-none focus:ring-0 p-4 bg-slate-50/30 rounded-3xl h-48 resize-none transition-all focus:bg-white focus:shadow-inner"
                      placeholder="Describe exactly what is being added or subtracted from the contract..."
                     />
                  </div>
                )}

                {section.type === COSectionType.PRICING && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Adjustment</h3>
                      {formData.pricingMode === 'line_items' && (
                        <button onClick={addLineItem} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">+ Add Row</button>
                      )}
                    </div>
                    
                    {formData.pricingMode === 'fixed' ? (
                      <div className="bg-slate-900 rounded-[40px] p-10 text-white flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Lump Sum Delta</p>
                          <h4 className="text-5xl font-black text-emerald-400 tracking-tighter">${totals.total.toLocaleString()}</h4>
                        </div>
                        <div className="text-right">
                          <label className="block text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Edit Subtotal</label>
                          <input 
                            type="number" 
                            className="bg-white/10 border-none rounded-xl p-3 text-right text-xl font-black focus:ring-2 focus:ring-emerald-500 w-32"
                            value={formData.priceDelta}
                            onChange={e => setFormData({...formData, priceDelta: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-100 rounded-[32px] overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-50"><tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest"><th className="px-6 py-3 text-left">Item / Task</th><th className="px-6 py-3 text-center">Qty</th><th className="px-6 py-3 text-right">Price</th><th className="px-6 py-3"></th></tr></thead>
                          <tbody className="divide-y divide-slate-50">
                            {formData.lineItems.map((item) => (
                              <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <input 
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 focus:text-slate-900" 
                                    value={item.name}
                                    onChange={e => updateLineItem(item.id, { name: e.target.value })}
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <input 
                                    type="number" 
                                    className="w-16 bg-white/50 border border-slate-200 rounded-lg p-1 text-center text-xs font-bold focus:ring-1 focus:ring-emerald-500" 
                                    value={item.qty}
                                    onChange={e => updateLineItem(item.id, { qty: Number(e.target.value) })}
                                  />
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-slate-300 text-xs">$</span>
                                    <input 
                                      type="number" 
                                      className="w-24 bg-transparent border-none p-0 text-right font-black focus:ring-0" 
                                      value={item.unitPrice}
                                      onChange={e => updateLineItem(item.id, { unitPrice: Number(e.target.value) })}
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => deleteLineItem(item.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><ICONS.Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                           <span className="text-xs font-black uppercase tracking-widest opacity-40">Running Total</span>
                           <span className="text-3xl font-black text-emerald-400">${totals.total.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {section.type === COSectionType.SIGNATURE && (
                  <div className="pt-12 border-t-4 border-dashed border-slate-100 text-center">
                    <ICONS.Lock className="mx-auto text-slate-100 mb-6" size={48} />
                    <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Client Execution Block</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT: INSPECTOR */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-8 flex-1">
            <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tax Rules</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sales Tax (HST %)</label>
                    <input 
                      type="number" 
                      value={formData.taxRate} 
                      onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})}
                      className="w-full bg-transparent border-none p-0 font-black text-lg focus:ring-0"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group px-1">
                    <input 
                      type="checkbox" 
                      checked={formData.taxIncluded}
                      onChange={e => setFormData({...formData, taxIncluded: e.target.checked})}
                      className="w-5 h-5 rounded-lg accent-emerald-500" 
                    />
                    <span className="text-[10px] font-black text-slate-700 uppercase">Include Tax in Total</span>
                  </label>
               </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Schedule</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group px-1">
                  <input 
                    type="checkbox" 
                    checked={formData.scheduleAffected}
                    onChange={e => setFormData({...formData, scheduleAffected: e.target.checked})}
                    className="w-5 h-5 rounded-lg accent-amber-500" 
                  />
                  <span className="text-[10px] font-black text-slate-700 uppercase">Shifts Completion Date</span>
                </label>
                {formData.scheduleAffected && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-2">Extra Work Days</label>
                    <input 
                      type="number" 
                      value={formData.daysImpact}
                      onChange={e => setFormData({...formData, daysImpact: Number(e.target.value)})}
                      className="w-full bg-transparent border-none p-0 font-black text-lg focus:ring-0 text-amber-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 space-y-4">
             <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Price Change</span>
                   <span className="text-sm font-black text-slate-900">${totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                   <span className="text-[10px] font-black text-slate-900 uppercase">Grand Total</span>
                   <span className="text-xl font-black text-emerald-600">${totals.total.toLocaleString()}</span>
                </div>
             </div>

             {isAdmin && (
               <button 
                 onClick={handleDeleteSelf}
                 className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
               >
                 <ICONS.Trash2 size={14} /> Delete Document
               </button>
             )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChangeOrderEditor;
