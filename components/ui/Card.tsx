import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'featured' | 'ghost' | 'flat';
export type CardRounded = 'md' | 'lg' | 'xl' | '2xl';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  rounded?: CardRounded;
  padding?: CardPadding;
  as?: 'div' | 'article' | 'section';
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-white/5 border border-[#19322F]/5 dark:border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)]',
  featured:
    'bg-white dark:bg-white/5 border border-[#19322F]/5 dark:border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]',
  ghost: 'bg-transparent border border-transparent',
  flat: 'bg-white dark:bg-white/5 border border-[#19322F]/5 dark:border-white/10',
};

const interactiveStyles: Record<CardVariant, string> = {
  default:
    'cursor-pointer hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_40px_-10px_rgba(6,249,208,0.06)] transition-all duration-300 group',
  featured:
    'cursor-pointer hover:shadow-[0_20px_50px_-15px_rgba(0,102,85,0.18)] dark:hover:shadow-[0_20px_50px_-15px_rgba(6,249,208,0.08)] transition-all duration-300 group',
  ghost: 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group',
  flat: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group',
};

const roundedStyles: Record<CardRounded, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      interactive = false,
      rounded = 'xl',
      padding = 'none',
      as = 'div',
      ...props
    },
    ref
  ) => {
    const Component = as;
    const baseClasses = 'overflow-hidden flex flex-col transition-all';
    const interactiveClass = interactive ? interactiveStyles[variant] : '';
    const roundedClass = roundedStyles[rounded];
    const paddingClass = paddingStyles[padding];

    return (
      <Component
        ref={ref}
        className={`${baseClasses} ${variantStyles[variant]} ${roundedClass} ${paddingClass} ${interactiveClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
