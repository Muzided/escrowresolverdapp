// src/components/dashboard/DisputeTimingInfo.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDispute } from '@/Hooks/useDispute';
import { useAppKitAccount } from '@reown/appkit/react';
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatCooldownTime } from '../../../utils/helper';
import { adoptedDisputesResolutionTime, requestExtension } from '@/services/Api/resolver/resolver';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdoptedDisputeStates } from '@/types/resolver';

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface DisputeTimingInfoProps {
  adoptedAt: string;
  disputeId: string;
  status: 'active' | 'resolved' | 'expired';
}

// Countdown component for remaining time
type RemainingTimeComponentProps = {
  initialSeconds: number;
  onTimerComplete?: () => void;
};

const RemainingTimeComponent: React.FC<RemainingTimeComponentProps> = ({ initialSeconds, onTimerComplete }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
    if (initialSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer completed, trigger callback
          if (onTimerComplete) {
            onTimerComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds, onTimerComplete]);

  const days = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
  const seconds = remainingSeconds % 60;

  return (
    <span className="text-lg font-medium text-zinc-900 dark:text-white">
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
};

const DisputeTimingInfo = () => {
  const { fetchDisputerCoolDown } = useDispute();
  const { address } = useAppKitAccount();
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [extendingTime, setExtendingTime] = useState<{ [address: string]: boolean }>({});
  const [extendedLocals, setExtendedLocals] = useState<{ [address: string]: boolean }>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address) return;
    const fetchCooldown = async () => {
      try {
        setIsLoading(true);
        const time = await fetchDisputerCoolDown(address);
        setCooldownTime(time);
      } catch (error) {
        console.error("Error fetching cooldown:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCooldown();
    // Set up an interval to update the cooldown time every minute
    const interval = setInterval(fetchCooldown, 60000);
    return () => clearInterval(interval);
  }, [address, fetchDisputerCoolDown]);

  const { data: resolutionTimes, isLoading: loading, error } = useQuery<AdoptedDisputeStates>({
    queryKey: ['resolution-times'],
    queryFn: async () => {
      console.log("Fetching resolution times...");
      const response = await adoptedDisputesResolutionTime();
      console.log("Resolution times response:", response.data);
      return response.data;
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Debug logging to identify the issue
  useEffect(() => {
    console.log("Component re-rendered with:", {
      resolutionTimes,
      loading,
      error,
      address,
      dataLength: resolutionTimes?.disputes?.length
    });
  }, [resolutionTimes, loading, error, address]);

  console.log("resolutionTimes", resolutionTimes);

  const { hours: cooldownHours, minutes: cooldownMinutes, isOver } = formatCooldownTime(cooldownTime);

  const handleTimerComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['resolution-times'] });
  }, [queryClient]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Cooldown Period Card */}
      <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-[#9C5F2A]" />
          <h3 className="font-semibold text-zinc-900 dark:text-white">Cooldown Period</h3>
        </div>
        <div className="space-y-2">

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {isOver ? "You can now adopt a new dispute" : "Time until next dispute adoption:"}
          </p>
          {!isOver && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-zinc-900 dark:text-white">
                {cooldownHours}h {cooldownMinutes}m
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Resolution Timeframe Card */}
      {resolutionTimes?.disputes.map((times, index) => {
        // Use local extended state if available, otherwise from API
        const extendedLocal = extendedLocals[times.dispute_contract_address] ?? times.extended;
        let phase = "initial";
        let countdownSeconds = times.initial_remaining_seconds;
        let totalSeconds = 5 * 24 * 60 * 60;
        let tooltipText = "Initial dispute window";
        let showButton = false;
        if (times.grace_period_active && !extendedLocal) {
          phase = "grace";
          countdownSeconds = Number(times.grace_remaining_seconds);
          tooltipText = "Grace period – last chance to extend";
          showButton = true;
        } else if (extendedLocal) {
          phase = "extended";
          countdownSeconds = Number(times.final_remaining_seconds);
          tooltipText = "Final extension – dispute closes after this";
          showButton = false;
        }
        const progress = ((totalSeconds - countdownSeconds) / totalSeconds) * 100;
        const status = countdownSeconds > 0 ? "active" : "expired";

        const handleExtend = async() => {
          try {
            setExtendingTime(prev => ({ ...prev, [times.dispute_contract_address]: true }));
            await requestExtension(times.dispute_contract_address) 
            setExtendedLocals(prev => ({ ...prev, [times.dispute_contract_address]: true }));
            toast.success("Extension requested successfully!");
          } catch (error) {
            console.log("error while requesting additional time",error)
            toast.error("Failed to request extension. Please try again.");
          }finally{
            setExtendingTime(prev => ({ ...prev, [times.dispute_contract_address]: false }));
          }
        };

        return (
          <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4" key={times.dispute_contract_address}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {formatAddress(times.dispute_contract_address)}
              </h3>
            </div>
            <div className="space-y-2 mt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 cursor-help">
                    {phase === "initial" && "Time remaining to resolve dispute:"}
                    {phase === "grace" && "Grace period active:"}
                    {phase === "extended" && "Final extension active:"}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-2">
                <RemainingTimeComponent 
                  initialSeconds={Number(countdownSeconds)} 
                  onTimerComplete={handleTimerComplete}
                />
              </div>
              <div className="mt-2">
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-[#9C5F2A] h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {showButton && (
                <Button
                  className="mt-2"
                  disabled={extendedLocal || extendingTime[times.dispute_contract_address]}
                  onClick={handleExtend}
                >
                  {extendingTime[times.dispute_contract_address] ? "Requesting..." : "Request Additional Time"}
                </Button>
              )}
            </div>
          </div>
        );
      })}


    </div>
  )
}

export default DisputeTimingInfo