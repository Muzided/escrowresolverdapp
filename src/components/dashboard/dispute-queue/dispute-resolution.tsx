"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MoreHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react"

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
import { Skeleton } from "../../ui/skeleton"
import { disputesDemoList } from "../../../../public/Data/Ecsrows"
import { getStatusStyles } from "../../../../utils/helper"
import { useRouter } from "next/navigation"
import PageHeading from "../../ui/pageheading"
import { Dispute, DisputeResponse } from "@/types/dispute"
import { getActiveDisputes } from "@/services/Api/dispute/dispute"
import { handleError } from "../../../../utils/errorHandler"

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
  const { data: disputedEscrows, isLoading, error } = useQuery<DisputeResponse>({
    queryKey: ['disputed-escrows', address, currentPage, pageSize],
    queryFn: async () => {
      const response = await getActiveDisputes(currentPage, pageSize);
      return response.data;
    },
    enabled: !!address,
  });
  //next-router
  const router = useRouter()
  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }



  const handleViewDetails = async (disputeAddress: string, disputeType: string, disputeId: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, [disputeAddress]: true }))
      
      const reason = await fetchDisputeReason(disputeAddress, disputeId)
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


  const renderPagination = () => {
    if (!disputedEscrows?.pagination) return null;
    const { total, page, totalPages } = disputedEscrows.pagination;

    return (
      <div className="flex items-center justify-between px-2 py-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Showing</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {(page - 1) * pageSize + 1}
          </span>
          <span>to</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {Math.min(page * pageSize, total)}
          </span>
          <span>of</span>
          <span className="font-medium text-zinc-900 dark:text-white">{total}</span>
          <span>results</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page - 1)}
            disabled={page === 1}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={pageNum === page 
                  ? "bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                }
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page + 1)}
            disabled={page === totalPages}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  console.log("disputed-escrows", disputedEscrows)


  return (
    <div className="space-y-4">
      <PageHeading text="Available Disputes" />
     

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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : disputedEscrows?.disputes.length === 0 ? (
                  <TableRow
                    className="border-zinc-200 hover:bg-zinc-100/50 
                    dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                      No escrows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  disputedEscrows?.disputes?.map((escrow) => (
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
                          onClick={() => handleViewDetails(escrow.dispute_contract_address, escrow.type, escrow.milestone_index)}
                          disabled={loadingStates[escrow.dispute_contract_address]}
                        >
                          {loadingStates[escrow.dispute_contract_address] ? "Loading..." : "View Reason"}
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
          {/* Pagination Controls */}
          {renderPagination()}
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

