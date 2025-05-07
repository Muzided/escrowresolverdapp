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

type FormattedEscrow = {
  id: string;
  amount: string;
  escrowAddress: string;
  disputed: boolean;
  requested: boolean;
  status: string;
  receiver: string;
  reversal: string;
  createdAt: string;
};
// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}


interface EscrowDetails {
  amount: string;
  deadline: string;
}
type EscrowOverviewProps = {
  limit?: number
}

export function EscrowOverview({ limit }: EscrowOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("creator-escrows")
  const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [escrows, setEscrows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [chatWith, setChatWith] = useState<string>("creator")
  const [openChatBox, setOpenChatBox] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState<any>()
  const [refresh, setRefresh] = useState(false)
  const [openDialog, setOpenDialog] = useState(false);
  const [createdEscrows, setCreatedEscrows] = useState<any[]>([])

  //next-router
  const router = useRouter()



  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }

  const { fetchCreatorEscrows, fetchReceiverEscrows, fetchPaymentRequest, requestPayment, releaseFunds, approvePayment, initaiteDispute, resolveDispute } = useFactory();
  const { fetchEscrowDetails } = useEscrow();
  const { fetchDisputeDetails } = useDispute()
  const { address } = useAppKitAccount();

  useEffect(() => {
    if (!address) return;
    fetchCreatedEscrows(address)
    fetchClaimAbleEscrows(address)

  }, [address, refresh])

  //user created escrows
  const fetchCreatedEscrows = async (userAddress: string) => {
    try {
      const blockchainEscrows = await fetchCreatorEscrows(userAddress)
      console.log("ecrow-created-by-user", blockchainEscrows)
      if (!blockchainEscrows || blockchainEscrows.length === 0) {
        setCreatedEscrows([]);
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch and format data in one step
      const formattedEscrows: FormattedEscrow[] = await Promise.all(
        blockchainEscrows.map(async (escrow: any, index: number) => {
          const escrowRequest = await fetchPaymentRequest(escrow);

          return {
            id: `ESC-${(index + 1).toString().padStart(3, "0")}`,
            amount: `${escrowRequest?.amountRequested} USDT`,
            escrowAddress: escrow,
            disputed: escrowRequest?.isDisputed,
            requested: escrowRequest?.isPayoutRequested,
            status: escrowRequest?.completed
              ? "completed"
              : escrowRequest?.isDisputed
                ? "disputed"
                : "active",
            receiver: userAddress,
            reversal: `0x${Math.random().toString(16).substr(2, 40)}`,
            createdAt: currentDate,
          };
        })
      );
      console.log("formattedEscrows", formattedEscrows)

      setCreatedEscrows(formattedEscrows);
    } catch (error) {
      console.error("Error fetching escrow payment requests", error);
      setCreatedEscrows([]); // Ensure state consistency in case of an error
    }
  };
  //user claimable escrows
  const fetchClaimAbleEscrows = async (userAddress: string) => {
    try {
      const blockchainEscrows = await fetchReceiverEscrows(userAddress);


      if (!blockchainEscrows || blockchainEscrows.length === 0) {
        setEscrows([]);
        return;
      }
      console.log("ecrow-received-by-user", blockchainEscrows)

      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch and format data in one step
      const formattedEscrows: FormattedEscrow[] = await Promise.all(
        blockchainEscrows.map(async (escrow: any, index: number) => {
          const escrowRequest = await fetchPaymentRequest(escrow);


          return {
            id: `ESC-${(index + 1).toString().padStart(3, "0")}`,
            amount: `${escrowRequest?.amountRequested} USDT`,
            disputed: escrowRequest?.isDisputed,
            escrowAddress: escrow,
            requested: escrowRequest?.isPayoutRequested,
            status: escrowRequest?.completed
              ? "completed"
              : escrowRequest?.isDisputed
                ? "disputed"
                : "active",
            receiver: userAddress,
            reversal: `0x${Math.random().toString(16).substr(2, 40)}`,
            createdAt: currentDate,
          };
        })
      );

      setEscrows(formattedEscrows);
    } catch (error) {
      console.error("Error fetching escrow payment requests", error);
      setEscrows([]); // Ensure state consistency in case of an error
    }
  };

  // Filter escrows based on status
  const filteredEscrows =
    statusFilter === "creator-escrows" ? userEscrows : escrows;



  console.log("filteredEscrows", filteredEscrows)



  return (
    <div className="space-y-4">


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
            <SelectItem value="creator-escrows">All Escrows</SelectItem>
            <SelectItem value="claimable-escrows">Active Escrows</SelectItem>
            <SelectItem value="claimable-escrows">Disputed Escrows</SelectItem>
          </SelectContent>
        </Select>
      </div> */}


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
        filteredEscrows={filteredEscrows}
        loadingEscrows={loadingEscrows}
        setOpenChatBox={setOpenChatBox}
        navgateToDetailPage={navgateToDetailPage}
      />
      </div>}

    </div>
  )
}
type Props = {
  filteredEscrows: Escrow[];
  loadingEscrows: { [key: string]: boolean };
  setOpenChatBox: (val: boolean) => void;
  navgateToDetailPage: (id: string) => void;
};
const ActiveDisputeDetails: React.FC<Props> = ({
  filteredEscrows,
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
          {filteredEscrows.length === 0 ? (
            <TableRow
              className="border-zinc-200 hover:bg-zinc-100/50 
            dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                No escrows found.
              </TableCell>
            </TableRow>
          ) : (
            filteredEscrows.slice(0, 2).map((escrow) => (
              <TableRow
                key={escrow.escrowId}
                className="border-zinc-200 hover:bg-zinc-100/50 
              dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <TableCell className="font-medium text-zinc-900 dark:text-white">
                  {escrow.escrowAddress?.slice(0, 8)}...{escrow.escrowAddress?.slice(-7)}
                </TableCell>

                <TableCell>
                  {escrow.receiver}

                </TableCell>

                <TableCell>
                  {escrow.receiver}

                </TableCell>

                <TableCell>
                  {escrow.amount}
                </TableCell>

                <TableCell>
                  {escrow.paymentType}
                </TableCell>
                <TableCell>
                  {escrow.jurisdiction}
                </TableCell>

                <TableCell>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={loadingEscrows[escrow.escrowAddress] || false}
                        className="bg-green-600 cursor-pointer text-white hover:bg-green-700 my-2 w dark:bg-green-600 dark:text-white dark:hover:bg-green-700"

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
                    disabled={loadingEscrows[escrow.escrowAddress] || false}
                    className="bg-blue-600 text-white hover:bg-blue-700 my-2 w dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                    onClick={() => navgateToDetailPage("3f4#fsd4")}
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