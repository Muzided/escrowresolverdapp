import React, { useEffect, useState, useRef } from 'react';

interface RemainingTimeComponentProps {
    initialSeconds: number;
    onTimerComplete?: () => void;
    disputeAddress: string;
    currentPhase: string;
  }
  
  export const RemainingTimeComponent: React.FC<RemainingTimeComponentProps> = ({ 
    initialSeconds, 
    onTimerComplete,
    disputeAddress,
    currentPhase
  }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onTimerCompleteRef = useRef(onTimerComplete);
    const hasCompletedRef = useRef(false);
  
    // Update the ref when onTimerComplete changes
    useEffect(() => {
      onTimerCompleteRef.current = onTimerComplete;
    }, [onTimerComplete]);
  
    useEffect(() => {
      console.log(`[${disputeAddress}] Timer restarted: ${initialSeconds}s for phase: ${currentPhase}`);
      
      // Reset completion flag
      hasCompletedRef.current = false;
      
      // Set the new remaining seconds
      setRemainingSeconds(initialSeconds);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // If already at zero, handle immediately
      if (initialSeconds <= 0) {
        console.log(`[${disputeAddress}] Timer already at zero for phase: ${currentPhase}`);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onTimerCompleteRef.current?.();
        }
        return;
      }
  
      // Start the countdown
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newValue = prev - 1;
          
          if (newValue <= 0) {
            console.log(`[${disputeAddress}] Timer reached zero for phase: ${currentPhase}`);
            
            // Clear the timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Call completion handler only once
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              onTimerCompleteRef.current?.();
            }
            
            return 0;
          }
          
          return newValue;
        });
      }, 1000);
  
      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [initialSeconds, disputeAddress, currentPhase]);
  
    // Format the time display
    const formatTime = (seconds: number) => {
      const days = Math.floor(seconds / (60 * 60 * 24));
      const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = seconds % 60;
  
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
  
    return (
      <span className="text-lg font-medium text-zinc-900 dark:text-white">
        {formatTime(remainingSeconds)}
      </span>
    );
  };