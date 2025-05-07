// src/components/dashboard/DisputeTimingInfo.tsx
import React from 'react'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

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
    const calculateTimeRemaining = (adoptedDate: string) => {
        const adopted = new Date(adoptedDate)
        const now = new Date()
        const deadline = new Date(adopted.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from adoption
        const timeRemaining = deadline.getTime() - now.getTime()

        const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
        const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

        return { days, hours, deadline }
    }

    const calculateCooldown = () => {
        const now = new Date()
        const lastAdoption = new Date(adoptedAt)
        const cooldownEnd = new Date(lastAdoption.getTime() + 24 * 60 * 60 * 1000) // 24 hours cooldown
        const timeUntilCooldownEnd = cooldownEnd.getTime() - now.getTime()

        const hours = Math.floor(timeUntilCooldownEnd / (60 * 60 * 1000))
        const minutes = Math.floor((timeUntilCooldownEnd % (60 * 60 * 1000)) / (60 * 1000))

        return { hours, minutes, cooldownEnd }
    }

    const { days, hours, deadline } = calculateTimeRemaining(adoptedAt)
    const { hours: cooldownHours, minutes: cooldownMinutes, cooldownEnd } = calculateCooldown()

    return (
        <div className=" grid grid-cols-1 lg:grid-cols-3  gap-4 ">
            {/* Cooldown Period Card */}
            <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Cooldown Period</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Time until next dispute adoption:
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900 dark:text-white">
                            {cooldownHours}h {cooldownMinutes}m
                        </span>
                        <span className="text-sm text-zinc-500">
                            (Ends: {cooldownEnd.toLocaleString()})
                        </span>
                    </div>
                </div>
            </div>

            {/* Resolution Timeframe Card */}
            <div className="bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4">
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
                                className="bg-blue-500 h-2 rounded-full"
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
                                className="bg-blue-500 h-2 rounded-full"
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
        </div>
    )
}

export default DisputeTimingInfo