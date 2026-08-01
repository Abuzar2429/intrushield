import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-blue-500/30 active:bg-blue-800';
      case 'secondary':
        return 'bg-slate-800 hover:bg-slate-700 text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700';
      case 'outline':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border border-red-500/30';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/30';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-lg gap-1.5';
      case 'lg':
        return 'px-5 py-2.5 text-base rounded-xl gap-2.5';
      default:
        return 'px-4 py-2 text-sm rounded-lg gap-2';
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
