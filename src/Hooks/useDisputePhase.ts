import { useMemo } from 'react';
import { AdoptedDisputeStates } from '@/types/resolver';

export const useDisputePhase = (dispute: AdoptedDisputeStates['disputes'][0]) => {
  return useMemo(() => {
    let phase: 'initial' | 'grace' | 'extended' = 'initial';
    let countdownSeconds = dispute.initial_remaining_seconds;
    let totalSeconds = 5 * 24 * 60 * 60; // 5 days in seconds
    let tooltipText = "Initial dispute window";
    let showButton = false;

    console.log(`Dispute ${dispute.dispute_contract_address} state:`, {
      initial_remaining_seconds: dispute.initial_remaining_seconds,
      grace_period_active: dispute.grace_period_active,
      grace_remaining_seconds: dispute.grace_remaining_seconds,
      extended: dispute.extended,
      final_remaining_seconds: dispute.final_remaining_seconds
    });

    // Determine current phase based on API response
    if (dispute.extended) {
      // Final phase - extended time
      phase = 'extended';
      countdownSeconds = Number(dispute.final_remaining_seconds);
      tooltipText = "Final extension – dispute closes after this";
      showButton = false;
    } else if (dispute.grace_period_active) {
      // Grace period - can request extension
      phase = 'grace';
      countdownSeconds = Number(dispute.grace_remaining_seconds);
      tooltipText = "Grace period – last chance to extend";
      showButton = true;
    } else {
      // Initial phase
      phase = 'initial';
      countdownSeconds = Number(dispute.initial_remaining_seconds);
      tooltipText = "Initial dispute window";
      showButton = false;
    }

    const progress = Math.min(Math.max(((totalSeconds - countdownSeconds) / totalSeconds) * 100, 0), 100);
    
    console.log(`Phase determined: ${phase}, countdown: ${countdownSeconds}, showButton: ${showButton}`);
    
    return {
      phase,
      countdownSeconds,
      progress,
      tooltipText,
      showButton
    };
  }, [dispute]);
};