'use client';

import React from 'react';
import Link from 'next/link';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  createPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 8,
  createPageUrl,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push('...');
      }
    }

    // Filter duplicate consecutive ellipses
    return pages.filter((item, index) => item !== '...' || pages[index - 1] !== '...');
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <span
          key={`ellipsis-${index}`}
          className="w-9 h-9 flex items-center justify-center text-[#5C706D] dark:text-gray-400 font-medium select-none"
        >
          &hellip;
        </span>
      );
    }

    const pageNum = Number(page);
    const isActive = pageNum === currentPage;

    const baseClass =
      'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer';
    const activeClass =
      'bg-[#006655] text-white shadow-md shadow-[#006655]/25 scale-105';
    const inactiveClass =
      'bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 text-[#19322F] dark:text-white hover:border-[#006655] dark:hover:border-[#06f9d0] hover:text-[#006655] dark:hover:text-[#06f9d0] hover:bg-black/5 dark:hover:bg-white/10';

    if (createPageUrl) {
      return (
        <Link
          key={`page-${pageNum}`}
          href={createPageUrl(pageNum)}
          aria-current={isActive ? 'page' : undefined}
          className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
          onClick={(e) => {
            if (isActive) e.preventDefault();
            if (onPageChange) onPageChange(pageNum);
          }}
        >
          {pageNum}
        </Link>
      );
    }

    return (
      <button
        key={`page-${pageNum}`}
        type="button"
        disabled={isActive}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onPageChange && onPageChange(pageNum)}
        className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {pageNum}
      </button>
    );
  };

  const renderNavButton = (
    direction: 'prev' | 'next',
    targetPage: number,
    isDisabled: boolean,
    icon: string,
    label: string
  ) => {
    const baseClass =
      'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none';
    const activeClass =
      'bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 text-[#19322F] dark:text-white hover:border-[#006655] dark:hover:border-[#06f9d0] hover:text-[#006655] dark:hover:text-[#06f9d0] hover:shadow-sm cursor-pointer';
    const disabledClass =
      'opacity-40 cursor-not-allowed bg-white/50 dark:bg-white/5 border border-transparent text-[#5C706D] dark:text-gray-500';

    if (isDisabled) {
      return (
        <span className={`${baseClass} ${disabledClass}`} aria-disabled="true">
          {direction === 'prev' && <span className="material-icons text-base">{icon}</span>}
          <span>{label}</span>
          {direction === 'next' && <span className="material-icons text-base">{icon}</span>}
        </span>
      );
    }

    if (createPageUrl) {
      return (
        <Link
          href={createPageUrl(targetPage)}
          className={`${baseClass} ${activeClass}`}
          onClick={() => onPageChange && onPageChange(targetPage)}
          aria-label={label}
        >
          {direction === 'prev' && <span className="material-icons text-base">{icon}</span>}
          <span>{label}</span>
          {direction === 'next' && <span className="material-icons text-base">{icon}</span>}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(targetPage)}
        className={`${baseClass} ${activeClass}`}
        aria-label={label}
      >
        {direction === 'prev' && <span className="material-icons text-base">{icon}</span>}
        <span>{label}</span>
        {direction === 'next' && <span className="material-icons text-base">{icon}</span>}
      </button>
    );
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-[#19322F]/10 dark:border-white/10 ${className}`}
    >
      {/* Items Count Summary */}
      {totalItems !== undefined && (
        <p className="text-sm text-[#5C706D] dark:text-gray-400 order-2 sm:order-1">
          Showing <span className="font-semibold text-[#19322F] dark:text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-[#19322F] dark:text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-[#19322F] dark:text-white">{totalItems}</span> properties
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {renderNavButton('prev', currentPage - 1, currentPage <= 1, 'chevron_left', 'Previous')}

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, idx) => renderPageButton(page, idx))}
        </div>

        {renderNavButton('next', currentPage + 1, currentPage >= totalPages, 'chevron_right', 'Next')}
      </div>
    </nav>
  );
}
