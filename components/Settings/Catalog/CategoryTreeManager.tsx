
import React, { useState, useEffect } from 'react';
import { CatalogCategory } from '../../../types';
import { ICONS } from '../../../constants';
import { listCategories } from '../../../lib/catalog/store';
import { STORAGE_KEYS, safeSetJSON, uid } from '../../../lib/storage';

const CategoryTreeManager: React.FC = () => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    setCategories(listCategories());
  }, []);

  const addRoot = () => {
    const name = window.prompt("New Global Category Name:");
    if (!name) return;
    const newCat: CatalogCategory = {
      id: uid('CAT'),
      name,
      order: categories.length,
      categoryType: 'Materials',
      tags: []
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    safeSetJSON(STORAGE_KEYS.CATEGORIES, updated);
  };

  const deleteCat = (id: string) => {
    if (!window.confirm("Delete category? Children will be unparented.")) return;
    const updated = categories.filter(c => c.id !== id).map(c => c.parentId === id ? { ...c, parentId: undefined } : c);
    setCategories(updated);
    safeSetJSON(STORAGE_KEYS.CATEGORIES, updated);
  };

  const move = (id: string, dir: number) => {
    const list = [...categories];
    const idx = list.findIndex(c => c.id === id);
    if (idx + dir < 0 || idx + dir >= list.length) return;
    [list[idx], list[idx+dir]] = [list[idx+dir], list[idx]];
    const updated = list.map((c, i) => ({ ...c, order: i }));
    setCategories(updated);
    safeSetJSON(STORAGE_KEYS.CATEGORIES, updated);
  };

  // Added key?: string to props definition to fix error on lines 64 and 80
  const CatRow = ({ cat, level }: { cat: CatalogCategory, level: number, key?: string }) => (
    <div key={cat.id} className="group">
      <div 
        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-emerald-200 transition-all mb-2"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-4">
           <ICONS.GripVertical size={16} className="text-slate-300 opacity-20 group-hover:opacity-100 cursor-grab" />
           <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{cat.name}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => move(cat.id, -1)} className="p-1.5 hover:bg-slate-100 rounded"><ICONS.ChevronRight className="-rotate-90" size={14}/></button>
           <button onClick={() => move(cat.id, 1)} className="p-1.5 hover:bg-slate-100 rounded"><ICONS.ChevronRight className="rotate-90" size={14}/></button>
           <button onClick={() => deleteCat(cat.id)} className="p-1.5 hover:text-red-500 rounded"><ICONS.Trash2 size={14}/></button>
        </div>
      </div>
      {categories.filter(c => c.parentId === cat.id).map(child => (
        <CatRow key={child.id} cat={child} level={level + 1} />
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase">Item Categories</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Foundation for clean imports and reporting.</p>
        </div>
        <button onClick={addRoot} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">+ New Group</button>
      </div>

      <div className="pt-4">
        {categories.filter(c => !c.parentId).map(root => <CatRow key={root.id} cat={root} level={0} />)}
        {categories.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 italic text-xs uppercase tracking-widest">
            Category library is empty
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTreeManager;
