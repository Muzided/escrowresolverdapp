"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useCallback } from "react"
import { ContractMilestone } from "@/types/contract"
import { getEscrowDetailsResponse } from "@/types/escrow"

const formatDate = (timestamp: string | number | undefined) => {
  if (!timestamp) return "N/A"
  try {
    const date = new Date(Number(timestamp) * 1000)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, "MMM d, yyyy hh:mm a")
  } catch (error) {
    return "Invalid Date"
  }
}

interface EscrowMilestoneTrackerProps {
  escrowDetails: getEscrowDetailsResponse
  escrowOnChainDetails: ContractMilestone[]
  userType: string
}

export function EscrowMilestoneTracker({ escrowDetails, escrowOnChainDetails, userType }: EscrowMilestoneTrackerProps) {
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})

  const isDueDatePassed = useCallback((dueDate: string | number) => {
    const currentDate = Math.floor(Date.now() / 1000);
    return Number(dueDate) < currentDate;
  }, []);

  const toggleMilestone = useCallback((milestoneId: string) => {
    setOpenMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }))
  }, []);

  const getStatusIcon = (status: string, milestone: ContractMilestone, index: number) => {
    // Find the first milestone that was paid (released)
    const firstPaidMilestoneIndex = escrowOnChainDetails.findIndex(m => m.released);
    
    // If any milestone after the first paid milestone is disputed, show disputed icon
    const isAnyMilestoneAfterFirstPaidDisputed = escrowOnChainDetails
      .slice(firstPaidMilestoneIndex + 1)
      .some(m => m.disputedRaised);
    
    if (isAnyMilestoneAfterFirstPaidDisputed && index > firstPaidMilestoneIndex) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if milestone is completed
    if (milestone.requested && milestone.released) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />
    }

    // Check if milestone is in dispute (only if it's after the first paid milestone)
    if (milestone.disputedRaised && index > firstPaidMilestoneIndex) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if milestone is pending (previous milestone is not completed)
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.requested || !previousMilestone.released) {
        return <Clock className="h-6 w-6 text-gray-400" />
      }
    }

    // Check if milestone is active or upcoming based on due dates and previous milestone status
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone
      if (index === 0) {
        return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      }

      // For other milestones, check if previous milestone is released
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (previousMilestone.released) {
        return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      }

      return <Clock className="h-6 w-6 text-gray-400" />
    }

    // Default case (pending)
    return <Clock className="h-6 w-6 text-gray-400" />
  }

  console.log("escrow-details",escrowOnChainDetails)

  const getStatusBadge = (status: string, milestone: ContractMilestone, index: number) => {
    // Find the first milestone that was paid (released)
    const firstPaidMilestoneIndex = escrowOnChainDetails.findIndex(m => m.released);
    
    // If any milestone after the first paid milestone is disputed, show disputed status for those milestones
    const isAnyMilestoneAfterFirstPaidDisputed = escrowOnChainDetails
      .slice(firstPaidMilestoneIndex + 1)
      .some(m => m.disputedRaised);
    
    if (isAnyMilestoneAfterFirstPaidDisputed && index > firstPaidMilestoneIndex) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if milestone is completed (receiver requested and creator released) or claimed by creator
    if ((milestone.requested && milestone.released) || (!milestone.requested && milestone.released)) {
      return <Badge variant="default">Completed</Badge>;
    }

    // Check if milestone is in dispute (only if it's after the first paid milestone)
    if (milestone.disputedRaised && index > firstPaidMilestoneIndex) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if milestone is pending (previous milestone is not completed)
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.requested || !previousMilestone.released) {
        return <Badge variant="secondary">Pending</Badge>;
      }
    }

    // Check if milestone is upcoming or active based on due dates
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone, check if it's active
      if (index === 0) {
        return <Badge>Active</Badge>;
      }

      // For other milestones, check if previous milestone is released
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (previousMilestone.released) {
        return <Badge className="bg-primary dark:text-green-800 text-white">Active</Badge>;
      }

      // If previous milestone is not released, it's upcoming
      return <Badge variant="secondary">Upcoming</Badge>;
    }

    // Default case
    return <Badge variant="secondary">Pending</Badge>;
  }


  const getEscrowStatusBadge = (status: string) => {
    // Find the first milestone that was paid (released)
    const firstPaidMilestoneIndex = escrowOnChainDetails.findIndex(m => m.released);
    
    // If any milestone after the first paid milestone is disputed, show disputed status
    const isAnyMilestoneAfterFirstPaidDisputed = escrowOnChainDetails
      .slice(firstPaidMilestoneIndex + 1)
      .some(m => m.disputedRaised);
    
    if (isAnyMilestoneAfterFirstPaidDisputed) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // For full escrow, check if the single milestone is completed
    if ((escrowOnChainDetails[0]?.requested && escrowOnChainDetails[0]?.released) ||
      (!escrowOnChainDetails[0]?.requested && escrowOnChainDetails[0]?.released)) {
      return <Badge variant="default">Completed</Badge>;
    }

    // If due date hasn't passed, it's active
    if (!isDueDatePassed(escrowOnChainDetails[0]?.dueDate)) {
      return <Badge className="">Active</Badge>;
    }

    // Default case
    return <Badge variant="secondary">Pending</Badge>;
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#BB7333]/20" />
        {escrowDetails?.escrow?.payment_type === "full" ? (
          <div key={escrowDetails?.escrow?.__v} className="relative pl-12 pb-8">
            <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
              {getStatusIcon(escrowDetails?.escrow?.status, escrowOnChainDetails[0], 0)}
            </div>
            <Collapsible
              open={openMilestones[escrowDetails?.escrow?.__v]}
              onOpenChange={() => toggleMilestone(escrowDetails.escrow.__v?.toString())}
            >
              <Card className="relative">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{"Escrow"}</CardTitle>
                        {getEscrowStatusBadge(escrowDetails?.escrow?.status)}
                      </div>
                      {openMilestones['1'] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium">{escrowOnChainDetails[0]?.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due Date:</span>
                          <span className="font-medium">
                            {formatDate(escrowOnChainDetails[0]?.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        ) : (
          escrowOnChainDetails.map((milestone: ContractMilestone, index: number) => (
            <div key={milestone.id} className="relative pl-12 pb-8">
              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
                {getStatusIcon(escrowDetails?.milestones[index].status, milestone, index)}
              </div>
              <Collapsible
                open={openMilestones[milestone.id]}
                onOpenChange={() => toggleMilestone(milestone.id)}
              >
                <Card className="relative">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {escrowDetails?.milestones[index].description ?
                              escrowDetails?.milestones[index].description :
                              `Milestone ${index + 1}`}
                          </CardTitle>
                          {getStatusBadge(escrowDetails?.milestones[index].status, milestone, index)}
                        </div>
                        {openMilestones[milestone.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-medium">{milestone.amount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Due Date:</span>
                            <span className="font-medium">
                              {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 