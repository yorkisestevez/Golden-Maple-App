
import React, { useState } from 'react';
import { VendorContact } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, safeSetJSON, safeGetJSON, uid } from '../../lib/storage';

interface ContactManagerProps {
  vendorId: string;
  contacts: VendorContact[];
  setContacts: React.Dispatch<React.SetStateAction<VendorContact[]>>;
}

const ContactManager: React.FC<ContactManagerProps> = ({ vendorId, contacts, setContacts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState<Partial<VendorContact>>({
    name: '', role: '', phone: '', email: ''
  });

  const saveContacts = (list: VendorContact[]) => {
    const all = safeGetJSON<VendorContact[]>(STORAGE_KEYS.CONTACTS, []);
    const filtered = all.filter(c => c.vendorId !== vendorId);
    safeSetJSON(STORAGE_KEYS.CONTACTS, [...filtered, ...list]);
    setContacts(list);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: VendorContact = {
      id: uid('VCON'),
      vendorId,
      name: newContact.name || 'Unnamed',
      role: newContact.role || 'Representative',
      phone: newContact.phone || '',
      email: newContact.email || '',
    };
    saveContacts([...contacts, contact]);
    setIsAdding(false);
    setNewContact({ name: '', role: '', phone: '', email: '' });
  };

  const removeContact = (id: string) => {
    if (window.confirm("Remove this contact from the vendor profile?")) {
      saveContacts(contacts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Vendor Representatives</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          + Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative">
             <button onClick={() => removeContact(c.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <ICONS.Trash2 size={16} />
             </button>
             <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors border border-slate-100 shadow-inner">
                   <ICONS.User size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">{c.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{c.role}</p>
                </div>
             </div>
             
             <div className="space-y-3 pt-6 border-t border-slate-50">
                <a href={`tel:${c.phone}`} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                   <ICONS.Phone size={14} className="text-slate-300" /> {c.phone || 'No Mobile'}
                </a>
                <a href={`mailto:${c.email}`} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                   <ICONS.Mail size={14} className="text-slate-300" /> {c.email || 'No Email'}
                </a>
             </div>
          </div>
        ))}
        {contacts.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] opacity-40">
             <ICONS.Users size={48} className="mx-auto mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No assigned contacts</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Contact</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Vendor Network</p>
             </div>
             <form onSubmit={handleAdd} className="space-y-6">
                <input required placeholder="Full Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
                <input placeholder="Job Role (e.g. Territory Rep)" value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="tel" placeholder="Mobile Phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="email" placeholder="Direct Email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
                   <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800">Add to Profile</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
