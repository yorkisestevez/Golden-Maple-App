
import React from 'react';
import { CatalogItem } from '../../../types';
import { ICONS } from '../../../constants';
import { isFavorite } from '../../../lib/catalog/usage';

interface ProductTableProps {
  items: CatalogItem[];
  activeTier: string;
  onAdd: (item: CatalogItem, qty: number) => void;
  onToggleFavorite: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ items, activeTier, onAdd, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-8 py-5">Product Details</th>
            <th className="px-6 py-5 text-center">Unit</th>
            <th className="px-6 py-5 text-right">Price ({activeTier})</th>
            <th className="px-6 py-5 text-right">Other Tier</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map(item => {
            const isFav = isFavorite(item.id);
            const otherTier = activeTier === 'trade' ? 'retail' : 'trade';
            const price = item.tierPrices[activeTier] || 0;
            const altPrice = item.tierPrices[otherTier] || 0;

            return (
              <tr key={item.id} className="hover:bg-slate-50/80 group transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onToggleFavorite(item.id)}
                      className={`transition-colors ${isFav ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                    >
                      <ICONS.Plus size={16} className={isFav ? 'fill-current' : ''} />
                    </button>
                    <div>
                      <span className="font-black text-slate-900 text-sm tracking-tight block uppercase">{item.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {item.brand && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.brand}</span>}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.itemType}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">{item.unitOfMeasure}</span>
                </td>
                <td className="px-6 py-6 text-right">
                  <span className="font-black text-sm text-slate-900">${price.toFixed(2)}</span>
                </td>
                <td className="px-6 py-6 text-right opacity-40">
                  <span className="font-bold text-xs">${altPrice.toFixed(2)}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => onAdd(item, 1)}
                    className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 hover:bg-emerald-600 transition-all active:scale-90"
                  >
                    <ICONS.Plus size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-32 text-center text-slate-300 italic uppercase font-black text-[10px] tracking-widest">
                No catalog matches found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
