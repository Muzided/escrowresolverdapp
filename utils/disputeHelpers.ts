import { DisputePhase } from '@/types/dispute';

export const getPhaseDisplayText = (phase: DisputePhase): string => {
  const phaseTexts = {
    initial: "Time remaining to resolve dispute:",
    grace: "Grace period active:",
    extended: "Final extension active:"
  };
  
  return phaseTexts[phase];
};

export const getPhaseTooltipText = (phase: DisputePhase): string => {
  const tooltipTexts = {
    initial: "Initial dispute window",
    grace: "Grace period – last chance to extend",
    extended: "Final extension – dispute closes after this"
  };
  
  return tooltipTexts[phase];
};

export const formatTimeRemaining = (seconds: number): string => {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = seconds % 60;
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

export const calculateProgress = (totalSeconds: number, remainingSeconds: number): number => {
  return Math.min(Math.max(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 0), 100);
};