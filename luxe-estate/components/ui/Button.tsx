'use client';

import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#006655] hover:bg-[#006655]/90 text-white shadow-md shadow-[#006655]/20 focus:ring-[#006655]',
  secondary:
    'bg-[#19322F] hover:bg-[#19322F]/90 text-white dark:bg-white dark:text-[#19322F] shadow-sm focus:ring-[#19322F]',
  outline:
    'bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 text-[#19322F] dark:text-white hover:border-[#006655] dark:hover:border-[#06f9d0] hover:text-[#006655] dark:hover:text-[#06f9d0] hover:shadow-sm focus:ring-[#006655]',
  ghost:
    'text-[#19322F] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 focus:ring-[#006655]',
  accent:
    'bg-[#D9ECC8] hover:bg-[#D9ECC8]/90 text-[#19322F] font-semibold shadow-sm focus:ring-[#006655]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-8 py-3 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0f231f]';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="material-icons text-base leading-none">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="material-icons text-base leading-none">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
