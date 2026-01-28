
import React, { useState, useEffect } from 'react';
import { Vendor, User, UserRole, CatalogItem, PurchaseOrder, Delivery, SubAssignment, VendorContact } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, getJSON, setJSON } from '../../lib/storage';
import CatalogManager from './CatalogManager';
import CompliancePanel from './CompliancePanel';
import ContactManager from './ContactManager';
import POList from './POList';

interface VendorProfileProps {
  vendor: Vendor;
  user: User;
  onUpdate: (v: Vendor) => void;
  onBack: () => void;
}

const VendorProfile: React.FC<VendorProfileProps> = ({ vendor, user, onUpdate, onBack }) => {
  const isSupplier = vendor.vendorTypes.includes('supplier');
  const isSub = vendor.vendorTypes.includes('subcontractor');
  
  const [activeTab, setActiveTab] = useState(isSupplier ? 'catalog' : 'compliance');
  const [contacts, setContacts] = useState<VendorContact[]>([]);

  useEffect(() => {
    const allContacts = getJSON<VendorContact[]>(STORAGE_KEYS.CONTACTS, []);
    setContacts(allContacts.filter(c => c.vendorId === vendor.id));
  }, [vendor.id]);

  const supplierTabs = [
    { id: 'overview', label: 'Overview', icon: <ICONS.Search size={14} /> },
    { id: 'contacts', label: 'Contacts', icon: <ICONS.Users size={14} /> },
    { id: 'catalog', label: 'Catalog / Pricing', icon: <ICONS.Receipt size={14} /> },
    { id: 'rules', label: 'Lead Times', icon: <ICONS.Clock size={14} /> },
    { id: 'pos', label: 'Purchase Orders', icon: <ICONS.FileText size={14} /> },
    { id: 'deliveries', label: 'Deliveries', icon: <ICONS.Truck size={14} /> },
    { id: 'performance', label: 'Performance', icon: <ICONS.TrendingUp size={14} /> },
  ];

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: <ICONS.Search size={14} /> },
    { id: 'contacts', label: 'Contacts', icon: <ICONS.Users size={14} /> },
    { id: 'compliance', label: 'Compliance', icon: <ICONS.ShieldCheck size={14} /> },
    { id: 'assignments', label: 'Assignments', icon: <ICONS.Briefcase size={14} /> },
    { id: 'performance', label: 'Performance', icon: <ICONS.TrendingUp size={14} /> },
  ];

  const activeTabs = isSupplier ? supplierTabs : subTabs;

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-4 md:-m-6 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
              <ICONS.ChevronRight className="rotate-180" size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{vendor.name}</h1>
                <div className="flex gap-1">
                  {vendor.vendorTypes.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase rounded">{t}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{vendor.region} • {vendor.active ? 'Active Partner' : 'Inactive'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <ICONS.MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {activeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'catalog' && isSupplier && <CatalogManager vendorId={vendor.id} user={user} />}
          {activeTab === 'compliance' && isSub && <CompliancePanel vendor={vendor} onUpdate={onUpdate} user={user} />}
          {activeTab === 'contacts' && <ContactManager vendorId={vendor.id} contacts={contacts} setContacts={setContacts} />}
          {activeTab === 'pos' && <POList vendor={vendor} user={user} />}
          
          {!['catalog', 'compliance', 'contacts', 'pos'].includes(activeTab) && (
            <div className="h-[400px] bg-white rounded-[40px] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center p-12">
               <ICONS.Construction size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{activeTab.replace('_', ' ')} under construction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
