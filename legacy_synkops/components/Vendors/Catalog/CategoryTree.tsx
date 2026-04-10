
import React from 'react';
import { CatalogCategory } from '../../../types';
import { ICONS } from '../../../constants';
import { listCategories } from '../../../lib/catalog/store';
import { STORAGE_KEYS, safeSetJSON, safeGetJSON, uid } from '../../../lib/storage';

interface CategoryTreeProps {
  vendorId: string;
  selectedId?: string;
  onSelect: (id?: string) => void;
  onRefresh: () => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ vendorId, selectedId, onSelect, onRefresh }) => {
  const categories = listCategories(vendorId);

  const addCategory = () => {
    const name = window.prompt("New Category Name:");
    if (!name) return;
    const all = safeGetJSON<CatalogCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    // Fix for line 22: Added required categoryType property
    const newCat: CatalogCategory = {
      id: uid('CAT'),
      vendorId,
      name,
      order: categories.length,
      categoryType: 'Materials',
      tags: []
    };
    safeSetJSON(STORAGE_KEYS.CATEGORIES, [...all, newCat]);
    onRefresh();
  };

  const move = (id: string, dir: number) => {
    const all = safeGetJSON<CatalogCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    const idx = categories.findIndex(c => c.id === id);
    if (idx + dir < 0 || idx + dir >= categories.length) return;
    
    const nextIdx = idx + dir;
    const tempOrder = categories[idx].order;
    categories[idx].order = categories[nextIdx].order;
    categories[nextIdx].order = tempOrder;

    const updated = all.map(c => {
      const match = categories.find(m => m.id === c.id);
      return match ? match : c;
    });
    safeSetJSON(STORAGE_KEYS.CATEGORIES, updated);
    onRefresh();
  };

  const deleteCat = (id: string) => {
    if (!window.confirm("Delete this group? Items will be uncategorized.")) return;
    const all = safeGetJSON<CatalogCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    safeSetJSON(STORAGE_KEYS.CATEGORIES, all.filter(c => c.id !== id));
    onRefresh();
  };

  const rootCats = categories.filter(c => !c.parentId);

  // Added key?: string to props definition to fix error on lines 79 and 101
  const CatRow = ({ cat, level }: { cat: CatalogCategory, level: number, key?: string }) => (
    <div className="group">
      <div 
        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${selectedId === cat.id ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'hover:bg-slate-50 text-slate-600'}`}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => onSelect(cat.id)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <ICONS.GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
          <span className="text-xs font-bold truncate uppercase tracking-tight">{cat.name}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
           <button onClick={(e) => { e.stopPropagation(); move(cat.id, -1); }} className="p-1 hover:bg-white rounded border border-slate-100"><ICONS.ChevronRight className="-rotate-90" size={10}/></button>
           <button onClick={(e) => { e.stopPropagation(); move(cat.id, 1); }} className="p-1 hover:bg-white rounded border border-slate-100"><ICONS.ChevronRight className="rotate-90" size={10}/></button>
           <button onClick={(e) => { e.stopPropagation(); deleteCat(cat.id); }} className="p-1 hover:text-red-500 rounded"><ICONS.Trash2 size={10}/></button>
        </div>
      </div>
      {categories.filter(c => c.parentId === cat.id).map(child => (
        <CatRow key={child.id} cat={child} level={level + 1} />
      ))}
    </div>
  );

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Groups</h3>
        <button onClick={addCategory} className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-600 transition-colors">
          <ICONS.Plus size={16} />
        </button>
      </div>

      <button 
        onClick={() => onSelect(undefined)}
        className={`w-full text-left p-3 rounded-xl text-xs font-black uppercase tracking-widest mb-4 transition-all ${!selectedId ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
      >
        All Products
      </button>

      <div className="flex-1 space-y-1">
        {rootCats.map(cat => <CatRow key={cat.id} cat={cat} level={0} />)}
      </div>

      {categories.length === 0 && (
        <div className="py-12 text-center text-slate-300 italic text-xs border-2 border-dashed border-slate-100 rounded-3xl">
          No categories defined.
        </div>
      )}
    </div>
  );
};

export default CategoryTree;
