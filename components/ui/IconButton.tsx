'use client';

import React, { forwardRef } from 'react';

export type IconButtonVariant = 'ghost' | 'floating' | 'filled' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonShape = 'circular' | 'rounded';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  activeIcon?: string;
  active?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  badgeDot?: boolean;
}

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: 'w-8 h-8 p-1.5', icon: 'text-lg' },
  md: { button: 'w-10 h-10 p-2', icon: 'text-xl' },
  lg: { button: 'w-12 h-12 p-3', icon: 'text-2xl' },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      activeIcon,
      active = false,
      variant = 'ghost',
      size = 'md',
      shape = 'circular',
      badgeDot = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const currentIcon = active && activeIcon ? activeIcon : icon;
    const shapeClass = shape === 'circular' ? 'rounded-full' : 'rounded-lg';
    const { button: sizeClass, icon: iconSizeClass } = sizeStyles[size];

    let variantClasses = '';
    if (variant === 'floating') {
      variantClasses = active
        ? 'bg-[#006655] text-white shadow-md'
        : 'bg-white/90 dark:bg-black/60 text-[#19322F] dark:text-white hover:bg-[#006655] hover:text-white backdrop-blur-md shadow-sm';
    } else if (variant === 'ghost') {
      variantClasses = active
        ? 'text-[#006655] dark:text-[#06f9d0] bg-black/5 dark:bg-white/5'
        : 'text-[#19322F] dark:text-gray-300 hover:text-[#006655] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5';
    } else if (variant === 'outline') {
      variantClasses =
        'border border-[#19322F]/10 dark:border-white/10 text-[#19322F] dark:text-white hover:border-[#006655] dark:hover:border-[#06f9d0] hover:bg-black/5 dark:hover:bg-white/5';
    } else if (variant === 'filled') {
      variantClasses = active
        ? 'bg-[#006655] text-white'
        : 'bg-[#19322F] text-white hover:bg-[#006655]';
    }

    return (
      <button
        ref={ref}
        type={type}
        className={`relative inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#006655] dark:focus:ring-[#06f9d0] ${shapeClass} ${sizeClass} ${variantClasses} ${className}`.trim()}
        {...props}
      >
        <span className={`material-icons ${iconSizeClass} leading-none`}>
          {currentIcon}
        </span>
        {badgeDot && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#EEF6F6] dark:border-[#0f231f]" />
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
