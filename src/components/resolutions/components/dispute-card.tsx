// src/components/dashboard/components/DisputeCard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AdoptedDisputeStates } from '@/types/resolver';
import { formatAddress } from '../../../../utils/helper';
import { DisputePhaseInfo } from './dispute-phaseinfo';
import { RemainingTimeComponent } from './remaning-time';
import { DisputeProgressBar } from './dispute-progressbar';
import { ExtensionButton } from './extension-button';
import { useDisputePhase } from '@/Hooks/useDisputePhase';
import { Card } from './card';

interface DisputeCardProps {
    dispute: AdoptedDisputeStates['disputes'][0];

    isExtending: boolean;
    onExtend: () => void;
    onPhaseComplete: () => void;
}

export const DisputeCard: React.FC<DisputeCardProps> = ({
    dispute,
    isExtending,
    onExtend,
    onPhaseComplete
}) => {
    const { phase, countdownSeconds, progress, tooltipText, showButton } = useDisputePhase(dispute);
    const [isRefetching, setIsRefetching] = useState(false);
    const queryClient = useQueryClient();
    const handleTimerComplete = useCallback(async () => {
        console.log(`Timer completed for dispute: ${dispute.dispute_contract_address}, phase: ${phase}`);
        setIsRefetching(true);

        // Wait a bit to ensure the timer is fully stopped
        await new Promise(resolve => setTimeout(resolve, 100));

        // Trigger the API refetch
        await onPhaseComplete();

        // Wait for the refetch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsRefetching(false);
    }, [onPhaseComplete, dispute.dispute_contract_address, phase]);

    // Create a unique key that changes when we get new data from API
    const timerKey = `${dispute.dispute_contract_address}-${phase}-${countdownSeconds}-${Date.now()}`;

    // Force a new timer key when refetching is complete
    useEffect(() => {
        if (!isRefetching) {
            refetchMyAdoptedDisputes()
            // This will force the timer to restart with new values
            console.log(`New timer data for ${dispute.dispute_contract_address}:`, {
                phase,
                countdownSeconds,
                isRefetching
            });
        }
    }, [isRefetching, phase, countdownSeconds, dispute.dispute_contract_address]);

    const refetchMyAdoptedDisputes = async () => {

        await queryClient.invalidateQueries({ queryKey: ['my-escrows'] });
    };
    return (
        <Card>
            <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {formatAddress(dispute.dispute_contract_address)}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {phase}
                </span>
            </div>

            <div className="space-y-2 mt-1">
                <DisputePhaseInfo phase={phase} tooltipText={tooltipText} />

                <div className="flex items-center gap-2">
                    {isRefetching ? (
                        <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                            Updating...
                        </span>
                    ) : (
                        <RemainingTimeComponent
                            key={timerKey} // This will force restart when data changes
                            initialSeconds={Number(countdownSeconds)}
                            onTimerComplete={handleTimerComplete}
                            disputeAddress={dispute.dispute_contract_address}
                            currentPhase={phase}
                        />
                    )}
                </div>

                <DisputeProgressBar progress={progress} />

                {showButton && (
                    <ExtensionButton
                        isExtending={isExtending}
                        onExtend={onExtend}
                    />
                )}
            </div>
        </Card>
    );
};
