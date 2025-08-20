"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MessageSquare, MessagesSquare, MoreHorizontal, User, UserCheck, X } from "lucide-react"


import { Button } from "@/components/ui/button"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useAppKitAccount } from "@reown/appkit/react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"


import { Skeleton } from "../ui/skeleton"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import PageHeading from "../ui/pageheading"
import ChatBox from "../chat/ChatBox"
import DisputeTimingInfo from './dispute-timing-info'
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDisputeRoomListener } from "@/Hooks/useDisputeRoomListener"
import { adoptedDispute, AdoptedDisputeResponse } from "@/types/dispute"
import { getAdoptedDispute } from "@/services/Api/dispute/dispute"
import { ConversationType } from "@/types/chat"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { toast } from "react-toastify"
import { useDispute } from "@/Hooks/useDispute"
import { handleError } from "../../../utils/errorHandler"
import { MileStone } from "@/types/contract"
import { useNavigateTab } from "@/Hooks/useNavigateTab"
import { ResolveDisputeModal } from './ResolveDisputeModal'



// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
}

export function OngoingDisputes() {
  const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [conversationType, setConversationType] = useState<ConversationType>({
    userType: "",
    userWalletAddress: "",
    disputeContractAddress: ""
  });
  const [openChatBox, setOpenChatBox] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  //next-router
  const router = useRouter()
  const { address } = useAppKitAccount();
  const queryClient = useQueryClient();

  const { data: adoptedDispute, isLoading, error } = useQuery<adoptedDispute[]>({
    queryKey: ['my-escrows', address, currentPage, pageSize],
    queryFn: async () => {
      const response = await getAdoptedDispute(currentPage, pageSize, "under_review");
      return response.data.disputes;
    },
    enabled: !!address,
  });

  // Hook to join dispute rooms and listen for reload events
  useDisputeRoomListener(adoptedDispute?.map(d => d.disputeContractAddress) ?? [], { enabled: !!address })

  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }

  const openChat = (conversationId: string | null, userWalletAddress: string, disputeContractAddress: string, conversationType: string) => {
    setConversationType({ userType: conversationType, userWalletAddress: userWalletAddress, disputeContractAddress: disputeContractAddress })
    setConversationId(conversationId)
    setOpenChatBox(true)
  }


  return (
    <div className="space-y-4 ">
      {openChatBox ?
        <ChatBox setOpenChatBox={setOpenChatBox}
          conversationType={conversationType}
          conversationId={conversationId}
          setConversationType={setConversationType}
          setConversationId={setConversationId}
        />
        :
        <div className="space-y-4">
          <PageHeading text="Time Details" />

          {adoptedDispute?.length !== 0 && <DisputeTimingInfo />}


          <PageHeading text="Adopted Disputes" />

          <ActiveDisputeDetails
            adoptedDispute={adoptedDispute || []}
            isLoading={isLoading}
            loadingEscrows={loadingEscrows}
            setOpenChatBox={setOpenChatBox}
            navgateToDetailPage={navgateToDetailPage}
            openChat={openChat}
          />
        </div>}

    </div>
  )
}
type Props = {
  adoptedDispute: adoptedDispute[];
  loadingEscrows: { [key: string]: boolean };
  isLoading: boolean;
  setOpenChatBox: (val: boolean) => void;
  navgateToDetailPage: (id: string) => void;
  openChat: (conversationId: string | null, userWalletAddress: string, disputeContractAddress: string, conversationType: string) => void;
};


const ActiveDisputeDetails: React.FC<Props> = ({
  adoptedDispute,
  loadingEscrows,
  isLoading,
  setOpenChatBox,
  navgateToDetailPage,
  openChat,
}) => {
  const [approveInFavour, setApproveInFavour] = useState(false);
  const [continueNext, setContinueNext] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { resolveDispute } = useDispute();
  const { goToTab } = useNavigateTab()
  const queryClient = useQueryClient();


  const handleResolveDispute = async (disputeId: string, milestoneIndex: number, milestone: adoptedDispute) => {
    try {
      setLoading((prev: any) => ({ ...prev, [disputeId]: true }));
      const winner = approveInFavour ? milestone.escrow.receiver_walletaddress : milestone.escrow.creator_walletaddress;
      const res = await resolveDispute(disputeId, milestoneIndex, approveInFavour, continueNext, winner);
      if (res?.success) {

        await queryClient.invalidateQueries({ queryKey: ['adopted-escrows'] })
        setIsDialogOpen(false)
        goToTab('resolved-disputes')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading((prev: any) => ({ ...prev, [disputeId]: false }));
    }
  }


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
            <TableHead className="text-zinc-500 dark:text-zinc-400">Inbox </TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>
            <TableHead className="text-zinc-500 dark:text-zinc-400">Resolve</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Skeleton loading rows
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : adoptedDispute.length === 0 ? (
            <TableRow
              className="border-zinc-200 hover:bg-zinc-100/50 
            dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <TableCell colSpan={8} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={loadingEscrows[disputedEscrow.escrow.escrow_contract_address] || false}
                        className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                      >
                        <MessageSquare /> <span className="hidden sm:inline">Chat</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2 text-sm sm:text-base"> <MessagesSquare /> Chat With</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
                        <div onClick={() =>
                          openChat(
                            disputedEscrow.creator_conversation_id,
                            disputedEscrow.escrow.creator_walletaddress,
                            disputedEscrow.disputeContractAddress,
                            "creator")
                        } className="w-full p-4 sm:p-6 cursor-pointer flex items-center justify-center gap-2 rounded-lg text-center bg-green-600 text-white hover:bg-green-700 my-1 sm:my-2 text-sm sm:text-base dark:bg-green-600 dark:text-white dark:hover:bg-green-700">
                          <UserCheck />
                          <span className="hidden sm:inline">CREATOR</span>
                          <span className="sm:hidden">Creator</span>
                        </div>
                        <div
                          onClick={() =>
                            openChat(
                              disputedEscrow.receiver_conversation_id,
                              disputedEscrow.escrow.receiver_walletaddress,
                              disputedEscrow.disputeContractAddress,
                              "receiver")}
                          className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg p-4 sm:p-6 text-center bg-green-600 text-white hover:bg-green-700 my-1 sm:my-2 text-sm sm:text-base dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700">
                          <User />
                          <span className="hidden sm:inline">RECEIVER</span>
                          <span className="sm:hidden">Receiver</span>
                        </div>
                        {disputedEscrow.escrow.observer_wallet !== "0x0000000000000000000000000000000000000000" && (
                          <div
                            onClick={() =>
                              openChat(
                                disputedEscrow.observer_conversation_id,
                                disputedEscrow.escrow.observer_wallet,
                                disputedEscrow.disputeContractAddress,
                                "observer")}
                            className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg p-4 sm:p-6 text-center bg-gray-600 text-white hover:bg-green-700 my-1 sm:my-2 text-sm sm:text-base dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700">
                            <User />
                            <span className="hidden sm:inline">OBSERVER</span>
                            <span className="sm:hidden">Observer</span>
                          </div>
                        )}
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
                <TableCell>
                  <ResolveDisputeModal disputedEscrow={disputedEscrow} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}