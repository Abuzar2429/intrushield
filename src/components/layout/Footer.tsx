import React from 'react';
import { Cpu, Lock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono z-20">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>IntruShield Enterprise AI v2.4.0</span>
        </span>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <span className="hidden sm:flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>eBPF Packet Ring Buffer: OK (1.4ms latency)</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>ISO 27001 / SOC 2 Type II Verified</span>
        </span>
      </div>
    </footer>
  );
};
