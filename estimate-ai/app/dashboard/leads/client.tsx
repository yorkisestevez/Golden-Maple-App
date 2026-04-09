'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';

interface LeadsPageClientProps {
  leads: Lead[];
}

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400',
  contacted: 'bg-yellow-500/10 text-yellow-400',
  quoted: 'bg-purple-500/10 text-purple-400',
  won: 'bg-green-500/10 text-green-400',
  lost: 'bg-red-500/10 text-red-400',
};

export function LeadsPageClient({ leads: initialLeads }: LeadsPageClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const supabase = createClient();
    const updateData: Record<string, string> = { status: newStatus };
    if (newStatus === 'contacted') {
      updateData.contacted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: newStatus as Lead['status'], ...(newStatus === 'contacted' ? { contacted_at: new Date().toISOString() } : {}) }
            : l
        )
      );
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Estimate', 'Tier', 'Status', 'Date'];
    const rows = filtered.map((l) => [
      l.name,
      l.email || '',
      l.phone,
      `$${Number(l.estimate_mid).toLocaleString()}`,
      l.tier,
      l.status,
      new Date(l.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F2EEE7]">Leads</h1>
          <p className="text-[#A89F91] mt-1">{leads.length} total leads</p>
        </div>
        <Button variant="outline" onClick={exportCSV} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
          <Input
            id="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#0F0E0A] border border-white/10 rounded-lg text-[#F2EEE7] text-sm"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="bg-[#1A1814] rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-[#A89F91] font-medium">Name</th>
              <th className="text-left p-4 text-[#A89F91] font-medium">Contact</th>
              <th className="text-left p-4 text-[#A89F91] font-medium hidden lg:table-cell">Features</th>
              <th className="text-left p-4 text-[#A89F91] font-medium">Estimate</th>
              <th className="text-left p-4 text-[#A89F91] font-medium hidden sm:table-cell">Tier</th>
              <th className="text-left p-4 text-[#A89F91] font-medium">Status</th>
              <th className="text-left p-4 text-[#A89F91] font-medium hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#A89F91]">
                  No leads found
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-[#F2EEE7] font-medium">{lead.name}</td>
                  <td className="p-4">
                    <div className="text-[#A89F91]">{lead.phone}</div>
                    {lead.email && <div className="text-[#A89F91]/60 text-xs">{lead.email}</div>}
                  </td>
                  <td className="p-4 text-[#A89F91] text-xs hidden lg:table-cell">
                    {(lead.selected_features as { label: string }[]).map((f) => f.label).join(', ')}
                  </td>
                  <td className="p-4">
                    <span className="text-[#D4AF63] font-medium">${Number(lead.estimate_mid).toLocaleString()}</span>
                    <div className="text-[#A89F91]/60 text-xs">
                      ${Number(lead.estimate_low).toLocaleString()} – ${Number(lead.estimate_high).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-[#A89F91] capitalize hidden sm:table-cell">{lead.tier}</td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[lead.status] || 'bg-gray-500/10 text-gray-400'}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-[#1A1814] text-[#F2EEE7]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-[#A89F91] whitespace-nowrap hidden sm:table-cell">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
