import React from 'react';
import { Card } from '../components/common/Card';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const attackTrendData = [
    { day: 'Jul 23', ddos: 120, sqli: 40, c2: 12, brute: 35 },
    { day: 'Jul 24', ddos: 95, sqli: 52, c2: 8, brute: 40 },
    { day: 'Jul 25', ddos: 150, sqli: 38, c2: 15, brute: 28 },
    { day: 'Jul 26', ddos: 210, sqli: 60, c2: 22, brute: 50 },
    { day: 'Jul 27', ddos: 180, sqli: 45, c2: 18, brute: 42 },
    { day: 'Jul 28', ddos: 340, sqli: 88, c2: 30, brute: 65 },
    { day: 'Jul 29', ddos: 480, sqli: 92, c2: 34, brute: 78 },
  ];

  const protocolData = [
    { protocol: 'TCP', normalGb: 84.2, anomalyGb: 12.4 },
    { protocol: 'UDP', normalGb: 42.1, anomalyGb: 18.2 },
    { protocol: 'HTTP', normalGb: 28.5, anomalyGb: 4.8 },
    { protocol: 'DNS', normalGb: 12.0, anomalyGb: 1.2 },
    { protocol: 'SSH', normalGb: 4.2, anomalyGb: 2.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>SOC Deep Analytics & AI Performance Metrics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical attack trends, protocol volume distribution, and ensemble confusion matrix metrics.
          </p>
        </div>
      </Card>

      {/* Row 1: Attack Trends Line Chart */}
      <Card
        title="7-Day Historical Attack Category Volume"
        subtitle="Daily detected threat signatures by category"
      >
        <div className="h-72 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attackTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }} />
              <Line type="monotone" dataKey="ddos" name="DDoS Attacks" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="sqli" name="SQL Injections" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="c2" name="C2 Beacons" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="brute" name="SSH Brute Force" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 2: Protocol Breakdown & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Protocol Usage Stacked Bar Chart */}
        <div className="lg:col-span-7">
          <Card
            title="Protocol Traffic Breakdown (Normal vs Anomaly)"
            subtitle="Volume scanned per transport/application protocol in Gigabytes"
          >
            <div className="h-64 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={protocolData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="protocol" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" GB" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }} />
                  <Bar dataKey="normalGb" name="Normal Traffic (GB)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="anomalyGb" name="Threat Anomaly (GB)" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Model Confusion Matrix */}
        <div className="lg:col-span-5">
          <Card
            title="AI Model Confusion Matrix"
            subtitle="Ensemble performance on test set (100,000 packets)"
          >
            <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">True Positives (TP)</span>
                <span className="text-2xl font-bold text-emerald-500">14,210</span>
                <span className="text-[10px] text-slate-400 block">Attacks Correctly Identified</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">False Positives (FP)</span>
                <span className="text-2xl font-bold text-amber-500">68</span>
                <span className="text-[10px] text-slate-400 block">Benign Flagged (0.08%)</span>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">False Negatives (FN)</span>
                <span className="text-2xl font-bold text-red-500">12</span>
                <span className="text-[10px] text-slate-400 block">Missed Threats</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">True Negatives (TN)</span>
                <span className="text-2xl font-bold text-blue-400">85,710</span>
                <span className="text-[10px] text-slate-400 block">Normal Traffic Passed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
