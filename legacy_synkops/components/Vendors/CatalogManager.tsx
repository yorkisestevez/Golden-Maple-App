
import React, { useState, useEffect, useMemo } from 'react';
import { CatalogItem, User, UserRole } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, getJSON, setJSON } from '../../lib/storage';
import { searchCatalog, recordCatalogUse } from '../../lib/vendors/catalogService';
import CSVImportModal from './CSVImportModal';

const DEPARTMENTS = [
  'Bulk Aggregates', 'Soils & Mulch', 'Accessories', 'Pavers & Slabs', 
  'Walls / Caps / Steps', 'Lighting', 'Decking', 'Drainage', 'Turf', 'Logistics / Delivery'
];

const CatalogManager: React.FC<{ vendorId: string; user: User }> = ({ vendorId, user }) => {
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [priceTier, setPriceTier] = useState<'TRADE' | 'RETAIL'>('TRADE');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  const items = useMemo(() => {
    return searchCatalog(query, { 
      vendorId, 
      department: selectedDept === 'ALL' ? undefined : selectedDept 
    });
  }, [query, selectedDept, vendorId, refreshKey]);

  const toggleFavorite = (itemId: string) => {
    const all = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
    // Fixed: favorite status is nested under visibility property
    const updated = all.map(i => i.id === itemId ? { ...i, visibility: { ...i.visibility, isFavorite: !i.visibility.isFavorite } } : i);
    setJSON(STORAGE_KEYS.CATALOG, updated);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-80">
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products, brands, skus..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>
          <select 
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button onClick={() => setPriceTier('TRADE')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${priceTier === 'TRADE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Trade</button>
              <button onClick={() => setPriceTier('RETAIL')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${priceTier === 'RETAIL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Retail</button>
            </div>
          )}
          {isAdmin && (
            <button 
              onClick={() => setIsImportOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
            >
              Import CSV
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Product Info</th>
              <th className="px-8 py-5 text-center">Unit</th>
              {isAdmin && <th className="px-8 py-5 text-right">Price ({priceTier})</th>}
              <th className="px-8 py-5 text-right">Lead Time</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      // Fixed: favorite status is nested under visibility property
                      className={`transition-colors ${item.visibility.isFavorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                    >
                      <ICONS.Plus size={16} className={item.visibility.isFavorite ? 'fill-current' : ''} />
                    </button>
                    <div>
                      <div className="font-black text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {item.brand && `${item.brand} • `} {item.department} {item.vendorSku && `• SKU: ${item.vendorSku}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-[10px] font-black uppercase">{item.unitOfMeasure}</span>
                </td>
                {isAdmin && (
                  <td className="px-8 py-6 text-right font-black text-slate-900">
                    {/* Fixed: trade and retail prices are nested under pricing property */}
                    ${(priceTier === 'TRADE' ? item.pricing.tradePrice : item.pricing.retailPrice)?.toFixed(2) || '0.00'}
                  </td>
                )}
                <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 uppercase">
                  {/* Fixed: leadTime property mapping */}
                  {item.leadTime || 'Stock'}
                </td>
                <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100">
                  <button onClick={() => recordCatalogUse(item.id, 'po')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100">
                    <ICONS.FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-20 text-center text-slate-300">
            <ICONS.Receipt size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">No items in catalog</p>
          </div>
        )}
      </div>

      {isImportOpen && (
        <CSVImportModal 
          vendorId={vendorId} 
          onImport={() => setRefreshKey(k => k + 1)} 
          onClose={() => setIsImportOpen(false)} 
        />
      )}
    </div>
  );
};

export default CatalogManager;
