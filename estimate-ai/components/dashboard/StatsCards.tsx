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
    { label: 'Leads Today', value: leadsToday, icon: Clock, color: '#D4AF63' },
    { label: 'This Week', value: leadsThisWeek, icon: TrendingUp, color: '#4ade80' },
    { label: 'This Month', value: leadsThisMonth, icon: Users, color: '#60a5fa' },
    {
      label: 'Avg Estimate',
      value: `$${avgEstimate.toLocaleString()}`,
      icon: DollarSign,
      color: '#c084fc',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} variant="bordered">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-sm text-[#A89F91]">{stat.label}</p>
              <p className="text-2xl font-bold text-[#F2EEE7]">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
