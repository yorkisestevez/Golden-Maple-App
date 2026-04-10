
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Vendor, CatalogItem, CatalogCategory, PricingTier } from '../../../types';
import { ICONS } from '../../../constants';
import { listItems, listCategories, getCategoryPath } from '../../../lib/catalog/store';
import { isFavorite, toggleFavorite, getUsageStats } from '../../../lib/catalog/usage';
import { addToCart, getCart } from '../../../lib/cart/store';
import CategoryTree from './CategoryTree';
import EstimateCart from './EstimateCart';
import ProductTable from './ProductTable';

interface CatalogDashboardProps {
  vendor: Vendor;
  onBack: () => void;
  onImport: () => void;
}

const CatalogDashboard: React.FC<CatalogDashboardProps> = ({ vendor, onBack, onImport }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<string>(vendor.defaultTier);
  const [refreshKey, setRefreshKey] = useState(0);

  const usageMap = useMemo(() => getUsageStats(), [refreshKey]);

  useEffect(() => {
    setItems(listItems({ vendorId: vendor.id }));
    setCategories(listCategories(vendor.id));
  }, [vendor.id, refreshKey]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCatId) result = result.filter(i => i.categoryId === selectedCatId);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.searchableText.includes(q));
    }

    // Ranking Logic
    return result.sort((a, b) => {
      // 1. Favorites
      const favA = isFavorite(a.id) ? 1 : 0;
      const favB = isFavorite(b.id) ? 1 : 0;
      if (favA !== favB) return favB - favA;

      // 2. Usage
      const useA = usageMap[a.id]?.count || 0;
      const useB = usageMap[b.id]?.count || 0;
      if (useA !== useB) return useB - useA;

      // 3. Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [items, selectedCatId, searchQuery, usageMap]);

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setRefreshKey(k => k + 1);
  };

  const handleAddToCart = (item: CatalogItem, qty: number) => {
    addToCart(item, qty, activeTier);
    setRefreshKey(k => k + 1);
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('catalog-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-6 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <button onClick={onBack} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
            <ICONS.ChevronRight className="rotate-180" size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest truncate">{vendor.name} Catalog</h2>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 w-fit mt-1">
              {['trade', 'retail'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTier(t)}
                  className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${activeTier === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="relative max-w-xl flex-1 mx-4">
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              id="catalog-search"
              type="text" 
              placeholder="Search products (Press / to focus)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        <button 
          onClick={onImport}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          <ICONS.RefreshCcw size={14} /> Update Pricebook
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <CategoryTree 
            vendorId={vendor.id} 
            selectedId={selectedCatId} 
            onSelect={setSelectedCatId}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
          <ProductTable 
            items={filteredItems} 
            activeTier={activeTier} 
            onAdd={handleAddToCart}
            onToggleFavorite={handleToggleFav}
          />
        </main>

        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <EstimateCart onRefresh={() => setRefreshKey(k => k + 1)} />
        </aside>
      </div>
    </div>
  );
};

export default CatalogDashboard;
