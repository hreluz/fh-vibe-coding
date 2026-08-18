'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { ModalPortal } from '@/components/ui';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface PropertyGalleryProps {
  property: Property;
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  // Ensure we always have an array of image strings
  const images: string[] =
    property.images && property.images.length > 0
      ? property.images
      : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Lock background scroll when lightbox is active
  useBodyScrollLock(isLightboxOpen);

  const activeImage = images[activeIndex] || images[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className="space-y-4">
      {/* Main Hero Preview */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-sm group bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
          <span className="bg-[#006655] text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            {property.badge || 'Premium'}
          </span>
          <span className="bg-white/90 dark:bg-black/70 backdrop-blur-md text-[#19322F] dark:text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            {property.listingType === 'for_rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* View All Photos Trigger */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/90 dark:bg-[#19322F]/90 hover:bg-white dark:hover:bg-[#19322F] text-[#19322F] dark:text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer z-10 hover:scale-105 active:scale-95"
        >
          <span className="material-icons text-sm text-[#006655] dark:text-[#06f9d0]">
            grid_view
          </span>
          <span>View All Photos ({images.length})</span>
        </button>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
          {images.map((imgUrl, idx) => (
            <button
              key={`thumb-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                idx === activeIndex
                  ? 'border-[#006655] shadow-md scale-100'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]'
              }`}
              aria-label={`View photo ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <ModalPortal>
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 overscroll-contain cursor-pointer"
          >
            {/* Header */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between text-white z-20 cursor-default"
            >
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">
                  {property.title}
                </h3>
                <p className="text-xs text-white/60">
                  Photo {activeIndex + 1} of {images.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close photo gallery"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {/* Main Image in Lightbox */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden cursor-default"
            >
              {/* Prev Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all hover:scale-110 z-20 cursor-pointer"
                  aria-label="Previous photo"
                >
                  <span className="material-icons text-2xl">chevron_left</span>
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={property.title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-300"
              />

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all hover:scale-110 z-20 cursor-pointer"
                  aria-label="Next photo"
                >
                  <span className="material-icons text-2xl">chevron_right</span>
                </button>
              )}
            </div>

            {/* Bottom Thumbnails */}
            {images.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex gap-2 justify-center overflow-x-auto py-2 z-20 max-w-4xl mx-auto scrollbar-hide cursor-default"
              >
                {images.map((imgUrl, idx) => (
                  <button
                    key={`lightbox-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'ring-2 ring-[#006655] opacity-100 scale-105'
                        : 'opacity-40 hover:opacity-80'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
