'use client';

import { useState, useEffect, useRef } from 'react';

type TourStep = {
  id: string;
  title: string;
  message: string;
  targetSelector: string;
  ctaText?: string;
  ctaLink?: string;
  actionPrompt?: string;
  waitForInteraction?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'inbound',
    title: 'Try It: Send a Test Lead',
    message: "👆 Try this now: Fill in a lead message below (like 'Hi, I saw your listing for 123 Main St') and click 'Simulate SMS Lead'. Watch POSENTIA respond instantly — that's speed-to-lead that converts.",
    targetSelector: '#demo-inbound',
    actionPrompt: 'Enter a message and click "Simulate SMS Lead"',
  },
  {
    id: 'conversation',
    title: 'See the Conversation',
    message: "Look at the conversation above! POSENTIA responded automatically. Now try replying using the quick reply buttons below — see how POSENTIA asks the right questions to qualify your lead.",
    targetSelector: '#demo-conversation',
    actionPrompt: 'Click a quick reply button to continue the conversation',
  },
  {
    id: 'qualification',
    title: 'Watch Lead Scoring',
    message: "See how POSENTIA scored this lead? Check the panel on the right — Hot, Warm, or Cold. Your team knows exactly who to call first. No guessing.",
    targetSelector: '#demo-qualification',
    actionPrompt: 'Review the qualification details',
  },
  {
    id: 'followup',
    title: 'Automated Follow-Up',
    message: "Even if a lead doesn't respond, POSENTIA follows up automatically. See the sequence below — Day 1, Day 3, Day 7. Zero leads go cold.",
    targetSelector: '#demo-followup',
    actionPrompt: 'Check out the follow-up sequence timeline',
  },
  {
    id: 'crm',
    title: 'CRM Integration',
    message: "See the CRM preview? This is what gets logged automatically. Try it: Enter your webhook URL (optional) and click 'Push to CRM' to see it in action. Zero manual entry.",
    targetSelector: '#demo-crm-preview',
    actionPrompt: 'Try pushing to CRM or review the preview',
  },
  {
    id: 'activate',
    title: 'Ready to Activate?',
    message: "That's it. You've seen how POSENTIA works. Every lead gets instant replies, automated follow-up, and clean CRM entries. One-time $999. Lifetime access.",
    targetSelector: '#demo-cta-activate',
    ctaText: 'Activate POSENTIA',
    ctaLink: '/checkout?product=ai-lead-concierge',
  },
];

