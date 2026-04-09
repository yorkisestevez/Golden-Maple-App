import { createClient } from '@/lib/supabase/server';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { redirect } from 'next/navigation';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F2EEE7]">
          Welcome back{contractor?.company_name ? `, ${contractor.company_name}` : ''}
        </h1>
        <p className="text-[#A89F91] mt-1">Here&apos;s your lead activity overview</p>
      </div>

      <StatsCards
        leadsToday={leadsToday || 0}
        leadsThisWeek={leadsThisWeek || 0}
        leadsThisMonth={leadsThisMonth || 0}
        avgEstimate={avgEstimate}
      />

      {/* Recent leads */}
      <div>
        <h2 className="text-lg font-semibold text-[#F2EEE7] mb-4">Recent Leads</h2>
        {latestLeads && latestLeads.length > 0 ? (
          <div className="bg-[#1A1814] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-[#A89F91] font-medium">Name</th>
                  <th className="text-left p-4 text-[#A89F91] font-medium">Phone</th>
                  <th className="text-left p-4 text-[#A89F91] font-medium">Estimate</th>
                  <th className="text-left p-4 text-[#A89F91] font-medium">Status</th>
                  <th className="text-left p-4 text-[#A89F91] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {latestLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-[#F2EEE7]">{lead.name}</td>
                    <td className="p-4 text-[#A89F91]">{lead.phone}</td>
                    <td className="p-4 text-[#D4AF63] font-medium">
                      ${Number(lead.estimate_mid).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                        lead.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-400' :
                        lead.status === 'won' ? 'bg-green-500/10 text-green-400' :
                        lead.status === 'lost' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#A89F91]">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#1A1814] rounded-xl border border-white/10 p-12 text-center">
            <p className="text-[#A89F91]">No leads yet. Share your estimator to start capturing leads!</p>
          </div>
        )}
      </div>
    </div>
  );
}
