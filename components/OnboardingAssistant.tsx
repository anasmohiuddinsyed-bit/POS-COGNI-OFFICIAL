'use client';

import { useState, useEffect } from 'react';
import { useTour, TourStep } from '@/lib/useTour';
import { TourOverlay } from './TourOverlay';

type OnboardingAssistantProps = {
  steps: TourStep[];
  onAction?: (actionType: string, stepId: string) => void;
};

export function OnboardingAssistant({ steps, onAction }: OnboardingAssistantProps) {
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isTourActive,
    isDismissed,
    hasCompleted,
    userChoice,
    isMounted,
    startTour,
    goNext,
    goBack,
    skipTour,
    replayTour,
    dismissAssistant,
    chooseSelfExplore,
  } = useTour(steps);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  // Debug logging
  useEffect(() => {
    if (isMounted) {
      console.log('[OnboardingAssistant] State:', {
        isMounted,
        isDismissed,
        hasCompleted,
        userChoice,
        isTourActive,
        shouldShowWelcome: !isTourActive && !hasCompleted && !userChoice && !isDismissed,
      });
    }
  }, [isMounted, isDismissed, hasCompleted, userChoice, isTourActive]);

  // Animate text appearing (typing effect) - must be called before any early returns
  useEffect(() => {
    if (!isMounted || !currentStep?.message) {
      setDisplayedText('');
      return;
    }

    setIsSpeaking(true);
    setDisplayedText('');
    const message = currentStep.message;
    let charIndex = 0;

    const typeText = () => {
      if (charIndex < message.length) {
        setDisplayedText(message.slice(0, charIndex + 1));
        charIndex++;
        setTimeout(typeText, 30); // Typing speed
      } else {
        setIsSpeaking(false);
      }
    };

    typeText();
  }, [currentStep?.message, isMounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    // Show a simple loading indicator while mounting
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="bg-blue-600 rounded-full p-3 animate-pulse">
          <img 
            src="/POSENTIA-LG.png" 
            alt="POSENTIA Logo" 
            className="h-10 w-10 object-contain"
          />
        </div>
      </div>
    );
  }

  // If dismissed completely and no tour active, don't show
  // (This is now handled in the welcome screen logic above)

  // If user chose self-explore and hasn't completed tour, show minimal prompt
  if (userChoice === 'self' && !hasCompleted && !isTourActive) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={startTour}
          className="bg-white rounded-full shadow-xl border-2 border-blue-600 p-4 hover:scale-110 transition-transform"
          aria-label="Start guided tour"
        >
          <img 
            src="/POSENTIA-LG.png" 
            alt="POSENTIA Logo" 
            className="h-12 w-12 object-contain animate-bounce"
          />
        </button>
      </div>
    );
  }

  // If tour completed, show minimized replay option
  if (hasCompleted && !isTourActive && !isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsMinimized(true)}
          className="bg-white rounded-full shadow-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
          aria-label="Minimize assistant"
        >
          <img 
            src="/POSENTIA-LG.png" 
            alt="POSENTIA Logo" 
            className="h-10 w-10 object-contain"
          />
        </button>
      </div>
    );
  }

  if (isMinimized && hasCompleted) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 rounded-full shadow-xl p-4 hover:bg-blue-700 transition-colors animate-pulse"
          aria-label="Open assistant"
        >
          <img 
            src="/POSENTIA-LG.png" 
            alt="POSENTIA Logo" 
            className="h-12 w-12 object-contain"
          />
        </button>
      </div>
    );
  }

  // Initial state - show welcome (only if not dismissed, not completed, no choice made, and tour not active)
  // Show welcome screen if not completed, no choice made, and not in tour
  if (!isTourActive && !hasCompleted && !userChoice) {
    // If dismissed, show minimal button instead of full welcome
    if (isDismissed) {
      return (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            onClick={startTour}
            className="bg-blue-600 rounded-full shadow-xl p-4 hover:scale-110 transition-transform animate-pulse"
            aria-label="Start guided tour"
          >
            <img 
              src="/POSENTIA-LG.png" 
              alt="POSENTIA Logo" 
              className="h-12 w-12 object-contain"
            />
          </button>
        </div>
      );
    }
    
    // Show full welcome screen
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden max-w-sm animate-fade-in">
          {/* Animated Logo Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`relative ${isSpeaking ? 'animate-pulse-slow' : ''}`}>
                <img 
                  src="/POSENTIA-LG.png" 
                  alt="POSENTIA Logo" 
                  className="h-12 w-12 object-contain"
                />
                {isSpeaking && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <p className="text-white font-bold text-sm">POSENTIA Guide</p>
                <p className="text-blue-100 text-xs">I'll show you around</p>
              </div>
            </div>
            <button
              onClick={dismissAssistant}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Dismiss assistant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Message */}
          <div className="p-5">
            <p className="text-slate-900 mb-4 leading-relaxed">
              Want a quick 60-second tour? I'll guide you through the demo so you can see how POSENTIA turns leads into revenue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={startTour}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                Start Guided Tour
              </button>
              <button
                onClick={chooseSelfExplore}
                className="flex-1 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                Explore on My Own
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tour active - show animated logo with speech bubble
  if (isTourActive && currentStep) {
    const sectionNames: Record<string, string> = {
      '#demo-inbound': 'Inbound Simulator',
      '#demo-conversation': 'Conversation Thread',
      '#demo-qualification': 'Qualification & Scoring',
      '#demo-followup': 'Follow-Up Sequence',
      '#demo-crm-preview': 'CRM Write-Back',
      '#demo-cta-activate': 'Activate POSENTIA',
    };
    
    return (
      <>
        <TourOverlay 
          targetSelector={currentStep.targetSelector} 
          isActive={true}
          sectionName={currentStep.targetSelector ? sectionNames[currentStep.targetSelector] : undefined}
        />
        <div className="fixed bottom-6 right-6 z-[9999] max-w-md w-[calc(100vw-2rem)]">
          {/* Animated POSENTIA Logo with Speech Bubble */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden animate-fade-in">
            {/* Header with Logo */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`relative ${isSpeaking ? 'animate-speak' : ''}`}>
                  <img 
                    src="/POSENTIA-LG.png" 
                    alt="POSENTIA Logo" 
                    className="h-12 w-12 object-contain"
                  />
                  {isSpeaking && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                      <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping-slow" />
                    </>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">POSENTIA</p>
                  <p className="text-blue-100 text-xs">Step {currentStepIndex + 1} of {totalSteps}</p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-white/10"
              >
                Skip
              </button>
            </div>

            {/* Speech Bubble with Message */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white" aria-live="polite">
              <div className="relative">
                {/* Speech bubble tail */}
                <div className="absolute -top-3 left-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-50"></div>
                
                {/* Message text */}
                <p className="text-slate-900 text-sm leading-relaxed font-medium">
                  {displayedText}
                  {isSpeaking && <span className="inline-block w-1 h-4 bg-blue-600 ml-1 animate-blink">|</span>}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="px-5 pb-5 flex gap-3">
              {currentStepIndex > 0 && (
                <button
                  onClick={goBack}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  ← Back
                </button>
              )}
              {currentStepIndex < totalSteps - 1 ? (
                <button
                  onClick={goNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-blue-600/25"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-green-600/25"
                >
                  Activate Now →
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tour completed - show conversion CTA
  if (hasCompleted && !isTourActive && !isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] max-w-sm">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl border-2 border-blue-800 overflow-hidden animate-fade-in">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="/POSENTIA-LG.png" 
                alt="POSENTIA Logo" 
                className="h-10 w-10 object-contain"
              />
              <p className="text-white font-bold">Tour Complete!</p>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              You've seen how POSENTIA works. Ready to stop losing leads?
            </p>
            <div className="flex gap-2">
              <a
                href="/checkout?product=ai-lead-concierge"
                className="flex-1 bg-white hover:bg-blue-50 text-blue-600 font-bold py-2.5 px-4 rounded-lg text-sm text-center transition-colors"
              >
                Activate $999
              </a>
              <button
                onClick={replayTour}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors border border-white/20"
              >
                Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
