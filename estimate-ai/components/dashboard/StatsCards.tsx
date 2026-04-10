import { Card } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface StatsCardsProps {
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  avgEstimate: number;
}

export function StatsCards({ leadsToday, leadsThisWeek, leadsThisMonth, avgEstimate }: StatsCardsProps) {
  const stats = [
    { label: 'Neural Leads Today', value: leadsToday, icon: Clock, color: '#2563EB' },
    { label: 'Weekly Velocity', value: leadsThisWeek, icon: TrendingUp, color: '#059669' },
    { label: 'Active Pipeline', value: leadsThisMonth, icon: Users, color: '#7C3AED' },
    {
      label: 'Mean Allocation',
      value: `$${avgEstimate.toLocaleString()}`,
      icon: DollarSign,
      color: '#DB2777',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} variant="bordered" className="group hover:border-blue-200 transition-all duration-300">
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm"
              style={{ backgroundColor: `${stat.color}10` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
