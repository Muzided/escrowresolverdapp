"use-client"
import { getAdoptedDispute, resolvedEscrows } from '@/services/Api/dispute/dispute'
import { adoptedDispute } from '@/types/dispute'
import { useAppKitAccount } from '@reown/appkit/react'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { formatAddress } from '../../../utils/helper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeading from '../ui/pageheading'

const ResolvedDisputes = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
  
    const { address } = useAppKitAccount();

    const { data: adoptedDispute, isLoading, error } = useQuery<adoptedDispute[]>({
        queryKey: ['resolved-escrows', address, currentPage, pageSize],
        queryFn: async () => {
            const response = await resolvedEscrows(currentPage, pageSize, "resolved");
            console.log("API Response:", response);
            return response.data.disputes;
        },
        enabled: !!address,
    });
    
    console.log("disputed-yo", adoptedDispute);
    console.log("isLoading:", isLoading);
    console.log("error:", error);
    
    // Check if data exists and has length
    const hasData = adoptedDispute && adoptedDispute.length > 0;
    console.log("hasData:", hasData, "dataLength:", adoptedDispute?.length);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: string) => {
        setPageSize(Number(newPageSize));
        setCurrentPage(1); // Reset to first page when changing page size
    };

    return (
        <div className="space-y-4">
            <PageHeading text="Resolved Disputes" />
            
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Skeleton loading rows
                            Array.from({ length: pageSize }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : !hasData ? (
                            <TableRow
                                className="border-zinc-200 hover:bg-zinc-100/50 
                            dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                            >
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                                    {error ? `Error: ${error.message}` : "No resolved disputes found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            adoptedDispute?.map((disputedEscrow) => (
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
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Items per page:
                    </span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-20">
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

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Page {currentPage}
                    </span>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasData || adoptedDispute?.length < pageSize || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ResolvedDisputes
