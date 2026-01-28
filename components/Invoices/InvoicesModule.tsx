
import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, InvoiceStatus, InvoiceType, Job, User, UserRole, Payment, CompanyConfig, ChangeOrder, ChangeOrderStatus } from '../../types';
import { ICONS } from '../../constants';
import InvoiceEditor from './InvoiceEditor';
import InvoiceDocument from './InvoiceDocument';
import PaymentModal from './PaymentModal';

interface InvoicesModuleProps {
  user: User;
  jobs: Job[];
  config: CompanyConfig;
}

const INVOICE_STORAGE_KEY = 'synkops_invoices_v1';
const PAYMENT_STORAGE_KEY = 'synkops_payments_v1';
const CO_STORAGE_KEY = 'synkops_change_orders_v1';

const InvoicesModule: React.FC<InvoicesModuleProps> = ({ user, jobs, config }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [jobFilter, setJobFilter] = useState<string>('ALL');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDocViewOpen, setIsDocViewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Load Data
  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
    const savedPayments = localStorage.getItem(PAYMENT_STORAGE_KEY);
    const savedCOs = localStorage.getItem(CO_STORAGE_KEY);
    
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    if (savedCOs) setChangeOrders(JSON.parse(savedCOs));
  }, []);

  const persistData = (newInvoices: Invoice[], newPayments: Payment[], newCOs?: ChangeOrder[]) => {
    setInvoices(newInvoices);
    setPayments(newPayments);
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(newInvoices));
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(newPayments));
    if (newCOs) {
      setChangeOrders(newCOs);
      localStorage.setItem(CO_STORAGE_KEY, JSON.stringify(newCOs));
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = searchQuery === '' || 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.jobName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesJob = jobFilter === 'ALL' || inv.jobId === jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, searchQuery, statusFilter, jobFilter]);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsEditorOpen(true);
  };

  const handleView = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDocViewOpen(true);
  };

  const handleRecordPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleSaveInvoice = (inv: Invoice, linkedCOIds: string[]) => {
    const exists = invoices.find(i => i.id === inv.id);
    let updatedCOs = [...changeOrders];
    
    // If COs are linked, mark them as invoiced
    if (linkedCOIds.length > 0) {
      updatedCOs = changeOrders.map(co => 
        linkedCOIds.includes(co.id) ? { ...co, invoicedAt: new Date().toISOString(), invoiceId: inv.id } : co
      );
    }

    const newInvoices = exists 
      ? invoices.map(i => i.id === inv.id ? inv : i)
      : [...invoices, inv];

    persistData(newInvoices, payments, updatedCOs);
    setIsEditorOpen(false);
  };

  const onAddPayment = (payment: Payment) => {
    const newPayments = [...payments, payment];
    const targetInvoice = invoices.find(i => i.id === payment.invoiceId);
    
    if (targetInvoice) {
      const newBalance = targetInvoice.balance - payment.amount;
      // Fix for line 108: Accessing PARTIALLY_PAID which is now in InvoiceStatus enum
      const newStatus = newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
      
      const newInvoices = invoices.map(i => 
        i.id === payment.invoiceId ? { ...i, balance: newBalance, status: newStatus } : i
      );
      persistData(newInvoices, newPayments);
    }
    setIsPaymentModalOpen(false);
  };

  const handleVoid = (id: string) => {
    const reason = window.prompt("Reason for voiding this invoice?");
    if (reason !== null) {
      const newInvoices = invoices.map(i => 
        i.id === id ? { ...i, status: InvoiceStatus.VOID, voidReason: reason, updatedAt: new Date().toISOString() } : i
      );
      persistData(newInvoices, payments);
    }
  };

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      // Fix for line 131: Accessing READY_TO_SEND from InvoiceStatus enum
      case InvoiceStatus.READY_TO_SEND: return 'bg-blue-100 text-blue-700';
      case InvoiceStatus.SENT: return 'bg-indigo-100 text-indigo-700';
      // Fix for line 133: Accessing PARTIALLY_PAID from InvoiceStatus enum
      case InvoiceStatus.PARTIALLY_PAID: return 'bg-amber-100 text-amber-700';
      case InvoiceStatus.PAID: return 'bg-emerald-100 text-emerald-700';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700';
      case InvoiceStatus.VOID: return 'bg-slate-200 text-slate-400 line-through';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoicing & Billing</h1>
          <p className="text-sm text-slate-500 font-medium">Manage project draws, payments, and balances.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
          >
            <ICONS.Plus size={18} /> New Invoice
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 shrink-0 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Invoice #, Client, or Job..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer appearance-none"
        >
          <option value="ALL">All Statuses</option>
          {/* Fixed: cast enum to string for replace operation */}
          {Object.values(InvoiceStatus).map(s => <option key={s as string} value={s as string}>{(s as string).replace('_', ' ')}</option>)}
        </select>

        <select 
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer appearance-none"
        >
          <option value="ALL">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv # / Issued</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job / Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">{inv.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(inv.issueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-700">{inv.jobName}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{inv.clientName}</div>
                  </td>
                  <td className="px-6 py-5">
                    {/* Fix for line 219: Accessing type property which is now defined in Invoice interface */}
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(inv.status)}`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900 text-sm">
                    ${inv.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 font-black text-sm">
                    <span className={inv.balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      ${inv.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleView(inv)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200" title="View Document">
                        <ICONS.FileText size={16} />
                      </button>
                      {isAdmin && inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.VOID && (
                        <>
                          <button onClick={() => handleRecordPayment(inv)} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700" title="Record Payment">
                            <ICONS.Receipt size={16} />
                          </button>
                          <button onClick={() => handleVoid(inv.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100" title="Void Invoice">
                            <ICONS.Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ICONS.Receipt size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-bold">No invoices found</p>
                <p className="text-slate-400 text-sm">Select a job to start billing.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <InvoiceEditor 
          jobs={jobs}
          config={config}
          onSave={handleSaveInvoice}
          onCancel={() => setIsEditorOpen(false)}
          changeOrders={changeOrders}
        />
      )}

      {isDocViewOpen && selectedInvoice && (
        <InvoiceDocument 
          invoice={selectedInvoice}
          companyName={config.name}
          payments={payments.filter(p => p.invoiceId === selectedInvoice.id)}
          onClose={() => setIsDocViewOpen(false)}
        />
      )}

      {isPaymentModalOpen && selectedInvoice && (
        <PaymentModal 
          invoice={selectedInvoice}
          onSave={onAddPayment}
          onCancel={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InvoicesModule;
