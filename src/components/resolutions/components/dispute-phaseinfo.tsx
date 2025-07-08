import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface DisputePhaseInfoProps {
  phase: 'initial' | 'grace' | 'extended';
  tooltipText: string;
}

export const DisputePhaseInfo: React.FC<DisputePhaseInfoProps> = ({ phase, tooltipText }) => {
  const getPhaseText = () => {
    switch (phase) {
      case 'initial':
        return "Time remaining to resolve dispute:";
      case 'grace':
        return "Grace period active - Request extension:";
      case 'extended':
        return "Final extension active - Must resolve:";
      default:
        return "";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'initial':
        return "text-blue-600 dark:text-blue-400";
      case 'grace':
        return "text-orange-600 dark:text-orange-400";
      case 'extended':
        return "text-red-600 dark:text-red-400";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className={`text-sm cursor-help font-medium ${getPhaseColor()}`}>
          {getPhaseText()}
        </p>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};