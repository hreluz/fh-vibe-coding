'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Property } from '@/types/property';
import { ModalPortal } from '@/components/ui';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/components/providers';

interface MortgageCalculatorModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function MortgageCalculatorModal({
  property,
  isOpen,
  onClose,
}: MortgageCalculatorModalProps) {
  const { t } = useTranslation();
  const initialPrice = property.listingType === 'for_sale' ? property.price : property.price * 250;
  const [price, setPrice] = useState(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const downPaymentAmount = useMemo(
    () => Math.round((price * downPaymentPercent) / 100),
    [price, downPaymentPercent]
  );

  const loanAmount = useMemo(
    () => Math.max(0, price - downPaymentAmount),
    [price, downPaymentAmount]
  );

  const monthlyPrincipalAndInterest = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;

    if (monthlyRate === 0) return loanAmount / totalPayments;

    const payment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    return Math.round(payment);
  }, [loanAmount, interestRate, loanTermYears]);

  const monthlyPropertyTax = useMemo(() => Math.round((price * 0.011) / 12), [price]);
  const monthlyInsurance = useMemo(() => Math.round((price * 0.0035) / 12), [price]);
  const monthlyHOA = 250;

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyHOA;

  if (!isOpen) return null;

  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#162e2a] text-[#19322F] dark:text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#19322F]/10 dark:border-white/10 p-5 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto overscroll-contain cursor-default"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#5C706D] hover:text-[#19322F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
            aria-label={t('mortgageModal.close')}
          >
            <span className="material-icons text-xl">close</span>
          </button>

          <div className="mb-5 pr-8">
            <h2 className="text-2xl font-bold mt-1">{t('mortgageModal.title')}</h2>
            <p className="text-xs text-[#5C706D] dark:text-gray-400 mt-1">
              {t('mortgageModal.subtitle')}
            </p>
          </div>

          {/* Result Highlight Card */}
          <div className="bg-[#006655]/5 dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-[#006655]/10 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#5C706D] dark:text-gray-400 font-medium">
                {t('mortgageModal.estimatedMonthly')}
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-[#006655] dark:text-[#06f9d0] mt-0.5">
                {formatUSD(totalMonthlyPayment)}
                <span className="text-sm font-normal text-[#5C706D] dark:text-gray-400">
                  {t('common.perMonth')}
                </span>
              </div>
            </div>
            <div className="text-xs text-right text-[#5C706D] dark:text-gray-400 space-y-1 sm:border-l border-gray-200 dark:border-white/10 sm:pl-4">
              <p>
                {t('mortgageModal.principalInterest')}:{' '}
                <strong className="text-[#19322F] dark:text-white">
                  {formatUSD(monthlyPrincipalAndInterest)}
                </strong>
              </p>
              <p>
                {t('mortgageModal.loanAmount')}:{' '}
                <strong className="text-[#19322F] dark:text-white">{formatUSD(loanAmount)}</strong>
              </p>
            </div>
          </div>

          {/* Sliders & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
            {/* Price Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>{t('mortgageModal.homePrice')}</span>
                <span className="text-[#006655] dark:text-[#06f9d0]">{formatUSD(price)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={15000000}
                step={25000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[#006655] cursor-pointer"
              />
            </div>

            {/* Down Payment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>
                  {t('mortgageModal.downPayment')} ({downPaymentPercent}%)
                </span>
                <span className="text-[#006655] dark:text-[#06f9d0]">
                  {formatUSD(downPaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-[#006655] cursor-pointer"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>{t('mortgageModal.interestRate')}</span>
                <span className="text-[#006655] dark:text-[#06f9d0]">{interestRate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={12.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#006655] cursor-pointer"
              />
            </div>

            {/* Loan Term */}
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold">{t('mortgageModal.loanTerm')}</span>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTermYears(term)}
                    className={`py-2 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                      loanTermYears === term
                        ? 'border-[#006655] bg-[#006655] text-white shadow-sm'
                        : 'border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {term} {t('mortgageModal.years')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#5C706D] dark:text-gray-400 mb-5">
            {t('mortgageModal.disclaimer')}
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-[#006655] hover:bg-[#005544] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

