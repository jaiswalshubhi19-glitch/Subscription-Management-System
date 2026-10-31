import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#172554] text-white hover:bg-slate-800 focus:ring-blue-900 shadow-sm border border-transparent',
    accent: 'bg-[#2563EB] text-white hover:bg-blue-700 focus:ring-blue-600 shadow-sm border border-transparent',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-slate-400 shadow-sm',
    outline: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300 focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm border border-transparent',
    dangerOutline: 'bg-transparent text-rose-600 hover:bg-rose-50 border border-rose-200 focus:ring-rose-400'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs space-x-1',
    sm: 'px-2.5 py-1.5 text-xs font-medium space-x-1.5',
    md: 'px-3.5 py-2 text-sm space-x-2',
    lg: 'px-4 py-2.5 text-sm font-semibold space-x-2'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

