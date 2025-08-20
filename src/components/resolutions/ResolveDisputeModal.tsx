"use client"

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { adoptedDispute } from '@/types/dispute'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adoptedDisputesResolutionTime } from '@/services/Api/resolver/resolver'
import { useDispute } from '@/Hooks/useDispute'
import { initateDecision } from '@/services/Api/dispute/dispute'
import { RESOLVER_DECISION_COOLDOWN_SECONDS, RESOLVER_FINAL_DISABLE_THRESHOLD_SECONDS } from '@/Web3/web3-config'

interface ResolveDisputeModalProps {
  disputedEscrow: adoptedDispute
}

export const ResolveDisputeModal: React.FC<ResolveDisputeModalProps> = ({ disputedEscrow }) => {
  const queryClient = useQueryClient()
  const { resolveDispute } = useDispute()

  const [open, setOpen] = useState(false)
  const [approveInFavour, setApproveInFavour] = useState<'creator' | 'receiver'>('creator')
  const [continueNext, setContinueNext] = useState<'continue' | 'stop'>('continue')
  const [isInitiating, setIsInitiating] = useState(false)

  const creatorWallet = disputedEscrow.escrow.creator_walletaddress
  const receiverWallet = disputedEscrow.escrow.receiver_walletaddress

  // Fetch remaining time for this dispute
  const { data: resolutionTimes } = useQuery({
    queryKey: ['resolution-times'],
    queryFn:  async () => {
        const response = await adoptedDisputesResolutionTime();
        return response.data;
      },
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000
  })

  const overallRemainingSeconds = useMemo(() => {
 
    const match = resolutionTimes?.disputes?.find((d: any) => d.dispute_contract_address === disputedEscrow.disputeContractAddress)
    console.log("match",match,resolutionTimes,disputedEscrow)
    if (!match) return undefined
    if (match.extended) return Number(match.final_remaining_seconds)
    if (match.grace_period_active) return Number(match.grace_remaining_seconds)
    return Number(match.initial_remaining_seconds)
  }, [resolutionTimes?.disputes, disputedEscrow.disputeContractAddress])

  const decisionInitiatedAt = disputedEscrow.decision_initiated ? new Date(disputedEscrow.decision_initiated).getTime() : null
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  const cooldownRemainingSeconds = useMemo(() => {
    if (!decisionInitiatedAt) return 0
    const target = decisionInitiatedAt + RESOLVER_DECISION_COOLDOWN_SECONDS * 1000
    return Math.max(0, Math.floor((target - now) / 1000))
  }, [decisionInitiatedAt, now])

  const hasInitiatedDecision = Boolean(decisionInitiatedAt)
  const bothVotesNull = disputedEscrow.creator_vote === null && disputedEscrow.receiver_vote === null

  const disableReason = useMemo(() => {
    if (!hasInitiatedDecision && overallRemainingSeconds !== undefined && overallRemainingSeconds < RESOLVER_DECISION_COOLDOWN_SECONDS) {
      return 'Less than 4 hours remaining; cannot resolve now'
    }
    if (hasInitiatedDecision && overallRemainingSeconds !== undefined && overallRemainingSeconds <= RESOLVER_FINAL_DISABLE_THRESHOLD_SECONDS) {
      return 'Less than 5 minutes remaining; cannot resolve now'
    }
    return null
  }, [hasInitiatedDecision, overallRemainingSeconds])

  const isTriggerDisabled = Boolean(disableReason)

  useEffect(() => {
    // Default winner selection
    if (disputedEscrow.decision_in_favor_of === receiverWallet) setApproveInFavour('receiver')
    else setApproveInFavour('creator')
  }, [disputedEscrow.decision_in_favor_of, receiverWallet])

  // Determine locking and defaults after cooldown
  const anyVoteFalse = disputedEscrow.creator_vote === false || disputedEscrow.receiver_vote === false
  const mixedTrueFalse = (disputedEscrow.creator_vote === true && disputedEscrow.receiver_vote === false) || (disputedEscrow.creator_vote === false && disputedEscrow.receiver_vote === true)
  const oneTrueOneNull = (disputedEscrow.creator_vote === true && disputedEscrow.receiver_vote === null) || (disputedEscrow.creator_vote === null && disputedEscrow.receiver_vote === true)

  useEffect(() => {
    if (anyVoteFalse || mixedTrueFalse) {
      setContinueNext('stop')
    }
  }, [anyVoteFalse, mixedTrueFalse])

  const formatSeconds = (total: number) => {
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleInitiateDecision = useCallback(async () => {
    try {
      setIsInitiating(true)
      const inFavorOf = approveInFavour === 'receiver' ? receiverWallet : creatorWallet
      const response = await initateDecision(disputedEscrow.disputeContractAddress, inFavorOf)
      if (response?.status === 201 || response?.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ['my-escrows'] })
        await queryClient.invalidateQueries({ queryKey: ['resolution-times'] })
      }
    } finally {
      setIsInitiating(false)
    }
  }, [approveInFavour, creatorWallet, receiverWallet, disputedEscrow.disputeContractAddress, queryClient])

  const handleResolve = useCallback(async () => {
    const winner = approveInFavour === 'receiver' ? receiverWallet : creatorWallet
    const continueWork = continueNext === 'continue'
    const resolvedInFavorOfReceiver = approveInFavour === 'receiver'
    await resolveDispute(disputedEscrow.disputeContractAddress, disputedEscrow.milestone_index, continueWork, resolvedInFavorOfReceiver, winner)
    await queryClient.invalidateQueries({ queryKey: ['my-escrows'] })
    await queryClient.invalidateQueries({ queryKey: ['resolution-times'] })
    setOpen(false)
  }, [approveInFavour, continueNext, creatorWallet, receiverWallet, disputedEscrow.disputeContractAddress, disputedEscrow.milestone_index, resolveDispute, queryClient])

  const contentInitiate = !hasInitiatedDecision && bothVotesNull
  const contentCooldown = hasInitiatedDecision && cooldownRemainingSeconds > 0
  const contentResolve = hasInitiatedDecision && cooldownRemainingSeconds === 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isTriggerDisabled}
                  className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                >
                  Resolve
                </Button>
              </DialogTrigger>
            </div>
          </TooltipTrigger>
          {disableReason && (
            <TooltipContent>
              <p>{disableReason}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">Resolve Dispute</DialogTitle>
        </DialogHeader>

        {contentInitiate && (
          <div className="flex flex-col gap-6 w-full mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Please record your decision and submit to inform the creator and receiver so they can vote on whether they want to continue the work or not.
            </p>

            <div className="flex items-center justify-between gap-4">
              <Label>Decision in favour of</Label>
              <Select value={approveInFavour} onValueChange={(v: 'creator' | 'receiver') => setApproveInFavour(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="receiver">Receiver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleInitiateDecision} disabled={isInitiating} className="mt-2">
              {isInitiating ? 'Submitting...' : 'Record Decision'}
            </Button>
          </div>
        )}

        {contentCooldown && (
          <div className="flex flex-col gap-4 w-full mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              4 hour cool down active. Creator and Receiver can now record their decisions.
            </p>
            <div className="text-center text-2xl font-semibold">
              {formatSeconds(cooldownRemainingSeconds)}
            </div>
          </div>
        )}

        {contentResolve && (
          <div className="flex flex-col gap-6 w-full mt-4">
            <div className="flex items-center justify-between gap-4">
              <Label>Approve in favour</Label>
              <Select value={approveInFavour} onValueChange={(v: 'creator' | 'receiver') => setApproveInFavour(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receiver">Receiver</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label>Decision</Label>
              <Select
                value={continueNext}
                onValueChange={(v: 'continue' | 'stop') => setContinueNext(v)}
                disabled={anyVoteFalse || mixedTrueFalse}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">Continue Project</SelectItem>
                  <SelectItem value="stop">Stop Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(anyVoteFalse || mixedTrueFalse) && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                A party voted against continuing. Project will be stopped.
              </p>
            )}

            {oneTrueOneNull && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Only one party voted to continue. You may proceed with your decision.
              </p>
            )}

            <Button className="mt-2" onClick={handleResolve}>
              Submit
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


