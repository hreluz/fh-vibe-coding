'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { ModalPortal } from '@/components/ui';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'schedule' | 'contact';
}

export function ScheduleVisitModal({
  property,
  isOpen,
  onClose,
  initialMode = 'schedule',
}: ScheduleVisitModalProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'contact'>(initialMode);
  const [tourType, setTourType] = useState<'in_person' | 'video'>('in_person');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  const resetAndClose = useCallback(() => {
    setIsSubmitted(false);
    onClose();
  }, [onClose]);

  // Handle ESC key to exit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, resetAndClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const timeSlots = ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'];
  const agentName = property.agent?.name || 'Sarah Jenkins';

  return (
    <ModalPortal>
      <div
        onClick={resetAndClose}
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200 cursor-pointer"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#162e2a] text-[#19322F] dark:text-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#19322F]/10 dark:border-white/10 p-5 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto overscroll-contain cursor-default"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#5C706D] hover:text-[#19322F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <span className="material-icons text-xl">close</span>
          </button>

          {isSubmitted ? (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#006655]/10 text-[#006655] dark:text-[#06f9d0] mx-auto flex items-center justify-center">
                <span className="material-icons text-3xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold">
                {activeTab === 'schedule' ? 'Tour Requested!' : 'Message Sent!'}
              </h3>
              <p className="text-sm text-[#5C706D] dark:text-gray-300 max-w-sm mx-auto">
                Thank you, <strong className="text-[#19322F] dark:text-white">{name || 'there'}</strong>! {agentName} has received your request for{' '}
                <strong className="text-[#006655] dark:text-[#06f9d0]">{property.title}</strong> and will reach out shortly.
              </p>
              {activeTab === 'schedule' && (
                <div className="p-4 bg-[#EEF6F6] dark:bg-white/5 rounded-xl text-left text-xs space-y-1">
                  <p><strong>Type:</strong> {tourType === 'in_person' ? 'In-Person Private Tour' : 'Live Video Tour'}</p>
                  {selectedDate && <p><strong>Date:</strong> {selectedDate}</p>}
                  <p><strong>Time Slot:</strong> {selectedTime}</p>
                </div>
              )}
              <button
                type="button"
                onClick={resetAndClose}
                className="mt-4 w-full bg-[#006655] hover:bg-[#005544] text-white py-3 rounded-xl font-medium transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              {/* Header Tabs */}
              <div className="flex border-b border-gray-100 dark:border-white/10 mb-5 pr-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`pb-3 text-sm font-semibold border-b-2 mr-6 transition-colors cursor-pointer ${
                    activeTab === 'schedule'
                      ? 'border-[#006655] text-[#006655] dark:text-[#06f9d0]'
                      : 'border-transparent text-[#5C706D] hover:text-[#19322F] dark:hover:text-white'
                  }`}
                >
                  Schedule a Tour
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'contact'
                      ? 'border-[#006655] text-[#006655] dark:text-[#06f9d0]'
                      : 'border-transparent text-[#5C706D] hover:text-[#19322F] dark:hover:text-white'
                  }`}
                >
                  Contact Agent
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-[#5C706D] dark:text-gray-400 truncate">
                  {property.title} • {property.location.formatted}
                </p>
              </div>

              {/* Tour Type Selector (Only in Schedule Mode) */}
              {activeTab === 'schedule' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setTourType('in_person')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tourType === 'in_person'
                        ? 'border-[#006655] bg-[#006655]/10 text-[#006655] dark:text-[#06f9d0] shadow-sm'
                        : 'border-gray-200 dark:border-white/10 text-[#5C706D] dark:text-gray-400 hover:border-[#006655]/40'
                    }`}
                  >
                    <span className="material-icons text-base">directions_walk</span>
                    In-Person Tour
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourType('video')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tourType === 'video'
                        ? 'border-[#006655] bg-[#006655]/10 text-[#006655] dark:text-[#06f9d0] shadow-sm'
                        : 'border-gray-200 dark:border-white/10 text-[#5C706D] dark:text-gray-400 hover:border-[#006655]/40'
                    }`}
                  >
                    <span className="material-icons text-base">videocam</span>
                    Video Walkthrough
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Date & Time selection (Schedule mode only) */}
                {activeTab === 'schedule' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006655]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-1.5 px-1 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                              selectedTime === slot
                                ? 'border-[#006655] bg-[#006655] text-white shadow-sm'
                                : 'border-gray-200 dark:border-white/10 text-[#19322F] dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006655]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006655]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006655]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19322F] dark:text-gray-200 mb-1">
                    {activeTab === 'schedule'
                      ? 'Special Inquiries / Questions (Optional)'
                      : 'Your Message *'}
                  </label>
                  <textarea
                    rows={activeTab === 'schedule' ? 2 : 3}
                    required={activeTab === 'contact'}
                    placeholder={
                      activeTab === 'schedule'
                        ? "e.g., I'd like to ask about parking..."
                        : `Hello ${agentName}, I am interested in ${property.title}. Please provide more details.`
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006655] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006655] hover:bg-[#005544] text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-[#006655]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span className="material-icons text-base">
                    {activeTab === 'schedule' ? 'calendar_today' : 'send'}
                  </span>
                  {activeTab === 'schedule' ? 'Request Tour Confirmation' : 'Send Message to Agent'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