export function TourGuide() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const positionUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Check if tour should auto-start
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('posentia-tour-completed') === 'true';
    if (!hasSeenTour) {
      // Wait for DOM to be ready and elements to exist
      const checkAndStart = () => {
        const firstElement = document.querySelector(TOUR_STEPS[0]?.targetSelector);
        if (firstElement) {
          setIsActive(true);
        } else {
          // Retry after a short delay if element not found
          setTimeout(checkAndStart, 500);
        }
      };
      
      const timer = setTimeout(checkAndStart, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Smooth position updates with debouncing
  useEffect(() => {
    if (!isActive) {
      setTargetPosition(null);
      if (positionUpdateRef.current) {
        clearInterval(positionUpdateRef.current);
      }
      return;
    }

    const updatePosition = () => {
      const selector = TOUR_STEPS[currentStep]?.targetSelector;
      if (!selector) {
        setTargetPosition(null);
        return;
      }

      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        
        // Always update on step change, or if position changed significantly
        if (!targetPosition || 
            Math.abs(targetPosition.top - rect.top) > 5 ||
            Math.abs(targetPosition.left - rect.left) > 5 ||
            Math.abs(targetPosition.width - rect.width) > 5 ||
            Math.abs(targetPosition.height - rect.height) > 5) {
          setTargetPosition(rect);
          
          // Smooth scroll with offset after a brief delay
          setTimeout(() => {
            const elementRect = element.getBoundingClientRect();
            const offset = window.innerHeight * 0.15;
            const elementTop = elementRect.top + window.scrollY - offset;
            window.scrollTo({
              top: Math.max(0, elementTop),
              behavior: 'smooth',
            });
          }, 100);
        }
      } else {
        // Element not found, try again
        console.warn(`Tour element not found: ${selector}`);
        setTargetPosition(null);
      }
    };

    // Initial update with delay to ensure DOM is ready
    const initialTimer = setTimeout(updatePosition, 300);
    
    // Force update when step changes
    updatePosition();
    
    // Update on scroll/resize with debounce
    const handleUpdate = () => {
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
      positionUpdateRef.current = setTimeout(updatePosition, 16); // ~60fps
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
    };
  }, [currentStep, isActive]);

  const handleStart = () => {
    // Reset and start tour
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem('posentia-tour-completed');
    
    // Force position update after starting
    setTimeout(() => {
      const selector = TOUR_STEPS[0]?.targetSelector;
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetPosition(rect);
          const offset = window.innerHeight * 0.15;
          const elementTop = rect.top + window.scrollY - offset;
          window.scrollTo({
            top: Math.max(0, elementTop),
            behavior: 'smooth',
          });
        }
      }
    }, 100);
  };

  const handleNext = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Smooth transition delay
    
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleBack = async () => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setCurrentStep(currentStep - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('posentia-tour-completed', 'true');
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('posentia-tour-completed', 'true');
  };

  const currentStepData = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  // Premium floating button
  if (!isActive) {
    return (
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStart();
          }}
          className="group relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 text-white rounded-2xl shadow-2xl p-5 hover:scale-105 transition-all duration-500 ease-out hover:shadow-blue-500/50 backdrop-blur-sm border border-white/10"
          aria-label="Start guided tour"
        >
          {/* Animated glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/30 to-indigo-400/30 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse-slow -z-10" />
          
          {/* Inner glow */}
          <div className="absolute inset-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Logo container */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
              <img 
                src="/POSENTIA-LG.png" 
                alt="POSENTIA" 
                className="h-10 w-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping shadow-lg shadow-emerald-400/50" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-blue-100">Take a tour</div>
              <div className="text-[10px] text-blue-200/80">60 seconds</div>
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
            <div className="bg-slate-900/95 backdrop-blur-md text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/50">
              See how POSENTIA works
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Premium tour overlay
  return (
    <>
      {/* Elegant backdrop - minimal blur, non-blocking */}
      <div 
        className="fixed inset-0 bg-slate-900/30 z-[9998] transition-opacity duration-700 ease-out pointer-events-none"
      />

      {/* Spotlight effect on target - clear and visible */}
      {targetPosition && (
        <>
          {/* Highlight ring - visible but non-blocking */}
          <div
            className="fixed z-[9999] pointer-events-none transition-all duration-700 ease-out"
            style={{
              top: `${targetPosition.top + window.scrollY - 12}px`,
              left: `${targetPosition.left + window.scrollX - 12}px`,
              width: `${targetPosition.width + 24}px`,
              height: `${targetPosition.height + 24}px`,
            }}
          >
            {/* Outer glow */}
            <div className="absolute -inset-3 rounded-xl bg-blue-500/50 blur-xl animate-pulse-slow" />
            
            {/* Main highlight border */}
            <div className="absolute inset-0 rounded-lg border-3 border-blue-500 shadow-[0_0_0_2px_white,0_0_30px_rgba(59,130,246,0.9)]" />
            
            {/* Inner ring */}
            <div className="absolute inset-[3px] rounded-md border border-blue-300/80" />
            
            {/* Section label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs whitespace-nowrap">
              {currentStepData?.title}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
            </div>
          </div>
        </>
      )}

      {/* Mobile Phone Style Chat Card */}
      <div className="fixed bottom-8 right-8 z-[10000] w-[380px] max-w-[calc(100vw-4rem)]">
        <div 
          className={`bg-white rounded-[2.5rem] shadow-2xl border-8 border-slate-900 overflow-hidden transition-all duration-500 ease-out ${
            isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />
          
          {/* Phone header with status bar */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 pt-8 pb-4 px-5">
            {/* Status bar simulation */}
            <div className="absolute top-2 left-0 right-0 px-5 flex justify-between items-center text-white/80 text-[10px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white/60 rounded-sm">
                  <div className="w-3 h-1.5 bg-white/80 rounded-sm m-0.5" />
                </div>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {/* POSENTIA Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                    <img 
                      src="/POSENTIA-LG.png" 
                      alt="POSENTIA" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-blue-700 rounded-full animate-pulse" />
                </div>
                
                <div>
                  <p className="text-white font-bold text-base">POSENTIA Guide</p>
                  <p className="text-blue-100 text-xs">Online • Step {currentStep + 1}/{TOUR_STEPS.length}</p>
                </div>
              </div>
              
              <button
                onClick={handleSkip}
                className="text-white/70 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Message bubbles area - phone chat style */}
          <div className="bg-gradient-to-br from-slate-50 to-white px-4 py-5 min-h-[200px] max-h-[400px] overflow-y-auto">
            {/* Incoming message bubble */}
            <div className="flex items-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/POSENTIA-LG.png" 
                  alt="POSENTIA" 
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-200">
                  <p className="text-slate-900 text-sm leading-relaxed">
                    {currentStepData?.message}
                  </p>
                  <p className="text-slate-500 text-xs mt-1.5">Now</p>
                </div>
                
                {/* Action prompt card */}
                {currentStepData?.actionPrompt && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <p className="text-blue-900 font-semibold text-xs mb-0.5">Try it:</p>
                        <p className="text-blue-800 text-xs">{currentStepData.actionPrompt}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Typing indicator animation */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/POSENTIA-LG.png" 
                  alt="POSENTIA" 
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm border border-slate-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Phone bottom section */}
          <div className="bg-white border-t border-slate-200 p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600 font-medium">Progress</span>
                <span className="text-xs text-slate-600 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            {currentStep === TOUR_STEPS.length - 1 && currentStepData?.ctaLink ? (
              <div className="space-y-3">
                <a
                  href={currentStepData.ctaLink}
                  onClick={handleComplete}
                  className="group relative block w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Button glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <span className="relative flex items-center justify-center gap-2">
                    {currentStepData.ctaText || 'Activate Now'}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={handleSkip}
                    className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={isAnimating}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Got it!' : (
                    <>
                      Continue
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkip}
                  className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
                >
                  Skip
                </button>
              </div>
            )}
            
            {/* Phone home indicator */}
            <div className="mt-4 flex justify-center">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
