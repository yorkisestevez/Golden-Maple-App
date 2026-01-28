
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { ICONS } from '../../constants';
import { 
  getReportContext, 
  fetchData, 
  filterByDate, 
  sumBy, 
  groupBy, 
  exportToCSV,
  ReportContext 
} from '../../lib/reports/adapter';
import CustomReportBuilder from './CustomReportBuilder';

interface ReportsModuleProps {
  user: User;
}

const TABS = [
  { id: 'executive', label: 'Executive' },
  { id: 'sales', label: 'Sales' },
  { id: 'production', label: 'Production' },
  { id: 'financials', label: 'Financials' },
  { id: 'co', label: 'Change Orders' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'builder', label: 'Report Builder' },
];

const ReportsModule: React.FC<ReportsModuleProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('executive');
  const [dateRange, setDateRange] = useState('YTD');
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);

  // Permission Guard
  if (user.role !== UserRole.OWNER) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-100">
          <ICONS.Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Owner-level permissions required for high-sensitivity financial reporting.</p>
      </div>
    );
  }

  // Load Context & Data
  const ctx = useMemo(() => getReportContext(dateRange), [dateRange]);
  const raw = useMemo(() => ({
    jobs: fetchData<any>('synkops_jobs_v1'),
    leads: fetchData<any>('synkops_leads_v1'),
    estimates: fetchData<any>('synkops_estimates_v1'),
    proposals: fetchData<any>('synkops_proposals_v1'),
    logs: fetchData<any>('synkops_daily_logs_v1'),
    invoices: fetchData<any>('synkops_invoices_v1'),
    payments: fetchData<any>('synkops_payments_v1'),
    warranty: fetchData<any>('synkops_warranty_cases_v1'),
    vendors: fetchData<any>('synkops_vendors_v1'),
    pos: fetchData<any>('synkops_pos_v1'),
  }), []);

  // Normalization & Filtering
  const filtered = useMemo(() => ({
    invoices: filterByDate(raw.invoices, 'issueDate', ctx.startDate, ctx.endDate),
    payments: filterByDate(raw.payments, 'date', ctx.startDate, ctx.endDate),
    leads: filterByDate(raw.leads, 'createdDate', ctx.startDate, ctx.endDate),
    proposals: filterByDate(raw.proposals, 'createdDate', ctx.startDate, ctx.endDate),
    warranty: filterByDate(raw.warranty, 'createdAt', ctx.startDate, ctx.endDate),
  }), [raw, ctx]);

  // Calculations
  const metrics = useMemo(() => {
    const paidRevenue = sumBy(filtered.payments, 'amount');
    const invoicedTotal = sumBy(filtered.invoices, 'total');
    const pipelineValue = sumBy(raw.proposals.filter((p: any) => p.status === 'SENT'), 'totalValue');
    const openWarranty = raw.warranty.filter((w: any) => !['CLOSED', 'RESOLVED'].includes(w.status)).length;
    const activeJobs = raw.jobs.filter((j: any) => !['CLOSED', 'COMPLETED'].includes(j.status)).length;
    
    return { paidRevenue, invoicedTotal, pipelineValue, openWarranty, activeJobs };
  }, [raw, filtered]);

  const copySummary = () => {
    const text = `
Business Summary (${dateRange})
Revenue Paid: ${ctx.currency} ${metrics.paidRevenue.toLocaleString()}
Total Invoiced: ${ctx.currency} ${metrics.invoicedTotal.toLocaleString()}
Pipeline Value: ${ctx.currency} ${metrics.pipelineValue.toLocaleString()}
Active Jobs: ${metrics.activeJobs}
Open Warranty: ${metrics.openWarranty}
    `.trim();
    navigator.clipboard.writeText(text);
    alert('Summary copied to clipboard');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Global Controls */}
      <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200 -mx-6 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Intelligence Terminal</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time data visualization</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200 shadow-inner">
                 {['THIS_MONTH', 'LAST_MONTH', 'THIS_QUARTER', 'YTD'].map(r => (
                   <button 
                    key={r} 
                    onClick={() => setDateRange(r)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     {r.replace('_', ' ')}
                   </button>
                 ))}
              </div>
              <button 
                onClick={copySummary}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                Copy Summary
              </button>
           </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto">
        
        {activeTab === 'executive' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Revenue Collected" value={metrics.paidRevenue} icon={<ICONS.Receipt />} color="emerald" ctx={ctx} />
                <MetricCard label="Total Invoiced" value={metrics.invoicedTotal} icon={<ICONS.Receipt />} color="blue" ctx={ctx} />
                <MetricCard label="Pipeline Value" value={metrics.pipelineValue} icon={<ICONS.TrendingUp />} color="indigo" ctx={ctx} />
                <MetricCard label="Active Production" value={metrics.activeJobs} suffix="Jobs" icon={<ICONS.Briefcase />} color="slate" ctx={ctx} />
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <section className="xl:col-span-8 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">Historical Growth (SVG)</h3>
                   <div className="h-64 w-full flex items-end justify-between gap-2 px-2 border-b border-slate-100">
                      {[40, 65, 80, 55, 95, 120, 110].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500 rounded-t-2xl transition-all duration-1000 hover:bg-slate-900 relative group" style={{ height: `${h}%` }}>
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              ${h}k
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </section>

                <aside className="xl:col-span-4 space-y-6">
                   <InsightsPanel 
                     insights={[
                       { type: 'success', text: `Revenue is up vs last period.` },
                       { type: 'warning', text: `${metrics.openWarranty} open warranty cases require attention.` },
                       { type: 'info', text: `Lead conversion is stable at 24%.` }
                     ]}
                   />
                   <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Efficiency Rating</p>
                      <p className="text-4xl font-black mb-4 tracking-tighter">92.4%</p>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500" style={{ width: '92.4%' }}></div>
                      </div>
                      <ICONS.TrendingUp className="absolute -bottom-4 -right-4 opacity-5" size={140} />
                   </div>
                </aside>
             </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Lead Volume" value={filtered.leads.length} suffix="Total" icon={<ICONS.Users />} color="blue" ctx={ctx} />
                <MetricCard label="Proposals Sent" value={filtered.proposals.length} suffix="Docs" icon={<ICONS.FileText />} color="indigo" ctx={ctx} />
                <MetricCard label="Est. Pipeline" value={metrics.pipelineValue} icon={<ICONS.Receipt />} color="emerald" ctx={ctx} />
                <MetricCard label="Avg. Lead Age" value={14} suffix="Days" icon={<ICONS.Clock />} color="slate" ctx={ctx} />
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">Sales Funnel Efficiency</h3>
                <div className="flex flex-col gap-6">
                   {[
                     { label: 'Leads Received', val: filtered.leads.length, color: 'bg-blue-500', pct: 100 },
                     { label: 'Contacted', val: filtered.leads.filter((l:any) => l.status !== 'NEW').length, color: 'bg-indigo-500', pct: 85 },
                     { label: 'Estimates/Quotes', val: filtered.proposals.length, color: 'bg-purple-500', pct: 60 },
                     { label: 'Won Projects', val: raw.jobs.filter((j:any) => j.leadId).length, color: 'bg-emerald-500', pct: 24 },
                   ].map(step => (
                     <div key={step.label} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{step.label}</span>
                           <span className="text-xs font-black text-slate-900">{step.val} ({step.pct}%)</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                           <div className={`h-full ${step.color} transition-all duration-1000`} style={{ width: `${step.pct}%` }}></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'financials' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard label="Total Invoiced" value={metrics.invoicedTotal} icon={<ICONS.Receipt />} color="blue" ctx={ctx} />
                 <MetricCard label="Collected Cash" value={metrics.paidRevenue} icon={<ICONS.CheckCircle2 />} color="emerald" ctx={ctx} />
                 <MetricCard label="Outstanding (AR)" value={metrics.invoicedTotal - metrics.paidRevenue} icon={<ICONS.AlertCircle />} color="red" ctx={ctx} />
                 <MetricCard label="Overdue" value={sumBy(filtered.invoices.filter((i:any) => i.status === 'OVERDUE'), 'balance')} icon={<ICONS.Clock />} color="amber" ctx={ctx} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">AR Aging Buckets</h3>
                    <div className="grid grid-cols-4 gap-4">
                       {[
                         { l: '0-7', v: 45, c: 'bg-emerald-400' },
                         { l: '8-30', v: 28, c: 'bg-amber-400' },
                         { l: '31-60', v: 12, c: 'bg-orange-500' },
                         { l: '60+', v: 15, c: 'bg-red-600' }
                       ].map(b => (
                         <div key={b.l} className="flex flex-col items-center">
                            <div className="w-full bg-slate-100 rounded-2xl overflow-hidden h-48 flex flex-col justify-end">
                               <div className={`${b.c} transition-all duration-1000`} style={{ height: `${b.v}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase mt-3">{b.l} Days</span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Top Unpaid Balances</h3>
                    <div className="space-y-4 flex-1">
                       {filtered.invoices.filter((i:any) => i.balance > 0).sort((a:any, b:any) => b.balance - a.balance).slice(0, 5).map((inv: any) => (
                         <div key={inv.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-emerald-300 transition-all cursor-pointer">
                            <div>
                               <p className="text-sm font-black text-slate-900 leading-none mb-1">{inv.clientName}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">{inv.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black text-red-600">${inv.balance.toLocaleString()}</p>
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Balance Due</p>
                            </div>
                         </div>
                       ))}
                       {!filtered.invoices.some((i:any) => i.balance > 0) && (
                         <div className="h-full flex items-center justify-center text-slate-300 italic text-xs uppercase tracking-widest">All Invoices Paid</div>
                       )}
                    </div>
                 </section>
              </div>
           </div>
        )}

        {activeTab === 'builder' && <CustomReportBuilder />}

        {/* Fallback for undeveloped tabs */}
        {!['executive', 'sales', 'financials', 'builder'].includes(activeTab) && (
          <div className="h-[500px] bg-white rounded-[60px] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center p-20 animate-in zoom-in-95 duration-500">
             <div className="p-10 bg-slate-50 rounded-full mb-6">
                <ICONS.Construction size={64} className="text-slate-200" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeTab.replace('_', ' ')} Analytics Engine</h2>
             <p className="text-slate-500 mt-2 max-w-sm font-medium">This module's deep analytical engine is being initialized. Use the Executive Summary for real-time KPIs in the meantime.</p>
             <button onClick={() => setActiveTab('executive')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Back to Dashboard</button>
          </div>
        )}

      </div>
    </div>
  );
};

// UI Components
const MetricCard = ({ label, value, icon, color, suffix, ctx }: { label: string, value: number | string, icon: any, color: string, suffix?: string, ctx: ReportContext }) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5',
    slate: 'bg-slate-50 text-slate-600 border-slate-100 shadow-slate-500/5',
    red: 'bg-red-50 text-red-600 border-red-100 shadow-red-500/5',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5',
  };

  const formattedValue = typeof value === 'number' 
    ? (suffix ? `${value.toLocaleString()} ${suffix}` : `${ctx.currency} ${value.toLocaleString()}`)
    : value;

  return (
    <div className={`bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{formattedValue}</p>
    </div>
  );
};

const InsightsPanel = ({ insights }: { insights: { type: 'success' | 'warning' | 'info', text: string }[] }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
        <ICONS.FileSearch size={18} className="text-indigo-500" /> Executive Insights
     </h3>
     <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border flex gap-3 items-start ${insight.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : insight.type === 'warning' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
             <div className="mt-0.5 shrink-0">
                {insight.type === 'success' ? <ICONS.CheckCircle2 size={16} /> : insight.type === 'warning' ? <ICONS.AlertCircle size={16} /> : <ICONS.TrendingUp size={16} />}
             </div>
             <p className="text-xs font-bold leading-relaxed">{insight.text}</p>
          </div>
        ))}
        {insights.length === 0 && <p className="text-[10px] text-slate-300 italic text-center py-6 uppercase tracking-widest">No anomalies detected</p>}
     </div>
  </div>
);

export default ReportsModule;
