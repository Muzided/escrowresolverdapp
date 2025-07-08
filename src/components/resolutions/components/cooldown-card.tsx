import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { formatCooldownTime } from '../../../../utils/helper';
import { Card } from './card';
import { useFactory } from '@/Hooks/useFactory';

interface CooldownCardProps {
    address: string | undefined;
    fetchDisputerCoolDown: (address: string) => Promise<number>;
    noOfAdoptedDispute: number
}

export const CooldownCard: React.FC<CooldownCardProps> = ({
    address,
    fetchDisputerCoolDown,
    noOfAdoptedDispute
}) => {
    const [cooldownTime, setCooldownTime] = useState<number>(0);
    const [maxAdoptionLimit, setMaxAdoptionLimit] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchMaxAdoptionLimit } = useFactory();

    const fetchCooldown = useCallback(async () => {
        if (!address) return;

        try {
            setIsLoading(true);
            const time = await fetchDisputerCoolDown(address);
            const limit = await fetchMaxAdoptionLimit();
            setMaxAdoptionLimit(Number(limit));
            setCooldownTime(time);
        } catch (error) {
            console.error("Error fetching cooldown:", error);
        } finally {
            setIsLoading(false);
        }
    }, [address, fetchDisputerCoolDown, fetchMaxAdoptionLimit]);

    useEffect(() => {
        fetchCooldown();
        const interval = setInterval(fetchCooldown, 60000);
        return () => clearInterval(interval);
    }, [fetchCooldown]);

    const { hours: cooldownHours, minutes: cooldownMinutes, isOver } = formatCooldownTime(cooldownTime);
    
    // Check if user has reached the maximum adoption limit
    const hasReachedMaxLimit = noOfAdoptedDispute >= maxAdoptionLimit;
    
    // Determine the message to show
    const getStatusMessage = () => {
        if (!isOver) {
            return "Time until next dispute adoption:";
        }
        
        if (hasReachedMaxLimit) {
            return "Maximum adoption limit reached. Please resolve one of your current disputes before adopting a new one.";
        }
        
        return "You can now adopt a new dispute";
    };

    if (isLoading) {
        return (
            <div className="w-full h-32 flex items-center justify-center">
                <div className="animate-pulse w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#9C5F2A]" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Cooldown Period</h3>
            </div>
            <div className="space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getStatusMessage()}
                </p>
                {!isOver && (
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900 dark:text-white">
                            {cooldownHours}h {cooldownMinutes}m
                        </span>
                    </div>
                )}
                {isOver && hasReachedMaxLimit && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                            Adopted disputes: {noOfAdoptedDispute}/{maxAdoptionLimit}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};