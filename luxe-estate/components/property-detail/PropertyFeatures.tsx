'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { useTranslation } from '@/components/providers';
import { MortgageCalculatorModal } from './MortgageCalculatorModal';

interface PropertyFeaturesProps {
  property: Property;
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const [isReadMore, setIsReadMore] = useState(false);
  const [isMortgageOpen, setIsMortgageOpen] = useState(false);
  const { t } = useTranslation();

  const amenities =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : [
          'Smart Home System',
          'Swimming Pool',
          'Central Heating & Cooling',
          'Electric Vehicle Charging',
          'Private Gym',
          'Wine Cellar',
        ];

  // Default description if missing
  const defaultDescription = `Experience modern luxury in this architecturally stunning home located in ${property.location.formatted}. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.\n\nThe open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.`;

  const description = property.description || defaultDescription;
  const descriptionParagraphs = description.split('\n\n').filter(Boolean);

  // Quick mortgage monthly estimate: roughly ~0.55% of price/month
  const estimatedMonthly = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(
    property.listingType === 'for_rent'
      ? property.price
      : Math.round(property.price * 0.00543)
  );

  return (
    <div className="space-y-8">
      {/* Property Features 4-Box Grid */}
      <div className="bg-white dark:bg-[#162e2a] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10 transition-colors">
        <h2 className="text-lg font-bold mb-6 text-[#19322F] dark:text-white">
          {t('propertyDetail.propertyFeatures')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {/* Square Meters */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 dark:bg-white/5 rounded-xl border border-[#006655]/10 dark:border-white/5 text-center">
            <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-2xl sm:text-3xl mb-2">
              square_foot
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#19322F] dark:text-white">
              {property.specs.areaSqMeters.toLocaleString()}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#5C706D] dark:text-gray-400 font-semibold mt-0.5">
              {t('propertyDetail.squareMeters')}
            </span>
          </div>

          {/* Bedrooms */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 dark:bg-white/5 rounded-xl border border-[#006655]/10 dark:border-white/5 text-center">
            <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-2xl sm:text-3xl mb-2">
              bed
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#19322F] dark:text-white">
              {property.specs.bedrooms}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#5C706D] dark:text-gray-400 font-semibold mt-0.5">
              {t('propertyDetail.bedrooms')}
            </span>
          </div>

          {/* Bathrooms */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 dark:bg-white/5 rounded-xl border border-[#006655]/10 dark:border-white/5 text-center">
            <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-2xl sm:text-3xl mb-2">
              shower
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#19322F] dark:text-white">
              {property.specs.bathrooms}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#5C706D] dark:text-gray-400 font-semibold mt-0.5">
              {t('propertyDetail.bathrooms')}
            </span>
          </div>

          {/* Garage */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 dark:bg-white/5 rounded-xl border border-[#006655]/10 dark:border-white/10 text-center">
            <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-2xl sm:text-3xl mb-2">
              directions_car
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#19322F] dark:text-white">
              {property.specs.garage ?? 1}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#5C706D] dark:text-gray-400 font-semibold mt-0.5">
              {t('propertyDetail.garage')}
            </span>
          </div>
        </div>
      </div>

      {/* About this home */}
      <div className="bg-white dark:bg-[#162e2a] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10 transition-colors">
        <h2 className="text-lg font-bold mb-4 text-[#19322F] dark:text-white">
          {t('propertyDetail.aboutHome')}
        </h2>
        <div className="text-[#19322F]/80 dark:text-gray-200 leading-relaxed text-sm sm:text-base space-y-4">
          {descriptionParagraphs.map((para, idx) => {
            if (idx > 0 && !isReadMore) return null;
            return <p key={idx}>{para}</p>;
          })}
        </div>

        {descriptionParagraphs.length > 1 && (
          <button
            onClick={() => setIsReadMore(!isReadMore)}
            className="mt-4 text-[#006655] dark:text-[#06f9d0] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            <span>{isReadMore ? t('propertyDetail.showLess') : t('propertyDetail.readMore')}</span>
            <span className="material-icons text-sm">
              {isReadMore ? 'expand_less' : 'arrow_forward'}
            </span>
          </button>
        )}
      </div>

      {/* Amenities Grid */}
      <div className="bg-white dark:bg-[#162e2a] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10 transition-colors">
        <h2 className="text-lg font-bold mb-6 text-[#19322F] dark:text-white">
          {t('propertyDetail.amenities')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          {amenities.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-[#19322F]/80 dark:text-gray-200 text-sm font-medium"
            >
              <span className="material-icons text-[#006655] dark:text-[#06f9d0] text-lg flex-shrink-0">
                check_circle
              </span>
              <span>{t(`amenities.${item}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Payment Banner */}
      <div className="bg-[#006655]/5 dark:bg-white/5 p-6 rounded-2xl border border-[#006655]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-[#162e2a] rounded-full text-[#006655] dark:text-[#06f9d0] shadow-sm flex-shrink-0">
            <span className="material-icons text-2xl">calculate</span>
          </div>
          <div>
            <h3 className="font-bold text-[#19322F] dark:text-white text-base">
              {t('propertyDetail.estimatedPayment')}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C706D] dark:text-gray-300 mt-0.5">
              {t('propertyDetail.startingFrom')}{' '}
              <strong className="text-[#006655] dark:text-[#06f9d0]">
                {estimatedMonthly}{t('common.perMonth')}
              </strong>{' '}
              {t('propertyDetail.withDown')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMortgageOpen(true)}
          className="whitespace-nowrap px-5 py-2.5 bg-white dark:bg-[#162e2a] border border-[#19322F]/10 dark:border-white/10 rounded-xl text-sm font-semibold hover:border-[#006655] text-[#19322F] dark:text-white transition-all shadow-sm cursor-pointer hover:scale-105"
        >
          {t('propertyDetail.calculateMortgage')}
        </button>
      </div>

      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        property={property}
        isOpen={isMortgageOpen}
        onClose={() => setIsMortgageOpen(false)}
      />
    </div>
  );
}

