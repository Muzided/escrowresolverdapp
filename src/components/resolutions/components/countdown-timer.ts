import { useState, useEffect } from 'react';

export const useCountdownTimer = (initialSeconds: number, onTimerComplete?: () => void) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
    
    if (initialSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          onTimerComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds, onTimerComplete]);

  return { remainingSeconds };
};