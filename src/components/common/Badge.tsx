import React from 'react';
import type { RiskLevel } from '../../types/packet';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: RiskLevel | 'default' | 'info' | 'success' | 'warning' | 'critical' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'Critical':
      case 'critical':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'Medium':
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Low':
      case 'info':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Normal':
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'secondary':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider';
      case 'lg':
        return 'px-3 py-1 text-sm font-medium';
      default:
        return 'px-2.5 py-0.5 text-xs font-medium';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
    >
      {children || variant}
    </span>
  );
};
