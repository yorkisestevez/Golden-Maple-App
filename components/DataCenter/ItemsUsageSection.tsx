
import React, { useState, useMemo } from 'react';
import { CatalogItem, UsageRecord } from '../../types';
import { ICONS } from '../../constants';
import { getJSON, STORAGE_KEYS } from '../../lib/storage';

const ItemsUsageSection: React.FC = () => {
  const [filterVendor, setFilterVendor] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterTier, setFilterTier] = useState('trade');

  // Load Data
  const usageRecord = getJSON<Record<string, UsageRecord>>(STORAGE_KEYS.USAGE, {});
  const catalogItems = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
  
  const vendors = useMemo(() => {
    const vIds = new Set(catalogItems.map(i => i.vendorId).filter(Boolean));
    return Array.from(vIds);
  }, [catalogItems]);

  const departments = useMemo(() => {
    const depts = new Set(catalogItems.map(i => i.department).filter(Boolean));
    return Array.from(depts);
  }, [catalogItems]);

  const topItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return catalogItems
      .filter(item => {
        const usage = usageRecord[item.id];
        if (!usage) return false;
        
        const matchesVendor = filterVendor === 'ALL' || item.vendorId === filterVendor;
        const matchesDept = filterDept === 'ALL' || item.department === filterDept;
        
        // Items used at least once in last 30 days
        const lastUsed = new Date(usage.lastUsedAt);
        const isRecent = lastUsed > thirtyDaysAgo;

        return matchesVendor && matchesDept && isRecent;
      })
      .map(item => ({
        ...item,
        useCount: usageRecord[item.id].useCount,
        lastUsedAt: usageRecord[item.id].lastUsedAt
      }))
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 20);
  }, [catalogItems, usageRecord, filterVendor, filterDept]);

  const topCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    catalogItems.forEach(item => {
      const usage = usageRecord[item.id];
      if (usage) {
        const dept = item.department || 'Other';
        catMap[dept] = (catMap[dept] || 0) + usage.useCount;
      }
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [catalogItems, usageRecord]);

  const recentUsage = useMemo(() => {
    return catalogItems
      .filter(item => usageRecord[item.id])
      .map(item => ({
        ...item,
        lastUsedAt: usageRecord[item.id].lastUsedAt
      }))
      .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
      .slice(0, 20);
  }, [catalogItems, usageRecord]);

  const totalUses = useMemo(() => 
    Object.values(usageRecord).reduce((acc, curr) => acc + curr.useCount, 0), 
  [usageRecord]);

  return (
    <div className="space-y-12">
      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Catalog</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{catalogItems.length}</p>
           <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
              <ICONS.TrendingUp size={12}/> Live Inventory
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active SKUs</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter">{catalogItems.filter(i => i.status === 'active').length}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pricing Book Sync'd</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estimating Uses</p>
           <p className="text-4xl font-black text-emerald-600 tracking-tighter">{totalUses}</p>
           <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lifetime utilization</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
           <div>
             <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mb-2">Pricing Context</p>
             <p className="text-2xl font-black uppercase tracking-tight text-emerald-400">{filterTier} Tier</p>
           </div>
           <button onClick={() => setFilterTier(t => t === 'trade' ? 'retail' : 'trade')} className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Switch Price Point
           </button>
           <ICONS.RefreshCcw className="absolute -bottom-4 -right-4 opacity-5" size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 2. Top Items Table */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Top 20 Items (Last 30 Days)
            </h4>
            <div className="flex gap-2">
               <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none shadow-sm hover:border-slate-400 transition-colors">
                  <option value="ALL">All Vendors</option>
                  {vendors.map(v => <option key={v} value={v}>{v}</option>)}
               </select>
               <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none shadow-sm hover:border-slate-400 transition-colors">
                  <option value="ALL">All Depts</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Material Detail</th>
                    <th className="px-6 py-5">Dept</th>
                    <th className="px-6 py-5 text-right">Price ({filterTier})</th>
                    <th className="px-6 py-5 text-center">Uses</th>
                    <th className="px-8 py-5 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 group transition-colors">
                      <td className="px-8 py-5">
                         <p className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase truncate max-w-[240px]">{item.name}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.brand || 'No Brand'}</p>
                      </td>
                      <td className="px-6 py-5">
                         <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest">{item.department || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <span className="text-xs font-black text-slate-700">${(item.tierPrices[filterTier] as number || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-black border border-emerald-100 shadow-sm">{item.useCount}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(item.lastUsedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </td>
                    </tr>
                  ))}
                  {topItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center text-slate-300 italic uppercase text-[10px] font-black tracking-widest flex flex-col items-center">
                        <ICONS.Search size={32} className="mb-4 opacity-20" />
                        No usage detected in selected criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Side Panels */}
        <div className="xl:col-span-4 space-y-8">
           {/* Category Velocity */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Utilization Velocity</h4>
              <div className="space-y-6">
                 {topCategories.map(([cat, count]) => {
                   const max = topCategories[0][1] || 1;
                   const pct = (count / max) * 100;
                   return (
                    <div key={cat} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest truncate max-w-[150px]">{cat}</span>
                          <span className="text-[10px] font-black text-slate-900">{count} Uses</span>
                       </div>
                       <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                       </div>
                    </div>
                   );
                 })}
                 {topCategories.length === 0 && <p className="text-[10px] text-slate-300 italic text-center py-10 uppercase tracking-widest">No category benchmarks</p>}
              </div>
           </div>

           {/* Recent Estimating Events */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Recent Activity</h4>
              <div className="space-y-4">
                 {recentUsage.slice(0, 10).map(item => (
                   <div key={item.id} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors -mx-4 px-4 rounded-2xl">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                         <ICONS.Receipt size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-slate-900 truncate uppercase">{item.name}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{new Date(item.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase truncate">Catalog Sync</span>
                         </div>
                      </div>
                   </div>
                 ))}
                 {recentUsage.length === 0 && <p className="text-[10px] text-slate-300 italic text-center py-10 uppercase tracking-widest">Waiting for events</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsUsageSection;
