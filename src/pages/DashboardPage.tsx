import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskGauge } from '../components/common/RiskGauge';
import { TrafficOverviewChart } from '../components/dashboard/TrafficOverviewChart';
import { AttackCategoryDonut } from '../components/dashboard/AttackCategoryDonut';
import { LiveStreamWidget } from '../components/dashboard/LiveStreamWidget';
import { CriticalAlertsList } from '../components/dashboard/CriticalAlertsList';
import { TopIPsWidget } from '../components/dashboard/TopIPsWidget';
import { ModelHealthWidget } from '../components/dashboard/ModelHealthWidget';
import { useMonitoring } from '../context/MonitoringContext';
import { Activity, ShieldAlert, Zap, AlertOctagon, Layers } from 'lucide-react';
import { Card } from '../components/common/Card';

export const DashboardPage: React.FC = () => {
  const { threatScore, packetsPerSec } = useMonitoring();

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Network Throughput"
          value="1.89 GB/s"
          subtitle="eBPF Ring Buffer Active"
          trend={{ value: '+12.4%', isUp: true }}
          icon={<Activity className="w-5 h-5" />}
          iconBgColor="bg-blue-500/10 text-blue-500 border-blue-500/20"
        />

        <StatCard
          title="Packets Analyzed (24h)"
          value="42.8M"
          subtitle={`${(packetsPerSec / 1000).toFixed(1)}k pps live`}
          trend={{ value: '+5.1%', isUp: true }}
          icon={<Layers className="w-5 h-5" />}
          iconBgColor="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
        />

        <StatCard
          title="AI Threat Confidence"
          value="99.4%"
          subtitle="Supervised Ensemble F1: 0.991"
          trend={{ value: 'Optimal SLA', isUp: true, isPositiveGood: true }}
          icon={<Zap className="w-5 h-5" />}
          iconBgColor="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        />

        <StatCard
          title="Critical Alerts"
          value="3 Active"
          subtitle="1 Under Triage by Level-3"
          trend={{ value: '+2 in past 2h', isUp: true, isPositiveGood: false }}
          icon={<AlertOctagon className="w-5 h-5" />}
          iconBgColor="bg-red-500/10 text-red-500 border-red-500/20"
        />
      </div>

      {/* Main Grid Row 1: Threat Score Gauge & Traffic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Threat Score Radial Gauge Panel */}
        <Card
          className="lg:col-span-4 flex flex-col justify-between"
          header={
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Global Threat Score</span>
            </div>
          }
        >
          <div className="py-4 flex flex-col items-center justify-center">
            <RiskGauge score={threatScore} size={220} />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>BGP Flowspec Rules:</span>
              <strong className="text-emerald-500 font-normal">Active (Rate-Limited)</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Primary Threat Vector:</span>
              <strong className="text-red-500 font-normal">SYN Flood (185.220.101.44)</strong>
            </div>
          </div>
        </Card>

        {/* Traffic Overview Timeline Chart */}
        <div className="lg:col-span-8">
          <TrafficOverviewChart />
        </div>
      </div>

      {/* Main Grid Row 2: Live Stream Ticker & Attack Vector Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <LiveStreamWidget />
        </div>
        <div className="lg:col-span-5">
          <AttackCategoryDonut />
        </div>
      </div>

      {/* Main Grid Row 3: Critical Incidents List & Top IPs */}
      <CriticalAlertsList />

      <TopIPsWidget />

      {/* Model Telemetry */}
      <ModelHealthWidget />
    </div>
  );
};
