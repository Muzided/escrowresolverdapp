"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MoreHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFactory } from "@/Hooks/useFactory"
import { useAppKitAccount } from "@reown/appkit/react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Switch } from "@/components/ui/switch"
import { useEscrow } from "@/Hooks/useEscrow"
import { useDispute } from "@/Hooks/useDispute"
import { Skeleton } from "../ui/skeleton"
import { disputesDemoList } from "../../../public/Data/Ecsrows"
import { getStatusStyles } from "../../../utils/helper"
import { useRouter } from "next/navigation"
import PageHeading from "../ui/pageheading"
import { Dispute, DisputeResponse } from "@/types/dispute"
import { getActiveDisputes } from "@/services/Api/dispute/dispute"
import { handleError } from "../../../utils/errorHandler"

// Mock data for escrow transactions



export function DisputeResolution() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState<string>("")
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [adoptDisputeLoading, setAdoptDisputeLoading] = useState<{ [key: string]: boolean }>({})
  const { address } = useAppKitAccount();
  const { fetchDisputeReason, adoptDispute } = useDispute();
  const queryClient = useQueryClient();
  const { data: disputedEscrows, isLoading, error } = useQuery<Dispute[]>({
    queryKey: ['disputed-escrows', address, currentPage, pageSize],
    queryFn: async () => {
      const response = await getActiveDisputes(currentPage, pageSize);
      return response.data.disputes;
    },
    enabled: !!address,
  });
  //next-router
  const router = useRouter()
  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }



  const handleViewDetails = async (disputeAddress: string, disputeType: string, disputeId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [disputeAddress]: true }))
      let milestoneIndex: string;
      disputeType === "milestone" ? milestoneIndex = disputeId : milestoneIndex = '0'
      const reason = await fetchDisputeReason(disputeAddress, milestoneIndex)
      setDisputeReason(reason || "No dispute reason found")
      setDisputeModalOpen(true)
    } catch (error) {
      console.error("Error fetching dispute reason:", error)
      handleError(error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [disputeAddress]: false }))
    }
  }

  const handleAdoptDispute = async (disputeAddress: string, milestoneIndex: number) => {
    try {
      setAdoptDisputeLoading(prev => ({ ...prev, [disputeAddress]: true }))
      const response = await adoptDispute(disputeAddress, milestoneIndex)
      // If we get a response, it means the adoption was successful
      if (response.success) {
        // Invalidate and refetch the disputed escrows query
        await queryClient.invalidateQueries({ queryKey: ['disputed-escrows'] })
      }
    } catch (error) {
      console.error("Error adopting dispute:", error)
      handleError(error)
    } finally {
      setAdoptDisputeLoading(prev => ({ ...prev, [disputeAddress]: false }))
    }
  }




  console.log("disputed-escrows", disputedEscrows)


  return (
    <div className="space-y-4">
      <PageHeading text="Available Disputes" />
      {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
          variant="outline"
          className="flex items-center gap-2 border-zinc-200 bg-white shadow-sm text-zinc-700 
            hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md transition-all duration-200
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
            dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-[180px] border-zinc-200 bg-white text-zinc-900 
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent
            className="border-zinc-200 bg-white text-zinc-900 
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <SelectItem value="creator-escrows">All Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Active Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Pedning Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Resolved Disputes</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      <Tabs defaultValue="table" className="w-full">
        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                <TableRow
                  className="border-zinc-200 hover:bg-zinc-100/50 
                  dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Escrow Address</TableHead>
                  {/* <TableHead className="text-zinc-500 dark:text-zinc-400">Reason</TableHead> */}
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Amount</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Date</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {disputedEscrows?.length === 0 ? (
                  <TableRow
                    className="border-zinc-200 hover:bg-zinc-100/50 
                    dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                      No escrows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  disputedEscrows?.map((escrow) => (
                    <TableRow
                      key={escrow.dispute_contract_address}
                      className="border-zinc-200 hover:bg-zinc-100/50 
                      dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-white">
                        {escrow.dispute_contract_address?.slice(0, 8)}...{escrow.dispute_contract_address?.slice(-7)}
                      </TableCell>
                      <TableCell>
                        {escrow.escrowDetails.escrow_contract_address?.slice(0, 8)}...{escrow.escrowDetails.escrow_contract_address?.slice(-7)} </TableCell>
                      {/* <TableCell>
                        {escrow.reason.slice(0, 12)}...
                          <Dialog>
                      <DialogTrigger asChild>
                        <button className="ml-1 text-[#9C5F2A] hover:text-[#9C5F2A] dark:text-[#9C5F2A] dark:hover:text-[#9C5F2A]">
                          Read More
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Dispute Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            {escrow.reason}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                        </TableCell> */}
                      <TableCell>
                        {escrow.type}
                      </TableCell>
                      <TableCell>
                        {escrow.escrowDetails.amount}
                      </TableCell>
                      <TableCell>
                        {escrow.createdAt}
                      </TableCell>
                      {/* viewEscrow details */}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                          onClick={() => handleViewDetails(escrow.dispute_contract_address, escrow.type, escrow.milestone_id)}
                          disabled={loadingStates[escrow.dispute_contract_address]}
                        >
                          {loadingStates[escrow.dispute_contract_address] ? "Loading..." : "View Details"}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                          onClick={() => handleAdoptDispute(escrow.dispute_contract_address, escrow.milestone_index)}
                          disabled={adoptDisputeLoading[escrow.dispute_contract_address]}
                        >
                          Adopt Dispute
                        </Button>
                      </div>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

      </Tabs>
      <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{disputeReason}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

