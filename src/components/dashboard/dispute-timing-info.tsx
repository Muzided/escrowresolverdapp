// src/components/dashboard/DisputeTimingInfo.tsx
import React, { useEffect, useState } from 'react'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDispute } from '@/Hooks/useDispute';
import { useAppKitAccount } from '@reown/appkit/react';
import { Skeleton } from "@/components/ui/skeleton";

interface DisputeTimingInfoProps {
    adoptedAt: string;
    disputeId: string;
    status: 'active' | 'resolved' | 'expired';
}

const DisputeTimingInfo: React.FC<DisputeTimingInfoProps> = ({
    adoptedAt,
    disputeId,
    status
}) => {
    const { fetchDisputerCoolDown } = useDispute();
    const { address } = useAppKitAccount();
    const [cooldownTime, setCooldownTime] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

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

    const calculateTimeRemaining = (adoptedDate: string) => {
        const adopted = new Date(adoptedDate)
        const now = new Date()
        const deadline = new Date(adopted.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from adoption
        const timeRemaining = deadline.getTime() - now.getTime()

        const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
        const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

        return { days, hours, deadline }
    }

    const formatCooldownTime = (seconds: number) => {
        if (seconds <= 0) return { hours: 0, minutes: 0, isOver: true };
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return { hours, minutes, isOver: false };
    }

    const { days, hours, deadline } = calculateTimeRemaining(adoptedAt)
    const { hours: cooldownHours, minutes: cooldownMinutes, isOver } = formatCooldownTime(cooldownTime);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cooldown Period Card */}
            <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#9C5F2A]" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Cooldown Period</h3>
                </div>
                <div className="space-y-2">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-6 w-[100px]" />
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Resolution Timeframe Card */}
            {/* <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                    {status === 'active' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : status === 'resolved' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="font-semibold text-zinc-900 dark:text-white">0xA1B2C3...0000001</h3>
                </div>
                <div className="space-y-2 mt-1">
                    
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Time remaining to resolve dispute:
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900 dark:text-white">
                            {days}d {hours}h
                        </span>
                        <span className="text-sm text-zinc-500">
                            (Deadline: {deadline.toLocaleString()})
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div
                                className="bg-[#9C5F2A] h-2 rounded-full"
                                style={{
                                    width: `${((7 - days) / 7) * 100}%`
                                }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {7 - days} days passed out of 7 days total
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                    {status === 'active' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : status === 'resolved' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="font-semibold text-zinc-900  dark:text-white">
                        0xA1B2C3...0000001 <span></span></h3>
                </div>
                <div className="space-y-2">
               
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Time remaining to resolve dispute:
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900 dark:text-white">
                            {days}d {hours}h
                        </span>
                        <span className="text-sm text-zinc-500">
                            (Deadline: {deadline.toLocaleString()})
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div
                                className="bg-[#9C5F2A] h-2 rounded-full"
                                style={{
                                    width: `${((7 - days) / 7) * 100}%`
                                }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {7 - days} days passed out of 7 days total
                        </p>
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default DisputeTimingInfo