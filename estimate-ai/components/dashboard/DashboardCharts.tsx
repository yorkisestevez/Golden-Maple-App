'use client';

import { Card } from '@/components/ui/card';
import { PerformanceGraph } from '@/components/ui/PerformanceGraph';
import { motion } from 'framer-motion';

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card variant="bordered" className="lg:col-span-2 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Neural Lead Velocity</h3>
            <p className="text-2xl font-black text-slate-900 tracking-tighter italic">Propagation Efficiency</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-blue-600">+42.8%</div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vs Last Period</div>
          </div>
        </div>
        <PerformanceGraph color="#2563EB" points={[20, 35, 45, 30, 55, 70, 65, 85, 95, 100]} />
      </Card>

      <Card variant="bordered" className="flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Computational Health</h3>
          <div className="space-y-4">
            {[
              { label: 'Neural Accuracy', value: 99.4, color: 'bg-emerald-500' },
              { label: 'Latency (Avg)', value: 84, unit: 'ms', color: 'bg-blue-500' },
              { label: 'Uptime', value: 100, unit: '%', color: 'bg-emerald-500' },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                  <span className="text-slate-400">{metric.label}</span>
                  <span className="text-slate-900">{metric.value}{metric.unit}</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    className={`h-full ${metric.color}`}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Kernel v4.2.0-Alpha</div>
        </div>
      </Card>
    </div>
  );
}
