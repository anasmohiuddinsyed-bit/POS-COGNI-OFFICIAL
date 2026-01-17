'use client';

import { useState, useEffect, useRef } from 'react';

type DemoStep = {
  id: string;
  title: string;
  message: string;
  targetSelector: string;
  action?: 'auto-trigger-sms' | 'wait-for-typing' | 'wait-for-click' | 'auto-trigger-email' | 'show-info';
  actionTarget?: string;
  waitForSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'property-cards',
    title: 'Start a Conversation',
    message: 'Click "Send SMS" or "Send Email" to start a demo conversation about this property. Go ahead and click it!',
    targetSelector: '#demo-inbound',
    action: 'wait-for-click',
    waitForSelector: '#sms-messages .flex:first-child, #email-messages .bg-white:first-child', // Wait for first message to appear
    position: 'bottom',
  },
  {
    id: 'sms-conversation',
    title: 'Type Your Message',
    message: 'Great! Now try typing a message in the SMS box below. Type "hi" or click a quick reply button to see POSENTIA respond.',
    targetSelector: '#demo-conversation',
    action: 'wait-for-typing',
    waitForSelector: '#sms-messages .flex', // Wait for user message to appear
    position: 'left',
  },
  {
    id: 'continue-conversation',
    title: 'Keep Talking',
    message: 'Perfect! Try responding again or clicking another quick reply. Watch how POSENTIA guides you through qualification.',
    targetSelector: '#demo-conversation',
    action: 'wait-for-typing',
    waitForSelector: '#sms-messages .flex',
    position: 'left',
  },
  {
    id: 'crm-preview',
    title: 'Check Your CRM',
    message: 'See how your conversation is automatically logged here! Notice the qualification details, lead score, and follow-up sequence.',
    targetSelector: '#demo-crm-preview',
    action: 'show-info',
    position: 'right',
  },
];

type GuidedDemoProps = {
  demoActions?: {
    triggerSMSLead?: (message?: string) => void;
  };
};

