import React from 'react';
import { Card } from '../common/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TRAFFIC_TIMELINE } from '../../mock/analyticsData';

export const TrafficOverviewChart: React.FC = () => {
  return (
    <Card
      title="Network Traffic Throughput & Threat Volume"
      subtitle="Real-time breakdown of Normal, Suspicious, and Malicious MB/s over 24 hours"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_TRAFFIC_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" MB" />
            <Tooltip
              formatter={(value: any, name: any) => [`${value} MB`, String(name || '')]}
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }}
            />
            <Area type="monotone" dataKey="normalTrafficMb" name="Normal Traffic" stroke="#2563EB" fillOpacity={1} fill="url(#colorNormal)" />
            <Area type="monotone" dataKey="suspiciousTrafficMb" name="Suspicious Recon" stroke="#D97706" fillOpacity={1} fill="url(#colorSuspicious)" />
            <Area type="monotone" dataKey="maliciousTrafficMb" name="Malicious Threat" stroke="#DC2626" fillOpacity={1} fill="url(#colorMalicious)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          <span className="text-slate-600 dark:text-slate-300">Normal Traffic</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-300">Suspicious Recon</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-red-600 inline-block" />
          <span className="text-slate-600 dark:text-slate-300">Malicious Threat</span>
        </div>
      </div>
    </Card>
  );
};
