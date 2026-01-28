
import React, { useState, useMemo } from 'react';
import { SynkOpsSettingsV1, EmployeeV2, UserRole } from '../../../types';
import { ICONS } from '../../../constants';
import { getSettings, saveSettings, computeLoadedRate, syncAllLoadedCosts } from '../../../lib/settings';
import Input from '../../ui/Input';

const CrewHRPanel: React.FC = () => {
  const [settings, setSettings] = useState<SynkOpsSettingsV1>(getSettings());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const employees = settings.crewHR.employees;

  const handleAdd = () => {
    const newEmp: EmployeeV2 = {
      id: `EMP-${Date.now()}`,
      status: 'active',
      name: 'New Employee',
      role: 'installer',
      employmentType: 'hourly',
      defaultBillable: true,
      pay: { baseRate: 35, salaryAnnual: null, subcontractRate: null },
      burden: { burdenPercentOverride: null },
      loadedCost: { loadedRate: 0, lastComputedAtISO: '' },
      permissions: { appRole: 'crew', canApproveChangeOrders: false, canViewFinancials: false },
      notes: ''
    };
    
    const updated = {
      ...settings,
      crewHR: { ...settings.crewHR, employees: [newEmp, ...employees] }
    };
    setSettings(syncAllLoadedCosts(updated));
    setEditingId(newEmp.id);
  };

  const handleUpdate = (id: string, patch: Partial<EmployeeV2>) => {
    const updatedEmps = employees.map(emp => emp.id === id ? { ...emp, ...patch } : emp);
    const updated = { ...settings, crewHR: { ...settings.crewHR, employees: updatedEmps } };
    setSettings(syncAllLoadedCosts(updated));
  };

  const handleRecalcAll = () => {
    const updated = syncAllLoadedCosts(settings);
    setSettings(updated);
    saveSettings(updated);
    alert("All loaded labor costs recalculated against current burden rules.");
  };

  const handleSaveAll = () => {
    saveSettings(settings);
    alert("Employee roster and HR settings committed.");
  };

  const activeEmp = useMemo(() => employees.find(e => e.id === editingId), [employees, editingId]);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Crew & Human Resources</h2>
          <p className="text-sm text-slate-500 font-medium">Standardize labor costs and site permissions.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleRecalcAll} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
              <ICONS.RefreshCcw size={14} /> Recalc Rates
           </button>
           <button onClick={handleAdd} className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">
              + Add Employee
           </button>
        </div>
      </div>

      <div className="flex flex-1 gap-8 min-h-0 overflow-hidden">
        {/* ROSTER LIST */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Index ({employees.filter(e => e.status === 'active').length} Active)</h3>
           </div>
           <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-4">Name / Status</th>
                       <th className="px-8 py-4">Role</th>
                       <th className="px-8 py-4">Type</th>
                       <th className="px-8 py-4 text-right">Loaded Rate</th>
                       <th className="px-8 py-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {employees.map(emp => (
                      <tr key={emp.id} className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${editingId === emp.id ? 'bg-emerald-50/30' : ''}`} onClick={() => setEditingId(emp.id)}>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase text-[10px]">{emp.name.charAt(0)}</div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</p>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp.role.replace(/_/g, ' ')}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{emp.employmentType}</span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <span className="text-sm font-black text-slate-900">${emp.loadedCost.loadedRate?.toFixed(2)}</span>
                            <p className="text-[8px] font-black text-slate-300 uppercase">Per billable hr</p>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <ICONS.ChevronRight size={16} className={`text-slate-200 transition-all ${editingId === emp.id ? 'translate-x-2 text-emerald-500' : 'group-hover:text-slate-400'}`} />
                         </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-300 italic text-xs uppercase tracking-widest font-black">No personnel in roster</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* EDITOR SIDEBAR */}
        <aside className="w-[450px] bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-500">
           {activeEmp ? (
              <>
                 <header className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeEmp.name}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Profile Intelligence</p>
                    </div>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white rounded-xl text-slate-300 transition-all"><ICONS.Plus className="rotate-45" size={24} /></button>
                 </header>

                 <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                    {/* Pay & Burden */}
                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Compensation Logic</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Pay Type</label>
                             <select 
                               value={activeEmp.employmentType}
                               onChange={e => handleUpdate(activeEmp.id, { employmentType: e.target.value as any })}
                               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs uppercase"
                             >
                                <option value="hourly">Hourly Pay</option>
                                <option value="salary">Annual Salary</option>
                                <option value="subcontract">Subcontractor</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Base Rate ($)</label>
                             {activeEmp.employmentType === 'hourly' && (
                                <Input type="number" value={activeEmp.pay.baseRate || 0} onChange={e => handleUpdate(activeEmp.id, { pay: { ...activeEmp.pay, baseRate: Number(e.target.value) }})} />
                             )}
                             {activeEmp.employmentType === 'salary' && (
                                <Input type="number" value={activeEmp.pay.salaryAnnual || 0} onChange={e => handleUpdate(activeEmp.id, { pay: { ...activeEmp.pay, salaryAnnual: Number(e.target.value) }})} />
                             )}
                             {activeEmp.employmentType === 'subcontract' && (
                                <Input type="number" value={activeEmp.pay.subcontractRate || 0} onChange={e => handleUpdate(activeEmp.id, { pay: { ...activeEmp.pay, subcontractRate: Number(e.target.value) }})} />
                             )}
                          </div>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Payroll Burden % (Override)</label>
                          <div className="flex items-center gap-4">
                             <Input 
                               type="number" 
                               placeholder="Using global default..." 
                               value={activeEmp.burden.burdenPercentOverride === null ? '' : activeEmp.burden.burdenPercentOverride} 
                               onChange={e => handleUpdate(activeEmp.id, { burden: { burdenPercentOverride: e.target.value === '' ? null : Number(e.target.value) }})} 
                             />
                             {activeEmp.burden.burdenPercentOverride === null && (
                                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase whitespace-nowrap">Global: {settings.financialBrain.labor.laborBurdenPercent}%</span>
                             )}
                          </div>
                       </div>

                       <div className="bg-slate-900 rounded-[32px] p-8 text-white flex justify-between items-center relative overflow-hidden">
                          <div>
                             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Final Loaded Cost</p>
                             <p className="text-4xl font-black tracking-tighter text-emerald-400">${activeEmp.loadedCost.loadedRate?.toFixed(2)}<span className="text-xs opacity-40 ml-1">/HR</span></p>
                          </div>
                          <ICONS.HardHat className="absolute -bottom-4 -right-4 opacity-5" size={100} />
                       </div>
                    </section>

                    {/* Permissions & Security */}
                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Access & Permissions</h4>
                       <div className="space-y-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Application Role</label>
                             <select 
                               value={activeEmp.permissions.appRole}
                               onChange={e => handleUpdate(activeEmp.id, { permissions: { ...activeEmp.permissions, appRole: e.target.value as any }})}
                               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs uppercase"
                             >
                                <option value="owner">Owner / Admin</option>
                                <option value="office">Office / PM</option>
                                <option value="field_lead">Field Lead</option>
                                <option value="crew">Crew Member</option>
                             </select>
                          </div>
                          <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 cursor-pointer group">
                             <input type="checkbox" checked={activeEmp.permissions.canApproveChangeOrders} onChange={e => handleUpdate(activeEmp.id, { permissions: { ...activeEmp.permissions, canApproveChangeOrders: e.target.checked }})} className="w-5 h-5 rounded-lg accent-emerald-500" />
                             <span className="text-[10px] font-black text-slate-700 uppercase group-hover:text-emerald-700 transition-colors">Can Authorize Change Orders</span>
                          </label>
                          <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 cursor-pointer group">
                             <input type="checkbox" checked={activeEmp.permissions.canViewFinancials} onChange={e => handleUpdate(activeEmp.id, { permissions: { ...activeEmp.permissions, canViewFinancials: e.target.checked }})} className="w-5 h-5 rounded-lg accent-blue-500" />
                             <span className="text-[10px] font-black text-slate-700 uppercase group-hover:text-blue-700 transition-colors">Can View Project Margins</span>
                          </label>
                       </div>
                    </section>
                 </div>

                 <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button onClick={() => handleUpdate(activeEmp.id, { status: activeEmp.status === 'active' ? 'inactive' : 'active' })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeEmp.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                       {activeEmp.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">Close Editor</button>
                 </footer>
              </>
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center animate-in zoom-in-95">
                 <div className="p-10 bg-slate-50 rounded-full mb-8">
                    <ICONS.User size={64} className="text-slate-200" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Personnel Intelligence</h3>
                 <p className="text-sm text-slate-400 font-medium">Select an employee from the roster to manage payroll logic and permissions.</p>
              </div>
           )}
        </aside>
      </div>

      <footer className="shrink-0 flex justify-end">
         <button onClick={handleSaveAll} className="px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95">
           Commit HR & Personnel Changes
         </button>
      </footer>
    </div>
  );
};

export default CrewHRPanel;
