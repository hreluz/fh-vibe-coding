'use client';

import React from 'react';

export interface PillTabItem<T extends string = string> {
  label: string;
  value: T;
  icon?: string;
}

export interface PillTabsProps<T extends string = string> {
  items: PillTabItem<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  variant?: 'pills' | 'segmented';
  scrollable?: boolean;
  className?: string;
}

export function PillTabs<T extends string = string>({
  items,
  activeValue,
  onChange,
  variant = 'pills',
  scrollable = false,
  className = '',
}: PillTabsProps<T>) {
  if (variant === 'segmented') {
    return (
      <div
        className={`flex bg-white dark:bg-white/5 p-1 rounded-xl shadow-sm border border-[#19322F]/5 dark:border-white/10 ${className}`.trim()}
      >
        {items.map((item) => {
          const isSelected = activeValue === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#19322F] dark:bg-white text-white dark:text-[#19322F] shadow-sm font-semibold'
                  : 'text-[#5C706D] dark:text-gray-300 hover:text-[#19322F] dark:hover:text-white hover:bg-[#EEF6F6]/60 dark:hover:bg-white/5'
              }`}
            >
              {item.icon && <span className="material-icons text-base leading-none">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 'pills' variant
  const containerClasses = scrollable
    ? 'flex items-center gap-2.5 sm:gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4'
    : 'flex flex-wrap items-center gap-2.5 sm:gap-3';

  return (
    <div className={`${containerClasses} ${className}`.trim()}>
      {items.map((item) => {
        const isSelected = activeValue === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-[#19322F] dark:bg-white dark:text-[#19322F] text-white shadow-md shadow-[#19322F]/15 -translate-y-0.5 font-semibold'
                : 'bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 text-[#5C706D] dark:text-gray-300 hover:text-[#19322F] dark:hover:text-white hover:border-[#006655]/50 dark:hover:border-white/30 hover:bg-[#EEF6F6] dark:hover:bg-white/10'
            }`}
          >
            {item.icon && <span className="material-icons text-base leading-none">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
