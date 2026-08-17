import React from 'react';

export type BadgeVariant =
  | 'for_sale'
  | 'for_rent'
  | 'featured'
  | 'outline'
  | 'hint_of_green'
  | 'nordic'
  | 'mosque';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  uppercase?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  for_sale: 'bg-[#19322F] text-white dark:bg-black/80 dark:border dark:border-white/10',
  nordic: 'bg-[#19322F] text-white dark:bg-black/80 dark:border dark:border-white/10',
  for_rent: 'bg-[#006655] text-white shadow-sm',
  mosque: 'bg-[#006655] text-white shadow-sm',
  featured:
    'bg-white/90 dark:bg-black/80 backdrop-blur-md text-[#19322F] dark:text-white shadow-sm',
  hint_of_green: 'bg-[#D9ECC8] text-[#19322F] font-semibold shadow-xs',
  outline:
    'bg-white/80 dark:bg-black/40 border border-[#19322F]/20 dark:border-white/20 text-[#19322F] dark:text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 rounded',
  md: 'text-[11px] px-2.5 py-1 rounded',
  lg: 'text-xs px-3.5 py-1.5 rounded-full',
};

export function Badge({
  children,
  className = '',
  variant = 'nordic',
  size = 'md',
  icon,
  uppercase = true,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-bold tracking-wider shadow-xs';
  const uppercaseClass = uppercase ? 'uppercase' : '';

  return (
    <span
      className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${uppercaseClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="material-icons text-[13px] leading-none">{icon}</span>}
      {children}
    </span>
  );
}
