'use client';

import { useState, useEffect, useCallback } from 'react';

export type TourStep = {
  id: string;
  title?: string;
  message: string;
  targetSelector?: string;
  action?: () => void;
  onEnter?: () => void;
  onExit?: () => void;
};

type TourState = {
  isActive: boolean;
  currentStepIndex: number;
  isDismissed: boolean;
  hasCompleted: boolean;
  userChoice: 'guided' | 'self' | null;
};

export function useTour(steps: TourStep[]) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Use consistent initial state for both server and client to avoid hydration mismatch
  const [state, setState] = useState<TourState>({
    isActive: false,
    currentStepIndex: 0,
    isDismissed: false,
    hasCompleted: false,
    userChoice: null,
  });

  // Hydrate from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsMounted(true);

    const dismissed = localStorage.getItem('tour-dismissed') === 'true';
    const completed = localStorage.getItem('tour-completed') === 'true';
    const choice = localStorage.getItem('tour-choice') as 'guided' | 'self' | null;

    // Debug logging
    console.log('[useTour] localStorage values:', { dismissed, completed, choice });

    if (dismissed || completed || choice) {
      setState((prev) => ({
        ...prev,
        isDismissed: dismissed,
        hasCompleted: completed,
        userChoice: choice,
      }));
    }
  }, []);

  const currentStep = steps[state.currentStepIndex];

  const startTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      currentStepIndex: 0,
      isDismissed: false,
      userChoice: 'guided',
    }));
    localStorage.setItem('tour-choice', 'guided');
    localStorage.removeItem('tour-dismissed');

    // Don't auto-trigger actions - let users experience it themselves
    // Only call onEnter hook if needed
    if (steps[0]?.onEnter) {
      steps[0].onEnter();
    }
  }, [steps]);

  const goNext = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1;

      // Call onExit for current step
      if (steps[prev.currentStepIndex]?.onExit) {
        steps[prev.currentStepIndex].onExit!();
      }

      // If tour is complete
      if (nextIndex >= steps.length) {
        localStorage.setItem('tour-completed', 'true');
        localStorage.setItem('tour-choice', 'guided');
        return {
          ...prev,
          isActive: false,
          hasCompleted: true,
          currentStepIndex: 0,
        };
      }

      // Call onEnter for next step
      if (steps[nextIndex]?.onEnter) {
        steps[nextIndex].onEnter!();
      }

      // Don't auto-trigger actions - let users experience it themselves
      // Only trigger actions if explicitly needed (not for demo steps)

      return {
        ...prev,
        currentStepIndex: nextIndex,
      };
    });
  }, [steps]);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex === 0) return prev;

      const prevIndex = prev.currentStepIndex - 1;

      // Call onExit for current step
      if (steps[prev.currentStepIndex]?.onExit) {
        steps[prev.currentStepIndex].onExit!();
      }

      // Call onEnter for previous step
      if (steps[prevIndex]?.onEnter) {
        steps[prevIndex].onEnter!();
      }

      return {
        ...prev,
        currentStepIndex: prevIndex,
      };
    });
  }, [steps]);

  const skipTour = useCallback(() => {
    setState((prev) => {
      if (steps[prev.currentStepIndex]?.onExit) {
        steps[prev.currentStepIndex].onExit!();
      }
      return {
        ...prev,
        isActive: false,
        currentStepIndex: 0,
        userChoice: 'self',
      };
    });
    localStorage.setItem('tour-choice', 'self');
  }, [steps]);

  const replayTour = useCallback(() => {
    localStorage.removeItem('tour-completed');
    startTour();
  }, [startTour]);

  const dismissAssistant = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDismissed: true,
      isActive: false,
    }));
    localStorage.setItem('tour-dismissed', 'true');
  }, []);

  const chooseSelfExplore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      userChoice: 'self',
      isActive: false,
    }));
    localStorage.setItem('tour-choice', 'self');
  }, []);

  return {
    currentStep,
    currentStepIndex: state.currentStepIndex,
    totalSteps: steps.length,
    isTourActive: state.isActive,
    isDismissed: state.isDismissed,
    hasCompleted: state.hasCompleted,
    userChoice: state.userChoice,
    isMounted,
    startTour,
    goNext,
    goBack,
    skipTour,
    replayTour,
    dismissAssistant,
    chooseSelfExplore,
  };
}

