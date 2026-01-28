
import React, { useState, useEffect, useMemo } from 'react';
// Fix for line 3: Imports consolidated
import { Vendor, User, UserRole, Pricebook } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, getJSON, setJSON } from '../../lib/storage';
import VendorForm from './VendorForm';
import CatalogDashboard from './Catalog/CatalogDashboard';
import ImportWizard from './Import/ImportWizard';

const VendorsModule: React.FC<{ user: User }> = ({ user }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pricebooks, setPricebooks] = useState<Pricebook[]>([]);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importVendor, setImportVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    setVendors(getJSON<Vendor[]>(STORAGE_KEYS.VENDORS, []));
    setPricebooks(getJSON<Pricebook[]>(STORAGE_KEYS.PRICEBOOKS, []));
  }, []);

  const handleSaveVendor = (vendor: Vendor) => {
    const updated = vendors.find(v => v.id === vendor.id)
      ? vendors.map(v => v.id === vendor.id ? vendor : v)
      : [...vendors, vendor];
    setVendors(updated);
    setJSON(STORAGE_KEYS.VENDORS, updated);
    setIsFormOpen(false);
  };

  const activeVendor = useMemo(() => vendors.find(v => v.id === activeVendorId), [vendors, activeVendorId]);

  if (activeVendorId && activeVendor) {
    // Fixed: Passed required onImport prop and removed user prop which is not defined in CatalogDashboardProps
    return (
      <CatalogDashboard 
        vendor={activeVendor} 
        onBack={() => setActiveVendorId(null)} 
        onImport={() => {
          setImportVendor(activeVendor);
          setIsImportOpen(true);
        }}
      />
    );
  }

  if (isImportOpen) {
    return (
      <ImportWizard 
        user={user} 
        vendor={importVendor}
        onComplete={() => {
          setIsImportOpen(false);
          setPricebooks(getJSON<Pricebook[]>(STORAGE_KEYS.PRICEBOOKS, []));
        }} 
        onCancel={() => setIsImportOpen(false)} 
      />
    );
  }

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Supply Chain & Pricing</h1>
          <p className="text-sm text-slate-500 font-medium">Manage vendor catalogs and estimating-ready pricebooks.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
          >
            <ICONS.Plus size={18} /> Add New Vendor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendors.map(v => {
          const activePB = pricebooks.find(pb => pb.vendorId === v.id && pb.status === 'active');
          return (
            <div 
              key={v.id} 
              className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full overflow-hidden"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors border border-slate-100">
                    <ICONS.Truck size={32} />
                  </div>
                  {activePB && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">
                      v{new Date(activePB.effectiveDateISO).getFullYear()} Active
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{v.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{v.region || 'Regional Supplier'}</p>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">Default Tier</span>
                    <span className="text-slate-900">{v.defaultTier}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">Effective Date</span>
                    <span className="text-slate-900">{activePB ? new Date(activePB.effectiveDateISO).toLocaleDateString() : 'No Pricebook'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => setActiveVendorId(v.id)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm"
                >
                  View Catalog
                </button>
                <button 
                  onClick={() => { setImportVendor(v); setIsImportOpen(true); }}
                  className="px-4 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase transition-all hover:bg-slate-800"
                  title="Import/Update Pricebook"
                >
                  <ICONS.RefreshCcw size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {vendors.length === 0 && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="h-[360px] rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-emerald-200 hover:text-emerald-500 transition-all group"
          >
            <ICONS.Plus size={48} className="mb-4 group-hover:scale-110 transition-transform" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">Add Your First Vendor</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <VendorForm 
          onSave={handleSaveVendor} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default VendorsModule;
