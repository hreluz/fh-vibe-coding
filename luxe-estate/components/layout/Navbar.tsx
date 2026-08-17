'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ activeTab = 'Buy', onTabChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navItems = ['Buy', 'Rent', 'Sell', 'Saved Homes'];

  const handleNavClick = (item: string) => {
    if (onTabChange) {
      onTabChange(item);
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
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`font-medium text-sm px-1 py-1 transition-all ${
                    isActive
                      ? 'text-[#006655] dark:text-[#06f9d0] border-b-2 border-[#006655] dark:border-[#06f9d0]'
                      : 'text-[#19322F]/70 dark:text-white/70 hover:text-[#19322F] dark:hover:text-white hover:border-b-2 hover:border-[#19322F]/20 dark:hover:border-white/20'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="text-[#19322F] dark:text-gray-300 hover:text-[#006655] dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="material-icons text-xl sm:text-2xl">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Search Icon */}
            <button
              aria-label="Search"
              className="text-[#19322F] dark:text-gray-300 hover:text-[#006655] dark:hover:text-white transition-colors p-1"
            >
              <span className="material-icons text-xl sm:text-2xl">search</span>
            </button>

            {/* Notifications Icon */}
            <button
              aria-label="Notifications"
              className="text-[#19322F] dark:text-gray-300 hover:text-[#006655] dark:hover:text-white transition-colors relative p-1"
            >
              <span className="material-icons text-xl sm:text-2xl">notifications_none</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#EEF6F6] dark:border-[#0f231f]"></span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#19322F]/10 dark:border-white/10 ml-1 sm:ml-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden ring-2 ring-transparent hover:ring-[#006655] dark:hover:ring-[#06f9d0] transition-all cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="User profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#19322F] dark:text-white hover:text-[#006655] dark:hover:text-[#06f9d0] p-1 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-icons text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#19322F]/10 dark:border-white/10 bg-[#EEF6F6] dark:bg-[#0f231f] px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => {
                  handleNavClick(item);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'text-[#006655] dark:text-[#06f9d0] bg-[#006655]/10 dark:bg-white/10 font-semibold'
                    : 'text-[#19322F] dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
