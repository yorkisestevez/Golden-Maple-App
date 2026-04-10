import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { StatsCards } from '@/components/dashboard/StatsCards';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - now.getDay() * 86400000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Get contractor info
  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('id', user.id)
    .single();

  // Leads today
  const { count: leadsToday } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('contractor_id', user.id)
    .gte('created_at', startOfDay);

  // Leads this week
  const { count: leadsThisWeek } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('contractor_id', user.id)
    .gte('created_at', startOfWeek);

  // Leads this month
  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('contractor_id', user.id)
    .gte('created_at', startOfMonth);

  // Average estimate
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('estimate_mid')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const avgEstimate = recentLeads?.length
    ? Math.round(recentLeads.reduce((sum, l) => sum + Number(l.estimate_mid), 0) / recentLeads.length)
    : 0;

  // Recent leads
  const { data: latestLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Control Center
          </h1>
          <p className="text-slate-500 mt-2 font-black tracking-[0.2em] uppercase text-[10px]">
            {contractor?.company_name || 'TradeFlow AI'} &middot; Neural Operational Overview
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm self-start sm:self-auto">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 bg-emerald-500 rounded-full heartbeat" />
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-40" />
          </div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Neural Engine Live</span>
        </div>
      </div>

      <StatsCards
        leadsToday={leadsToday || 0}
        leadsThisWeek={leadsThisWeek || 0}
        leadsThisMonth={leadsThisMonth || 0}
        avgEstimate={avgEstimate}
      />

      <DashboardCharts />

      {/* Recent leads */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h2>
        {latestLeads && latestLeads.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left p-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Name</th>
                  <th className="text-left p-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Phone</th>
                  <th className="text-left p-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Allocation</th>
                  <th className="text-left p-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
                  <th className="text-left p-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {latestLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 text-slate-900 font-bold tracking-tight">{lead.name}</td>
                    <td className="p-6 text-slate-500 font-medium">{lead.phone}</td>
                    <td className="p-6 text-blue-600 font-black tracking-tighter italic">
                      ${Number(lead.estimate_mid).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        lead.status === 'new' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        lead.status === 'contacted' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        lead.status === 'won' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        lead.status === 'lost' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 font-medium">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-xl shadow-blue-500/5">
            <p className="text-slate-400 font-bold italic">Awaiting initial leads. Propagate your estimator to initiate neural capture.</p>
          </div>
        )}
      </div>
    </div>
  );
}
