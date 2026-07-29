import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, ShieldCheck, Pause, Play, UserCheck, Terminal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMonitoring } from '../../context/MonitoringContext';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { threatScore, isLiveStreaming, toggleLiveStreaming, packetsPerSec } = useMonitoring();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Security Operations Centre Overview';
      case '/monitoring': return 'Real-Time Packet Monitoring & Inspection';
      case '/pcap-analysis': return 'PCAP / CSV Feature Extractor & AI Pipeline';
      case '/threat-intel': return 'MITRE ATT&CK & Threat Intelligence';
      case '/explainable-ai': return 'Explainable AI (XAI) Feature Attribution & SHAP Reasoning';
      case '/alerts': return 'Security Alerts & Incident History Audit Log';
      case '/incidents': return 'Incident Investigation & Remediation Playbook';
      case '/reports': return 'Executive Security Reports & Compliance Audits';
      case '/analytics': return 'SOC Traffic & Model Performance Analytics';
      case '/models': return 'AI Ensemble Governance & Online Retraining';
      case '/settings': return 'SOC System Settings & Alert Sensitivity';
      case '/profile': return 'Senior SOC Analyst Clearance & Operator Profile';
      default: return 'IntruShield Enterprise Security Platform';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-20 transition-colors">
      {/* Title & Path */}
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          <span>{getPageTitle()}</span>
        </h1>
      </div>

      {/* Center SOC Status Badges */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Threat Score Pill */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">THREAT INDEX:</span>
          <Badge variant={threatScore > 50 ? 'Critical' : 'Normal'} size="sm">
            {threatScore}/100
          </Badge>
        </div>

        {/* Throughput Indicator */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{(packetsPerSec / 1000).toFixed(1)}k PPS</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Live Pause/Play Stream Button */}
        <button
          onClick={toggleLiveStreaming}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            isLiveStreaming
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title={isLiveStreaming ? 'Pause live packet feed' : 'Resume live packet feed'}
        >
          {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isLiveStreaming ? 'STREAMING' : 'PAUSED'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-mono text-xs font-bold border border-slate-700">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-900 dark:text-slate-100">Ashraf (Lead SOC)</span>
            <span className="text-[10px] text-slate-400 font-mono">LEVEL-3 ANALYST</span>
          </div>
        </div>
      </div>
    </header>
  );
};
