
import React, { useState, useEffect, useMemo } from 'react';
import { CartLine } from '../../../types';
import { ICONS } from '../../../constants';
import { getCart, removeFromCart, updateCartLine, computeCartSubtotal, reorderCart } from '../../../lib/cart/store';

const EstimateCart: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const subtotal = useMemo(() => computeCartSubtotal(), [lines]);

  useEffect(() => {
    setLines(getCart());
  }, [onRefresh]);

  const remove = (id: string) => {
    if (window.confirm("Remove item from staged list?")) {
      removeFromCart(id);
      onRefresh();
    }
  };

  const update = (id: string, patch: Partial<CartLine>) => {
    updateCartLine(id, patch);
    onRefresh();
  };

  const move = (idx: number, dir: number) => {
    reorderCart(idx, idx + dir);
    onRefresh();
  };

  const downloadCSV = () => {
    const headers = "Name,Qty,UM,Tier,UnitPrice,Extended,Notes";
    const rows = lines.map(l => `${l.name},${l.qty},${l.um},${l.tier},${l.unitPrice},${l.extended},"${l.notes || ''}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estimate_cart_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div>
           <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Estimate Cart</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lines.length} items staged</p>
        </div>
        <div className="flex gap-2">
           <button onClick={downloadCSV} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 shadow-sm transition-all" title="Export CSV">
              <ICONS.RefreshCcw size={16}/>
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {lines.map((l, idx) => (
          <div key={l.id} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 group relative hover:bg-white hover:border-emerald-200 transition-all hover:shadow-lg">
             <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-black text-slate-900 uppercase leading-tight truncate">{l.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Tier: {l.tier}</p>
                </div>
                <button onClick={() => remove(l.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                  <ICONS.Plus size={16} className="rotate-45" />
                </button>
             </div>
             
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-100 p-1.5 shadow-inner">
                   <button onClick={() => update(l.id, { qty: Math.max(0, l.qty - 1) })} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-black">-</button>
                   <input 
                    type="number" 
                    value={l.qty} 
                    onChange={e => update(l.id, { qty: parseFloat(e.target.value) || 0 })}
                    className="w-12 text-center font-black text-xs bg-transparent outline-none text-slate-900" 
                   />
                   <button onClick={() => update(l.id, { qty: l.qty + 1 })} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-black">+</button>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-900 tracking-tight">${l.extended.toFixed(2)}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">@ ${l.unitPrice.toFixed(2)}/{l.um}</p>
                </div>
             </div>

             <div className="mt-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => move(idx, -1)} 
                  disabled={idx === 0} 
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all shadow-sm"
                >Up</button>
                <button 
                  onClick={() => move(idx, 1)} 
                  disabled={idx === lines.length - 1} 
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all shadow-sm"
                >Down</button>
             </div>
          </div>
        ))}
        {lines.length === 0 && (
           <div className="py-24 text-center text-slate-300 italic flex flex-col items-center gap-4">
              <div className="p-8 bg-slate-50 rounded-full">
                <ICONS.Receipt size={48} className="opacity-10"/>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Selection Empty</p>
           </div>
        )}
      </div>

      <footer className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-6 shrink-0">
        <div className="flex justify-between items-end">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staged Total</span>
           <span className="text-4xl font-black text-slate-900 tracking-tighter">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <button 
          disabled={lines.length === 0}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-emerald-600 disabled:opacity-30 disabled:grayscale transition-all uppercase text-xs tracking-widest active:scale-95"
        >
          Push To Estimate Blocks
        </button>
      </footer>
    </div>
  );
};

export default EstimateCart;
