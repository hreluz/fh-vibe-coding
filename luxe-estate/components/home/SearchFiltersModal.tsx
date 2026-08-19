'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { CategoryFilterType, PropertyFilterValues } from '@/types/property';
import { ALL_PROPERTIES } from '@/data/mock-properties';
import { matchesPropertyFilters } from '@/lib/services/properties';
import { useTranslation } from '@/components/providers';

export interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: PropertyFilterValues;
  onApplyFilters: (filters: PropertyFilterValues) => void;
}

const AMENITY_OPTIONS = [
  { id: 'Swimming Pool', icon: 'pool' },
  { id: 'Gym', icon: 'fitness_center' },
  { id: 'Parking', icon: 'local_parking' },
  { id: 'Air Conditioning', icon: 'ac_unit' },
  { id: 'High-speed Wifi', icon: 'wifi' },
  { id: 'Patio / Terrace', icon: 'deck' },
  { id: 'Wine Cellar', icon: 'wine_bar' },
  { id: 'Smart Home System', icon: 'home' },
];

const MAX_SLIDER_PRICE = 20000000;
const MIN_SLIDER_PRICE = 0;

function formatPriceDisplay(price: number): string {
  if (price <= 0) return '$0';
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (price >= 1000) {
    const thousands = price / 1000;
    return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0)}K`;
  }
  return `$${price.toLocaleString()}`;
}

function parseFormattedNumber(val: string): number {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function SearchFiltersModal({
  isOpen,
  onClose,
  initialFilters,
  onApplyFilters,
}: SearchFiltersModalProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(initialFilters.location || '');
  const [minPrice, setMinPrice] = useState<number>(initialFilters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters.maxPrice || MAX_SLIDER_PRICE);
  const [category, setCategory] = useState<CategoryFilterType>(initialFilters.category || 'all');
  const [bedrooms, setBedrooms] = useState<number>(initialFilters.bedrooms || 0);
  const [bathrooms, setBathrooms] = useState<number>(initialFilters.bathrooms || 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.amenities || []
  );

  const propertyTypes: { label: string; value: CategoryFilterType }[] = useMemo(
    () => [
      { label: t('filters.anyType'), value: 'all' },
      { label: t('common.house'), value: 'house' },
      { label: t('common.apartment'), value: 'apartment' },
      { label: t('common.villa'), value: 'villa' },
      { label: t('common.penthouse'), value: 'penthouse' },
    ],
    [t]
  );

  // Sync state when initialFilters change or modal opens
  useEffect(() => {
    if (isOpen) {
      setLocation(initialFilters.location || '');
      setMinPrice(initialFilters.minPrice || 0);
      setMaxPrice(initialFilters.maxPrice || MAX_SLIDER_PRICE);
      setCategory(initialFilters.category || 'all');
      setBedrooms(initialFilters.bedrooms || 0);
      setBathrooms(initialFilters.bathrooms || 0);
      setSelectedAmenities(initialFilters.amenities || []);
    }
  }, [isOpen, initialFilters]);

  // Lock body scroll when open and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Real-time matching count calculation
  const currentFilters: PropertyFilterValues = useMemo(
    () => ({
      location,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < MAX_SLIDER_PRICE ? maxPrice : undefined,
      category,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      query: initialFilters.query,
      listingType: initialFilters.listingType,
    }),
    [location, minPrice, maxPrice, category, bedrooms, bathrooms, selectedAmenities, initialFilters.query, initialFilters.listingType]
  );

  const matchingCount = useMemo(() => {
    return ALL_PROPERTIES.filter((p) => matchesPropertyFilters(p, currentFilters)).length;
  }, [currentFilters]);

  const handleToggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleClearAll = () => {
    setLocation('');
    setMinPrice(0);
    setMaxPrice(MAX_SLIDER_PRICE);
    setCategory('all');
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      location: location.trim() || undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < MAX_SLIDER_PRICE ? maxPrice : undefined,
      category: category !== 'all' ? category : undefined,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  // Dual Slider calculations
  const minPercent = Math.min(100, Math.max(0, (minPrice / MAX_SLIDER_PRICE) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / MAX_SLIDER_PRICE) * 100));

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - 50000);
    setMinPrice(Math.max(0, val));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + 50000);
    setMaxPrice(Math.min(MAX_SLIDER_PRICE, val));
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Main Modal Container */}
        <main
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#132b26] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] my-auto transition-transform transform scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#132b26] sticky top-0 z-30">
            <h1
              id="filter-modal-title"
              className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
            >
              {t('filters.title')}
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
              aria-label={t('filters.close')}
            >
              <span className="material-icons text-2xl leading-none">close</span>
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scroll p-6 sm:p-8 space-y-8 sm:space-y-9">
            {/* Section 1: Location */}
            <section>
              <label
                htmlFor="filter-location-input"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3"
              >
                {t('filters.location')}
              </label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#006655] dark:group-focus-within:text-[#06f9d0] transition-colors">
                  location_on
                </span>
                <input
                  id="filter-location-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('filters.locationPlaceholder')}
                  type="text"
                  className="w-full pl-12 pr-10 py-3 bg-[#EEF6F6] dark:bg-[#0f231f] border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#006655] dark:focus:border-[#06f9d0] focus:bg-white dark:focus:bg-[#0f231f] focus:outline-none transition-all shadow-sm text-sm"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => setLocation('')}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    aria-label={t('filters.clearLocation')}
                  >
                    <span className="material-icons text-lg leading-none">cancel</span>
                  </button>
                )}
              </div>
            </section>

            {/* Section 2: Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('filters.priceRange')}
                </label>
                <span className="text-sm font-semibold text-[#006655] dark:text-[#06f9d0]">
                  {formatPriceDisplay(minPrice)} –{' '}
                  {maxPrice >= MAX_SLIDER_PRICE ? '$20M+' : formatPriceDisplay(maxPrice)}
                </span>
              </div>

              {/* Dual Range Slider Visual Track */}
              <div className="relative h-10 flex items-center mb-5 px-1">
                {/* Track background */}
                <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-[#006655] dark:bg-[#06f9d0] transition-all"
                    style={{
                      marginLeft: `${minPercent}%`,
                      width: `${Math.max(0, maxPercent - minPercent)}%`,
                    }}
                  />
                </div>

                {/* Min Range Input */}
                <input
                  type="range"
                  min={MIN_SLIDER_PRICE}
                  max={MAX_SLIDER_PRICE}
                  step={50000}
                  value={minPrice}
                  onChange={handleMinSliderChange}
                  className="absolute w-full pointer-events-none appearance-none bg-transparent h-1.5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#006655] dark:[&::-webkit-slider-thumb]:border-[#06f9d0] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#006655] dark:[&::-moz-range-thumb]:border-[#06f9d0] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer z-20"
                />

                {/* Max Range Input */}
                <input
                  type="range"
                  min={MIN_SLIDER_PRICE}
                  max={MAX_SLIDER_PRICE}
                  step={50000}
                  value={maxPrice}
                  onChange={handleMaxSliderChange}
                  className="absolute w-full pointer-events-none appearance-none bg-transparent h-1.5 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#006655] dark:[&::-webkit-slider-thumb]:border-[#06f9d0] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#006655] dark:[&::-moz-range-thumb]:border-[#06f9d0] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer z-20"
                />
              </div>

              {/* Price Numeric Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EEF6F6] dark:bg-[#0f231f] p-3 rounded-xl border border-transparent focus-within:border-[#006655]/40 dark:focus-within:border-[#06f9d0]/40 transition-colors">
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                    {t('filters.minPrice')}
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1 text-sm">$</span>
                    <input
                      type="text"
                      value={minPrice > 0 ? minPrice.toLocaleString() : ''}
                      placeholder="0"
                      onChange={(e) => {
                        const parsed = parseFormattedNumber(e.target.value);
                        setMinPrice(Math.min(parsed, maxPrice));
                      }}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="bg-[#EEF6F6] dark:bg-[#0f231f] p-3 rounded-xl border border-transparent focus-within:border-[#006655]/40 dark:focus-within:border-[#06f9d0]/40 transition-colors">
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                    {t('filters.maxPrice')}
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1 text-sm">$</span>
                    <input
                      type="text"
                      value={maxPrice < MAX_SLIDER_PRICE ? maxPrice.toLocaleString() : ''}
                      placeholder="20,000,000+"
                      onChange={(e) => {
                        const parsed = parseFormattedNumber(e.target.value);
                        setMaxPrice(parsed > 0 ? parsed : MAX_SLIDER_PRICE);
                      }}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Property Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Property Type Dropdown */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('filters.propertyType')}
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryFilterType)}
                    className="w-full bg-[#EEF6F6] dark:bg-[#0f231f] border border-transparent rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white text-sm appearance-none focus:border-[#006655] dark:focus:border-[#06f9d0] focus:outline-none cursor-pointer"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value} className="dark:bg-[#132b26]">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3.5 top-3 text-gray-400 pointer-events-none text-xl">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Rooms: Bedrooms & Bathrooms */}
              <div className="space-y-4">
                {/* Bedrooms Counter */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('filters.bedrooms')}
                  </span>
                  <div className="flex items-center space-x-3 bg-[#EEF6F6] dark:bg-[#0f231f] rounded-full p-1 border border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      disabled={bedrooms === 0}
                      onClick={() => setBedrooms((b) => Math.max(0, b - 1))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-[#132b26] shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-[#006655] dark:hover:text-[#06f9d0] disabled:opacity-40 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                      aria-label="Decrease bedrooms"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center text-gray-900 dark:text-white">
                      {bedrooms === 0 ? t('filters.any') : `${bedrooms}+`}
                    </span>
                    <button
                      type="button"
                      disabled={bedrooms >= 5}
                      onClick={() => setBedrooms((b) => Math.min(5, b + 1))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-[#132b26] shadow-sm flex items-center justify-center text-[#006655] dark:text-[#06f9d0] hover:bg-[#006655] hover:text-white dark:hover:bg-[#06f9d0] dark:hover:text-[#19322F] transition-colors cursor-pointer"
                      aria-label="Increase bedrooms"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                {/* Bathrooms Counter */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('filters.bathrooms')}
                  </span>
                  <div className="flex items-center space-x-3 bg-[#EEF6F6] dark:bg-[#0f231f] rounded-full p-1 border border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      disabled={bathrooms === 0}
                      onClick={() => setBathrooms((b) => Math.max(0, b - 1))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-[#132b26] shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-[#006655] dark:hover:text-[#06f9d0] disabled:opacity-40 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                      aria-label="Decrease bathrooms"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center text-gray-900 dark:text-white">
                      {bathrooms === 0 ? t('filters.any') : `${bathrooms}+`}
                    </span>
                    <button
                      type="button"
                      disabled={bathrooms >= 5}
                      onClick={() => setBathrooms((b) => Math.min(5, b + 1))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-[#132b26] shadow-sm flex items-center justify-center text-[#006655] dark:text-[#06f9d0] hover:bg-[#006655] hover:text-white dark:hover:bg-[#06f9d0] dark:hover:text-[#19322F] transition-colors cursor-pointer"
                      aria-label="Increase bathrooms"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Amenities */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {t('filters.amenities')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity.id);
                  const label = t(`amenities.${amenity.id}`);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleToggleAmenity(amenity.id)}
                      className={`relative px-4 py-3 rounded-xl border text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none text-left ${
                        isChecked
                          ? 'border-[#006655] dark:border-[#06f9d0] bg-[#006655]/10 dark:bg-[#06f9d0]/15 text-[#006655] dark:text-[#06f9d0] font-medium shadow-sm'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f231f] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`material-icons text-lg leading-none ${
                          isChecked
                            ? 'text-[#006655] dark:text-[#06f9d0]'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {amenity.icon}
                      </span>
                      <span className="truncate">{label}</span>
                      {isChecked && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#006655] dark:bg-[#06f9d0] rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white dark:bg-[#132b26] border-t border-gray-100 dark:border-white/10 px-6 sm:px-8 py-4 sm:py-5 sticky bottom-0 z-30 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4 cursor-pointer"
            >
              {t('common.clearFilters')}
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="bg-[#006655] hover:bg-[#005244] text-white px-7 sm:px-8 py-3 rounded-xl font-medium shadow-lg shadow-[#006655]/25 hover:shadow-[#006655]/40 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer text-sm sm:text-base"
            >
              <span>
                {matchingCount === 1
                  ? t('filters.showSingle')
                  : t('filters.showMultiple', { count: matchingCount })}
              </span>
              <span className="material-icons text-sm leading-none">arrow_forward</span>
            </button>
          </footer>
        </main>
      </div>
    </ModalPortal>
  );
}

