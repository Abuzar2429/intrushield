import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  header,
  footer,
  title,
  subtitle,
  action,
  headerAction,
}) => {
  const actionElement = action || headerAction;
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-200',
        className
      )}
    >
      {(header || title) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {header ? (
            header
          ) : (
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          )}
          {actionElement && <div>{actionElement}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};
