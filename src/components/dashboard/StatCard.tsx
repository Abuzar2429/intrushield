import React from 'react';
import { Card } from '../common/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isUp: boolean;
    isPositiveGood?: boolean;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}) => {
  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {value}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-2.5 rounded-xl border ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1">
            {trend.isUp ? (
              <ArrowUpRight className={`w-3.5 h-3.5 ${trend.isPositiveGood === false ? 'text-red-500' : 'text-emerald-500'}`} />
            ) : (
              <ArrowDownRight className={`w-3.5 h-3.5 ${trend.isPositiveGood === false ? 'text-emerald-500' : 'text-red-500'}`} />
            )}
            <span className={trend.isUp ? (trend.isPositiveGood === false ? 'text-red-500' : 'text-emerald-500') : (trend.isPositiveGood === false ? 'text-emerald-500' : 'text-red-500')}>
              {trend.value}
            </span>
          </div>
          <span className="text-slate-400">vs past 24h</span>
        </div>
      )}
    </Card>
  );
};
