'use client';

import { useEffect, useState, useRef } from 'react';

type TourOverlayProps = {
  targetSelector?: string;
  isActive: boolean;
  sectionName?: string;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
};

export function TourOverlay({ 
  targetSelector, 
  isActive, 
  sectionName, 
  message,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  onClose 
}: TourOverlayProps) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (!element) {
        setPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const pos = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      };
      setPosition(pos);

      // Position popup to the right of the element, or below if not enough space
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = 380;
      const popupHeight = 200;
      
      let popupTop = rect.top + window.scrollY + 20;
      let popupLeft = rect.right + window.scrollX + 20;
      
      // If not enough space on right, show on left
      if (popupLeft + popupWidth > viewportWidth && rect.left > popupWidth) {
        popupLeft = rect.left + window.scrollX - popupWidth - 20;
      }
      
      // If not enough space on bottom, show above
      if (popupTop + popupHeight > viewportHeight + window.scrollY && rect.top > popupHeight) {
        popupTop = rect.top + window.scrollY - popupHeight - 20;
      }
      
      setPopupPosition({ top: popupTop, left: popupLeft });

      // Smooth scroll element into view (with offset for better visibility)
      const offset = 100;
      const elementTop = rect.top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, elementTop),
        behavior: 'smooth',
      });
    };

    // Delay to ensure DOM is ready
    setTimeout(updatePosition, 100);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetSelector, isActive]);

  // Get section name from selector
  const getSectionName = () => {
    if (sectionName) return sectionName;
    if (!targetSelector) return '';
    const sectionMap: Record<string, string> = {
      '#demo-inbound': 'Inbound Simulator',
      '#demo-conversation': 'Conversation Thread',
      '#demo-qualification': 'Qualification & Scoring',
      '#demo-followup': 'Follow-Up Sequence',
      '#demo-crm-preview': 'CRM Write-Back',
      '#demo-cta-activate': 'Activate POSENTIA',
    };
    return sectionMap[targetSelector] || '';
  };

  const currentSection = getSectionName();

  if (!isActive || !targetSelector || !position) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 z-40 pointer-events-none"
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
      />
      
      {/* Section Indicator at Top */}
      {currentSection && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[55] pointer-events-none animate-fade-in"
        >
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl border-2 border-white flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold text-sm">Focus: {currentSection}</span>
          </div>
        </div>
      )}
      
      {/* Highlight ring with stronger emphasis */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: `${position.top - 6}px`,
          left: `${position.left - 6}px`,
          width: `${position.width + 12}px`,
          height: `${position.height + 12}px`,
        }}
      >
        <div className="absolute inset-0 rounded-xl border-4 border-blue-600 animate-pulse-ring shadow-2xl shadow-blue-600/60 bg-blue-600/5" />
        {/* Secondary glow */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-400/50 animate-pulse-slow" />
      </div>

      {/* Assistant Popup with POSENTIA Logo */}
      {message && popupPosition && (
        <div
          className="fixed z-[60] pointer-events-auto animate-fade-in"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-600 overflow-hidden max-w-sm w-[380px]">
            {/* Header with POSENTIA Logo */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/POSENTIA-LG.png" 
                    alt="POSENTIA Logo" 
                    className="h-10 w-10 object-contain animate-pulse-slow"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">POSENTIA Guide</p>
                  {currentStep !== undefined && totalSteps !== undefined && (
                    <p className="text-blue-100 text-xs">Step {currentStep + 1} of {totalSteps}</p>
                  )}
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Message */}
            <div className="p-5">
              <p className="text-slate-900 text-sm leading-relaxed mb-4">
                {message}
              </p>

              {/* Controls */}
              <div className="flex gap-2">
                {onBack && currentStep !== undefined && currentStep > 0 && (
                  <button
                    onClick={onBack}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    ← Back
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    {currentStep !== undefined && totalSteps !== undefined && currentStep < totalSteps - 1 ? 'Next →' : 'Got it →'}
                  </button>
                )}
                {onSkip && (
                  <button
                    onClick={onSkip}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

