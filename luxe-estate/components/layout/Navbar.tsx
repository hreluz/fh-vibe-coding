'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme, useTranslation } from '@/components/providers';
import { IconButton } from '@/components/ui';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

function NavbarInner({ activeTab = 'Buy', onTabChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const navItems: { id: string; label: string }[] = [
    { id: 'Buy', label: t('nav.buy') },
    { id: 'Rent', label: t('nav.rent') },
    { id: 'Featured', label: t('nav.featured') },
    { id: 'Saved Homes', label: t('nav.savedHomes') },
  ];

  const handleNavClick = (itemId: string) => {
    if (onTabChange) {
      onTabChange(itemId);
      return;
    }

    if (itemId === 'Featured') {
      router.push('/featured');
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('page');

    if (itemId === 'Buy') {
      params.set('type', 'for_sale');
      router.push(`/?${params.toString()}`);
    } else if (itemId === 'Rent') {
      params.set('type', 'for_rent');
      router.push(`/?${params.toString()}`);
    } else if (itemId === 'Saved Homes') {
      params.delete('type');
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#EEF6F6]/95 dark:bg-[#0f231f]/95 backdrop-blur-md border-b border-[#19322F]/10 dark:border-white/5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-[#19322F] dark:bg-white/10 flex items-center justify-center transition-transform group-hover:scale-105 border border-transparent dark:border-white/10">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#19322F] dark:text-white">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`font-medium text-sm px-1 py-1 transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#006655] dark:text-[#06f9d0] border-b-2 border-[#006655] dark:border-[#06f9d0]'
                      : 'text-[#19322F]/70 dark:text-white/70 hover:text-[#19322F] dark:hover:text-white hover:border-b-2 hover:border-[#19322F]/20 dark:hover:border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action Icons, Language Selector & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Language Selector Dropdown */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <IconButton
              icon={theme === 'dark' ? 'light_mode' : 'dark_mode'}
              onClick={toggleTheme}
              variant="ghost"
              size="md"
              shape="rounded"
              suppressHydrationWarning
              aria-label={theme === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}
              title={theme === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}
            />

            {/* Search Icon */}
            <IconButton
              icon="search"
              variant="ghost"
              size="md"
              shape="rounded"
              aria-label={t('nav.search')}
            />

            {/* Notifications Icon */}
            <IconButton
              icon="notifications_none"
              variant="ghost"
              size="md"
              shape="rounded"
              badgeDot
              aria-label={t('nav.notifications')}
            />

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#19322F]/10 dark:border-white/10 ml-1">
              <div
                className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden ring-2 ring-transparent hover:ring-[#006655] dark:hover:ring-[#06f9d0] transition-all cursor-pointer"
                title={t('nav.userProfile')}
                aria-label={t('nav.userProfile')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={t('nav.userProfile')}
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <IconButton
                icon={mobileMenuOpen ? 'close' : 'menu'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                variant="ghost"
                size="md"
                shape="rounded"
                aria-label={t('nav.toggleMenu')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#19322F]/10 dark:border-white/10 bg-[#EEF6F6] dark:bg-[#0f231f] px-4 py-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#006655] dark:text-[#06f9d0] bg-[#006655]/10 dark:bg-white/10 font-semibold'
                      : 'text-[#19322F] dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-2 border-t border-[#19322F]/10 dark:border-white/10">
            <LanguageSelector variant="full" />
          </div>
        </div>
      )}
    </nav>
  );
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense
      fallback={
        <nav className="sticky top-0 z-50 bg-[#EEF6F6]/95 dark:bg-[#0f231f]/95 backdrop-blur-md border-b border-[#19322F]/10 dark:border-white/5 h-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#19322F] dark:bg-white/10 flex items-center justify-center">
                <span className="material-icons text-white text-lg">apartment</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[#19322F] dark:text-white">
                LuxeEstate
              </span>
            </Link>
          </div>
        </nav>
      }
    >
      <NavbarInner {...props} />
    </Suspense>
  );
}

