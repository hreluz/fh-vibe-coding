'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyMap } from '@/components/map';
import { ModalPortal } from '@/components/ui';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ScheduleVisitModal } from './ScheduleVisitModal';

interface PropertySidebarProps {
  property: Property;
}

export function PropertySidebar({ property }: PropertySidebarProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'schedule' | 'contact'>('schedule');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Lock body scroll when map modal is expanded
  useBodyScrollLock(isMapExpanded);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const isRent = property.listingType === 'for_rent';
  const agent = property.agent || {
    name: 'Sarah Jenkins',
    title: 'Top Rated Agent',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
    phone: '+1 (555) 234-5678',
    email: 'sarah.jenkins@luxeestate.com',
  };

  const coordinates =
    property.coordinates &&
    typeof property.coordinates.lat === 'number' &&
    !isNaN(property.coordinates.lat) &&
    typeof property.coordinates.lng === 'number' &&
    !isNaN(property.coordinates.lng)
      ? property.coordinates
      : {
          lat: 34.0736,
          lng: -118.4004,
        };

  // Close map modal on Escape key
  useEffect(() => {
    if (!isMapExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMapExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapExpanded]);

  const openSchedule = () => {
    setModalMode('schedule');
    setIsScheduleOpen(true);
  };

  const openContact = () => {
    setModalMode('contact');
    setIsScheduleOpen(true);
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      {/* Pricing & Agent Action Card */}
      <div className="bg-white dark:bg-[#162e2a] p-6 sm:p-7 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10 transition-colors">
        {/* Price & Location Header */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <h1 className="text-3xl sm:text-4xl font-display font-light text-[#19322F] dark:text-white tracking-tight">
              {formattedPrice}
            </h1>
            {isRent && (
              <span className="text-sm font-medium text-[#5C706D] dark:text-gray-400">
                /month
              </span>
            )}
          </div>
          <p className="text-[#5C706D] dark:text-gray-300 font-medium flex items-center gap-1.5 mt-2 text-sm">
            <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-base">
              location_on
            </span>
            <span>{property.location.formatted || property.location.address}</span>
          </p>
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/10 my-5" />

        {/* Agent Profile */}
        <div className="flex items-center gap-3.5 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={agent.name}
            src={agent.avatarUrl}
            className="w-13 h-13 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[#19322F] dark:text-white text-base truncate">
              {agent.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#006655] dark:text-[#06f9d0] font-semibold mt-0.5">
              <span className="material-icons text-[14px]">star</span>
              <span>{agent.title}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-1.5 flex-shrink-0">
            <a
              href={`mailto:${agent.email}`}
              className="p-2.5 rounded-full bg-[#006655]/10 dark:bg-white/10 text-[#006655] dark:text-[#06f9d0] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer"
              title="Email agent"
              aria-label="Email agent"
            >
              <span className="material-icons text-sm">mail</span>
            </a>
            <a
              href={`tel:${agent.phone}`}
              className="p-2.5 rounded-full bg-[#006655]/10 dark:bg-white/10 text-[#006655] dark:text-[#06f9d0] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer"
              title="Call agent"
              aria-label="Call agent"
            >
              <span className="material-icons text-sm">call</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={openSchedule}
            className="w-full bg-[#006655] hover:bg-[#005544] text-white py-4 px-6 rounded-xl font-medium transition-all shadow-lg shadow-[#006655]/20 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="material-icons text-xl group-hover:scale-110 transition-transform">
              calendar_today
            </span>
            <span>Schedule Visit</span>
          </button>

          <button
            type="button"
            onClick={openContact}
            className="w-full bg-transparent border border-[#19322F]/15 dark:border-white/20 hover:border-[#006655] text-[#19322F] dark:text-gray-100 hover:text-[#006655] dark:hover:text-[#06f9d0] py-3.5 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="material-icons text-xl">mail_outline</span>
            <span>Contact Agent</span>
          </button>
        </div>
      </div>

      {/* Mini Interactive Map Card */}
      <div className="bg-white dark:bg-[#162e2a] p-3 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800">
          <PropertyMap
            lat={coordinates.lat}
            lng={coordinates.lng}
            title={property.title}
            locationName={property.location.formatted}
            priceFormatted={formattedPrice}
            className="h-full w-full"
            interactive={true}
          />
          <button
            type="button"
            onClick={() => setIsMapExpanded(true)}
            className="absolute bottom-2 right-2 bg-white/90 dark:bg-[#19322F]/90 backdrop-blur text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md text-[#19322F] dark:text-white hover:text-[#006655] dark:hover:text-[#06f9d0] transition-all cursor-pointer z-10 hover:scale-105 flex items-center gap-1"
          >
            <span className="material-icons text-xs">fullscreen</span>
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isMapExpanded && (
        <ModalPortal>
          <div
            onClick={() => setIsMapExpanded(false)}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-8 animate-in fade-in duration-200 overscroll-contain cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#162e2a] w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col cursor-default"
            >
              <div className="p-4 bg-white dark:bg-[#162e2a] border-b border-gray-200 dark:border-white/10 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-bold text-base text-[#19322F] dark:text-white">
                    {property.title} - Location Map
                  </h3>
                  <p className="text-xs text-[#5C706D] dark:text-gray-400">
                    {property.location.formatted}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close expanded map"
                >
                  <span className="material-icons text-xl">close</span>
                </button>
              </div>
              <div className="flex-1 w-full h-full relative">
                <PropertyMap
                  lat={coordinates.lat}
                  lng={coordinates.lng}
                  title={property.title}
                  locationName={property.location.formatted}
                  priceFormatted={formattedPrice}
                  zoom={16}
                  className="h-full w-full"
                  interactive={true}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Schedule Tour / Contact Dialog */}
      <ScheduleVisitModal
        key={`${isScheduleOpen}-${modalMode}`}
        property={property}
        isOpen={isScheduleOpen}
        initialMode={modalMode}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
}
