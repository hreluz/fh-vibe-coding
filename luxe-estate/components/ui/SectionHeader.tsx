import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionIcon?: string;
  onAction?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  actionIcon = 'arrow_forward',
  onAction,
  rightElement,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 ${className}`.trim()}
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-light text-[#19322F] dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[#5C706D] dark:text-gray-300 mt-1 text-sm">{subtitle}</p>
        )}
      </div>

      {rightElement ? (
        <div className="self-start sm:self-auto">{rightElement}</div>
      ) : actionText && onAction ? (
        <button
          onClick={onAction}
          type="button"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#006655] dark:text-[#06f9d0] hover:opacity-80 transition-opacity cursor-pointer self-start sm:self-auto"
        >
          <span>{actionText}</span>
          {actionIcon && (
            <span className="material-icons text-sm leading-none">{actionIcon}</span>
          )}
        </button>
      ) : null}
    </div>
  );
}
