import { useEffect, useRef, useCallback } from 'react';

interface UseAutoplayProps {
  enabled: boolean;
  interval: number;
  onNext: () => void;
  paused?: boolean;
}

export function useAutoplay({
  enabled,
  interval,
  onNext,
  paused = false
}: UseAutoplayProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!enabled || paused) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceLastInteraction >= 5000) { // Only advance if no recent interaction
        onNext();
        startTimer(); // Restart timer for next slide
      }
    }, interval);
  }, [enabled, interval, onNext, paused, clearTimer]);

  // Setup and cleanup timer
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [enabled, interval, onNext, paused, clearTimer, startTimer]);

  // Reset timer on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (enabled && !paused) {
        clearTimer();
        startTimer();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, paused, clearTimer, startTimer]);

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    clearTimer();
    startTimer();
  }, [clearTimer, startTimer]);

  return {
    recordInteraction,
    clearTimer,
    startTimer
  };
}