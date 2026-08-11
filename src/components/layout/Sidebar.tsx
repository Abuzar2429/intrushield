import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  FileSearch,
  BookOpenCheck,
  FileText,
  AlertOctagon,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
  Cpu,
  BellRing,
  Layers,
  UserCheck,
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isLiveStreaming } = useMonitoring();

  const navItems: NavItem[] = [
    { name: 'SOC Dashboard', path: '/dashboard', icon: <Shield className="w-4 h-4" /> },
    { name: 'Live Monitoring', path: '/monitoring', icon: <Activity className="w-4 h-4" /> },
    { name: 'Packet Analysis', path: '/pcap-analysis', icon: <FileSearch className="w-4 h-4" /> },
    { name: 'Threat Intelligence', path: '/threat-intel', icon: <BookOpenCheck className="w-4 h-4" /> },
    { name: 'Explainable AI', path: '/explainable-ai', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Alerts & History', path: '/alerts', icon: <BellRing className="w-4 h-4" />, badge: 6 },
    { name: 'Incident Details', path: '/incidents', icon: <AlertOctagon className="w-4 h-4" />, badge: 3 },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Models & Governance', path: '/models', icon: <Layers className="w-4 h-4" /> },
    { name: 'Team Governance', path: '/users', icon: <UserCheck className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'Analyst Profile', path: '/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`relative h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <NavLink to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white font-sans">
                  Intru<span className="text-blue-400">Shield</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">SOC AI EDITION</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Live Stream Banner Indicator */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs text-slate-300 font-mono">
                {isLiveStreaming ? 'LIVE MONITORING' : 'STREAM PAUSED'}
              </span>
            </div>
            <Radio className="w-3.5 h-3.5 text-slate-400" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate flex-1">{item.name}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Collapse Toggle & User Badge */}
      <div className="p-3 border-t border-slate-800 flex flex-col space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center space-x-2 text-xs font-mono"><ChevronLeft className="w-4 h-4" /><span>Collapse Sidebar</span></div>}
        </button>
      </div>
    </aside>
  );
};
