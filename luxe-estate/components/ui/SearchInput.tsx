'use client';

import React, { forwardRef } from 'react';
import { Button } from './Button';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = 'Search by city, neighborhood, or address...',
      buttonLabel = 'Search',
      className = '',
      inputClassName = '',
      autoFocus = false,
    },
    ref
  ) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={`relative group max-w-2xl mx-auto ${className}`.trim()}>
        {/* Leading Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none z-10">
          <span className="material-icons text-[#5C706D] dark:text-gray-400 text-2xl group-focus-within:text-[#006655] dark:group-focus-within:text-[#06f9d0] transition-colors">
            search
          </span>
        </div>

        {/* Text Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`block w-full pl-12 sm:pl-14 pr-28 sm:pr-32 py-4 rounded-xl border border-[#19322F]/5 dark:border-white/10 bg-white dark:bg-white/5 text-[#19322F] dark:text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] placeholder-[#5C706D]/60 dark:placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-[#006655] dark:focus:ring-[#06f9d0] focus:bg-white dark:focus:bg-white/10 transition-all text-base sm:text-lg ${inputClassName}`.trim()}
        />

        {/* Trailing Submit Button */}
        <div className="absolute inset-y-2 right-2 flex items-center">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="h-full px-5 sm:px-7 rounded-lg"
          >
            {buttonLabel}
          </Button>
        </div>
      </form>
    );
  }
);

SearchInput.displayName = 'SearchInput';
