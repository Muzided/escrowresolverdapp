"use-client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, DollarSign, Hash, Calendar, User, Users, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdoptedDispute } from "@/services/Api/dispute/dispute";
import { getDisputedResolutionHistory } from "@/services/Api/resolver/resolver";
import { adoptedDispute, DisputeResolutionResponse } from "@/types/dispute";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";

export function ResolvedDisputes() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasData, setHasData] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [selectedResolution, setSelectedResolution] = useState<DisputeResolutionResponse | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  
  const { address } = useAppKitAccount();

  const { data: adoptedDispute, isLoading, error, refetch } = useQuery<adoptedDispute[]>({
    queryKey: ['resolved-disputes', address, currentPage, pageSize],
    queryFn: async () => {
      const response = await getAdoptedDispute(currentPage, pageSize, "resolved");
      const disputes = response.data.disputes;
      setHasData(disputes.length > 0);
      return disputes;
    },
    enabled: !!address,
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  const handleViewResolutionDetails = async (disputeContractAddress: string,milestoneIndex:number) => {
    try {
      setLoadingStates(prev => ({ ...prev, [disputeContractAddress]: true }));
      
      const response = await getDisputedResolutionHistory(disputeContractAddress,milestoneIndex);
      setSelectedResolution(response.data);
      setIsResolutionModalOpen(true);
      
    } catch (error) {
      console.error("Error fetching resolution details:", error);
      
    } finally {
      setLoadingStates(prev => ({ ...prev, [disputeContractAddress]: false }));
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEtherscanUrl = (address: string, type: 'address' | 'tx' = 'address') => {
    // You can change this to your preferred network (mainnet, testnet, etc.)
    const baseUrl = 'https://etherscan.io';
    return type === 'address' ? `${baseUrl}/address/${address}` : `${baseUrl}/tx/${address}`;
  };

  const handleEtherscanClick = (address: string, type: 'address' | 'tx' = 'address') => {
    const url = getEtherscanUrl(address, type);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getResolutionStatusIcon = (resolution: DisputeResolutionResponse) => {
    const { continue_work, resolved_in_favor_of_walletaddress, escrow_creator_walletaddress } = resolution.resolution;
    
    if (continue_work) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getResolutionStatusText = (resolution: DisputeResolutionResponse) => {
    const { continue_work, resolved_in_favor_of_walletaddress, escrow_creator_walletaddress } = resolution.resolution;
    
    if (continue_work) {
      return "Project Continued";
    } else {
      return "Project Stopped";
    }
  };

  const getWinnerText = (resolution: DisputeResolutionResponse) => {
    const { resolved_in_favor_of_walletaddress, escrow_creator_walletaddress, escrow_receiver_walletaddress } = resolution.resolution;
    
    if (resolved_in_favor_of_walletaddress.toLowerCase() === escrow_creator_walletaddress.toLowerCase()) {
      return "Creator";
    } else if (resolved_in_favor_of_walletaddress.toLowerCase() === escrow_receiver_walletaddress.toLowerCase()) {
      return "Receiver";
    } else {
      return "Unknown";
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading resolved disputes</p>
      </div>
    );
  }
console.log("adoptedDispute", adoptedDispute)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Resolved Disputes</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resolution History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </div>
              ))}
            </div>
          ) : adoptedDispute && adoptedDispute.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute Address</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adoptedDispute.map((dispute) => (
                      <TableRow key={dispute.dispute_id}>
                        <TableCell className="font-medium">
                          {formatAddress(dispute.disputeContractAddress)}
                        </TableCell>
                        <TableCell>{formatAddress(dispute.escrow.creator_walletaddress)}</TableCell>
                        <TableCell>{formatAddress(dispute.escrow.receiver_walletaddress)}</TableCell>
                        <TableCell>{dispute.escrow.amount} USDT</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Resolved
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                            onClick={() => handleViewResolutionDetails(dispute.disputeContractAddress,dispute.milestone_index)}
                            disabled={loadingStates[dispute.disputeContractAddress]}
                          >
                            {loadingStates[dispute.disputeContractAddress] ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Loading...
                              </div>
                            ) : (
                              "View Details"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Items per page:
                  </span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-16 sm:w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Page {currentPage}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasData || adoptedDispute?.length < pageSize || isLoading}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500 dark:text-zinc-400">No resolved disputes found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Details Modal */}
      <Dialog open={isResolutionModalOpen} onOpenChange={setIsResolutionModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              Resolution Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedResolution && (
            <div className="space-y-4 sm:space-y-6">
              {/* Resolution Summary */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Resolution Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
                      <span className="text-xs">{getResolutionStatusText(selectedResolution)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolved in favor of:</span>
                      <span className="text-xs font-semibold text-green-600">{getWinnerText(selectedResolution)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total returned amount:</span>
                      <span className="text-xs font-semibold">{selectedResolution.resolution.total_returned_amount} USDT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolution date:</span>
                      <span className="text-xs">{formatDate(selectedResolution.resolution.resolution_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Addresses */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contract Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Dispute Contract:</span>
                    <button
                      onClick={() => handleEtherscanClick(selectedResolution.resolution.dispute_contract_address, 'address')}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 break-all w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedResolution.resolution.dispute_contract_address}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Creator:</span>
                      <button
                        onClick={() => handleEtherscanClick(selectedResolution.resolution.escrow_creator_walletaddress, 'address')}
                        className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                      >
                        <span>{formatAddress(selectedResolution.resolution.escrow_creator_walletaddress)}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                      </button>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Receiver:</span>
                      <button
                        onClick={() => handleEtherscanClick(selectedResolution.resolution.escrow_receiver_walletaddress, 'address')}
                        className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                      >
                        <span>{formatAddress(selectedResolution.resolution.escrow_receiver_walletaddress)}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affected Milestones */}
              {selectedResolution.resolution.affected_milestones && selectedResolution.resolution.affected_milestones.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Affected Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Index</TableHead>
                            <TableHead className="text-xs sm:text-sm">Amount (USDT)</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedResolution.resolution.affected_milestones.map((milestone, index) => (
                            <TableRow key={milestone._id}>
                              <TableCell className="text-xs sm:text-sm">{milestone.index}</TableCell>
                              <TableCell className="text-xs sm:text-sm">{milestone.amount}</TableCell>
                              <TableCell className="font-mono text-xs hidden sm:table-cell">
                                {milestone._id}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Hash */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Transaction Hash:</span>
                    <button
                      onClick={() => handleEtherscanClick(selectedResolution.resolution.tx_hash, 'tx')}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 break-all w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedResolution.resolution.tx_hash}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
