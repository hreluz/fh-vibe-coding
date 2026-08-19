'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/components/providers';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export function LanguageSelector({
  variant = 'dropdown',
  className = '',
}: LanguageSelectorProps) {
  const { locale, setLocale, locales, currentLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setLocale(code);
    setIsOpen(false);
  };

  // Full / Mobile list variant
  if (variant === 'full') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="text-xs font-semibold text-[#5C706D] dark:text-gray-400 uppercase tracking-wider px-3 py-1">
          {t('languageSelector.selectLanguage')}
        </div>
        <div className="grid grid-cols-3 gap-2 px-1">
          {locales.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#006655] text-white shadow-md shadow-[#006655]/20 font-semibold'
                    : 'bg-black/5 dark:bg-white/5 text-[#19322F] dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 border border-[#19322F]/5 dark:border-white/5'
                }`}
              >
                <span className="text-sm">{item.flag}</span>
                <span>{item.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Standard Header Dropdown
  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('languageSelector.selectLanguage')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer border ${
          isOpen
            ? 'bg-[#006655]/10 dark:bg-white/15 text-[#006655] dark:text-[#06f9d0] border-[#006655]/30 dark:border-white/20 shadow-sm'
            : 'bg-transparent text-[#19322F]/80 dark:text-white/80 hover:text-[#19322F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border-transparent'
        }`}
      >
        <span className="text-base leading-none" role="img" aria-label={currentLocale.label}>
          {currentLocale.flag}
        </span>
        <span className="font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
          {currentLocale.code}
        </span>
        <span
          className={`material-icons text-base transition-transform duration-200 opacity-60 ${
            isOpen ? 'rotate-180 text-[#006655] dark:text-[#06f9d0]' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('languageSelector.selectLanguage')}
          className="absolute right-0 mt-2 w-48 sm:w-52 rounded-2xl bg-white/95 dark:bg-[#132b26]/95 backdrop-blur-xl border border-[#19322F]/10 dark:border-white/10 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C706D] dark:text-gray-400 border-b border-[#19322F]/5 dark:border-white/5 mb-1">
            {t('languageSelector.selectLanguage')}
          </div>

          {locales.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item.code)}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#006655]/10 dark:bg-white/10 text-[#006655] dark:text-[#06f9d0] font-semibold'
                    : 'text-[#19322F] dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{item.flag}</span>
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.nativeName}</span>
                    <span className="text-[10px] text-[#5C706D] dark:text-gray-400 font-normal">
                      {item.label}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-base leading-none">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