export function GuidedDemo({ demoActions }: GuidedDemoProps = {}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);
  const [isWaitingForInteraction, setIsWaitingForInteraction] = useState(false);
  const positionUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const interactionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Update target position when step changes
  useEffect(() => {
    if (!isActive) {
      setTargetPosition(null);
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
      return;
    }

    const updatePosition = () => {
      const selector = DEMO_STEPS[currentStep]?.targetSelector;
      if (!selector) {
        setTargetPosition(null);
        return;
      }

      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition(rect);
        
        // Smooth scroll to element
        const offset = window.innerHeight * 0.15;
        const elementTop = rect.top + window.scrollY - offset;
        window.scrollTo({
          top: Math.max(0, elementTop),
          behavior: 'smooth',
        });
      } else {
        setTargetPosition(null);
      }
    };

    const initialTimer = setTimeout(updatePosition, 300);
    updatePosition();
    
    const handleUpdate = () => {
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
      positionUpdateRef.current = setTimeout(updatePosition, 16);
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
    setIsActive(true);
    setCurrentStep(0);
    setIsWaitingForInteraction(false);
    
    // Auto-trigger first action if needed
    const firstStep = DEMO_STEPS[0];
    if (firstStep.action === 'wait-for-click') {
      setIsWaitingForInteraction(true);
    }
  };

  // Monitor for user interactions and auto-advance
  useEffect(() => {
    if (!isActive || !isWaitingForInteraction) return;

    const currentStepData = DEMO_STEPS[currentStep];
    if (!currentStepData?.waitForSelector) return;

    // Set initial baseline
    const getCurrentCount = () => {
      const element = document.querySelector(currentStepData.waitForSelector!);
      if (element) {
        return element.children.length;
      }
      return 0;
    };

    let previousCount = getCurrentCount();

    const checkInteraction = () => {
      const currentCount = getCurrentCount();
      
      // If count increased, user interacted!
      if (currentCount > previousCount) {
        setIsWaitingForInteraction(false);
        previousCount = currentCount;
        
        // Auto-advance after a short delay to let user see the response
        setTimeout(() => {
          if (currentStep < DEMO_STEPS.length - 1) {
            const nextStepIdx = currentStep + 1;
            setCurrentStep(nextStepIdx);
            
            // Check if next step needs waiting
            const nextStep = DEMO_STEPS[nextStepIdx];
            if (nextStep?.action === 'wait-for-typing' || nextStep?.action === 'wait-for-click') {
              // Update baseline for next step
              setTimeout(() => {
                previousCount = getCurrentCount();
                setIsWaitingForInteraction(true);
              }, 500);
            }
          } else {
            handleComplete();
          }
        }, 2500); // Wait 2.5s to see AI response before advancing
      }
    };

    // Check every 500ms - don't be too aggressive
    interactionCheckRef.current = setInterval(checkInteraction, 500);

    return () => {
      if (interactionCheckRef.current) {
        clearInterval(interactionCheckRef.current);
      }
    };
  }, [isActive, isWaitingForInteraction, currentStep]);

  const handleNext = () => {
    if (isWaitingForInteraction) {
      // Still waiting for user to interact
      return;
    }

    if (currentStep < DEMO_STEPS.length - 1) {
      const nextStep = DEMO_STEPS[currentStep + 1];
      
      // Auto-trigger actions if needed
      if (nextStep.action === 'auto-trigger-sms' && demoActions?.triggerSMSLead) {
        demoActions.triggerSMSLead();
        setIsWaitingForInteraction(true);
      } else if (nextStep.action === 'wait-for-typing' || nextStep.action === 'wait-for-click') {
        setIsWaitingForInteraction(true);
      }
      
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('posentia-guided-demo-completed', 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStepData = DEMO_STEPS[currentStep];
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100;

  // Floating start button
  if (!isActive) {
    return (
      <div className="fixed bottom-8 right-8 z-[9999]">
        <button
          onClick={handleStart}
          className="group relative bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-2xl p-4 hover:scale-105 transition-all duration-300"
          aria-label="Start guided demo"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Guided Demo</div>
              <div className="text-xs opacity-80">60 seconds</div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Active tour overlay
  return (
    <>
      {/* Backdrop - lighter, clickable but not blocking */}
      <div 
        className="fixed inset-0 bg-slate-900/20 z-[9997] transition-opacity duration-300 pointer-events-none"
      />

      {/* Highlight overlay */}
      {targetPosition && (
        <div
          className="fixed z-[9998] pointer-events-none transition-all duration-500"
          style={{
            top: `${targetPosition.top + window.scrollY - 8}px`,
            left: `${targetPosition.left + window.scrollX - 8}px`,
            width: `${targetPosition.width + 16}px`,
            height: `${targetPosition.height + 16}px`,
          }}
        >
          <div className="absolute inset-0 rounded-xl border-4 border-blue-500 shadow-[0_0_0_4px_rgba(255,255,255,0.8),0_0_30px_rgba(59,130,246,0.6)]" />
          <div className="absolute -inset-2 rounded-xl bg-blue-500/20 blur-xl" />
        </div>
      )}

      {/* Tooltip card */}
      {currentStepData && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{currentStepData.title}</h3>
                <p className="text-blue-100 text-sm">Step {currentStep + 1} of {DEMO_STEPS.length}</p>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message */}
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed mb-4">{currentStepData.message}</p>

              {/* Action hint - show when waiting for interaction */}
              {(currentStepData.action === 'wait-for-typing' || currentStepData.action === 'wait-for-click') && isWaitingForInteraction && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-sm text-blue-700 font-medium">Try it now! I'll automatically move to the next step when you're done.</p>
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 font-medium">Progress</span>
                  <span className="text-xs text-slate-500 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentStep > 0 && !isWaitingForInteraction && (
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                  >
                    ← Back
                  </button>
                )}
                {/* Only show Next button if not waiting for interaction */}
                {!isWaitingForInteraction && (
                  <button
                    onClick={currentStep === DEMO_STEPS.length - 1 ? handleComplete : handleNext}
                    className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg`}
                  >
                    {currentStep === DEMO_STEPS.length - 1 ? 'Got it!' : 'Skip to Next →'}
                  </button>
                )}
                {/* Show waiting indicator if waiting for interaction */}
                {isWaitingForInteraction && (
                  <div className="flex-1 flex items-center justify-center text-blue-600 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <span>Waiting for you to try it...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
