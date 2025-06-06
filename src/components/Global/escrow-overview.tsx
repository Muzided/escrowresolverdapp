"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MessageSquare, MessagesSquare, MoreHorizontal, User, UserCheck, X } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFactory } from "@/Hooks/useFactory"
import { useAppKitAccount } from "@reown/appkit/react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

import { Switch } from "@/components/ui/switch"
import { useEscrow } from "@/Hooks/useEscrow"
import { useDispute } from "@/Hooks/useDispute"
import { Skeleton } from "../ui/skeleton"
import { userEscrows, Escrow } from "../../../public/Data/Ecsrows"
import { getStatusStyles } from "../../../utils/helper"
import { useRouter } from "next/navigation"
import PageHeading from "../ui/pageheading"
import ChatBox from "../dashboard/ChatBox"
import DisputeTimingInfo from '@/components/dashboard/dispute-timing-info'
import { useQuery } from "@tanstack/react-query"
import { adoptedDispute, AdoptedDisputeResponse } from "@/types/dispute"
import { getAdoptedDispute } from "@/services/Api/dispute/dispute"


// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
}


type EscrowOverviewProps = {
  limit?: number
}

export function EscrowOverview({ limit }: EscrowOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("creator-escrows")
  const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [escrows, setEscrows] = useState<any[]>([])
  const [chatWith, setChatWith] = useState<string>("creator")
  const [openChatBox, setOpenChatBox] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  //next-router
  const router = useRouter()
  const { address } = useAppKitAccount();

  const { data: adoptedDispute, isLoading, error } = useQuery<adoptedDispute[]>({
    queryKey: ['adopted-escrows', address, currentPage, pageSize],
    queryFn: async () => {
      const response = await getAdoptedDispute(currentPage, pageSize);
      return response.data.disputes;
    },
    enabled: !!address,
  });

  


  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }


  return (
    <div className="space-y-4">
      {openChatBox ?
        <ChatBox setOpenChatBox={setOpenChatBox} />
        :
        <div className="space-y-4">
          <PageHeading text="Time Details" />
          <DisputeTimingInfo
            adoptedAt={"2025-06-29T12:00:00Z"}
            disputeId={"sssde"}
            status={'active'}
          />
          <PageHeading text="Adopted Disputes" />

          <ActiveDisputeDetails
            adoptedDispute={adoptedDispute || []}
            loadingEscrows={loadingEscrows}
            setOpenChatBox={setOpenChatBox}
            navgateToDetailPage={navgateToDetailPage}
          />
        </div>}

    </div>
  )
}
type Props = {
  adoptedDispute: adoptedDispute[];
  loadingEscrows: { [key: string]: boolean };
  setOpenChatBox: (val: boolean) => void;
  navgateToDetailPage: (id: string) => void;
};
const ActiveDisputeDetails: React.FC<Props> = ({
  adoptedDispute,
  loadingEscrows,
  setOpenChatBox,
  navgateToDetailPage,
}) => {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
          <TableRow
            className="border-zinc-200 hover:bg-zinc-100/50 
          dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          >
            <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute Address</TableHead>


            <TableHead className="text-zinc-500 dark:text-zinc-400">Creator</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Receiver</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Amount</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute Type</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Jurisdiction</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Inbox </TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {adoptedDispute.length === 0 ? (
            <TableRow
              className="border-zinc-200 hover:bg-zinc-100/50 
            dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                No escrows found.
              </TableCell>
            </TableRow>
          ) : (
            adoptedDispute.map((disputedEscrow) => (
              <TableRow
                key={disputedEscrow.dispute_id}
                className="border-zinc-200 hover:bg-zinc-100/50 
              dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <TableCell className="font-medium text-zinc-900 dark:text-white">
                  {formatAddress(disputedEscrow.disputeContractAddress)}
                </TableCell>

                <TableCell>
                  {formatAddress(disputedEscrow.escrow.creator_walletaddress)}

                </TableCell>

                <TableCell>
                  {formatAddress(disputedEscrow.escrow.receiver_walletaddress)}

                </TableCell>

                <TableCell>
                  {disputedEscrow.escrow.amount}
                </TableCell>

                <TableCell>
                  {disputedEscrow.escrow.payment_type}
                </TableCell>
                <TableCell>
                  {disputedEscrow.escrow.jurisdiction_tag}
                </TableCell>

                <TableCell>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={loadingEscrows[disputedEscrow.escrow.escrow_contract_address] || false}
                        className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"

                      >
                        <MessageSquare /> Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2"> <MessagesSquare /> Chat With</DialogTitle>
                      </DialogHeader>
                      <div className=" flex gap-2  w-full  mt-4">
                        <div onClick={() => setOpenChatBox(true)} className="w-full p-6 cursor-pointer flex items-center justify-center gap-2 rounded-lg text-center bg-green-600 text-white hover:bg-green-700 my-2  dark:bg-green-600 dark:text-white dark:hover:bg-green-700">
                          <UserCheck />
                          CREATOR
                        </div>
                        <div
                          onClick={() => setOpenChatBox(true)}
                          className=" w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg p-6 text-center bg-green-600 text-white hover:bg-green-700 my-2  dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700">
                          <User />
                          RECEIVER
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>


                </TableCell>

                {/* viewEscrow details */}
                <TableCell>

                  <Button
                    size="sm"
                    disabled={loadingEscrows[disputedEscrow.escrow.escrow_contract_address] || false}
                    className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                    onClick={() => navgateToDetailPage(disputedEscrow.escrow.escrow_contract_address)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}