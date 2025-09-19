import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { AdoptedDisputeResponse, DisputeResolutionResponse, DisputeResponse, ResolveDispute } from "@/types/dispute"
import { toast } from "react-toastify"


export const getActiveDisputes = async (page: number = 1, limit: number = 10, status: string = "all") => {
    try {
        const response = await axiosService.get<DisputeResponse>(`api/dispute/resolver/disputed?page=${page}&limit=${limit}`)
        return response
    } catch (error) {
        console.log("error while fetching user disputes", error)
        throw error
    }
}

export const saveadpotedDispute = async (disputeAddress: string, transactionHash: string) => {

    try {

        const response = await axiosService.post(`api/resolver/adoptDispute`, {
            disputeContractAddress: disputeAddress,
            txHash: transactionHash
        })
        return response
    } catch (error) {
        console.log("error while adopting dispute", error)
        throw error
    }
}

export const getAdoptedDispute = async (page: number = 1, limit: number = 10, status: string) => {
    try {
        const response = await axiosService.get<AdoptedDisputeResponse>(`api/resolver/myAdoptedDisputes?status=${status}`)
        return response
    } catch (error) {
        console.log("error while fetching adopted dispute", error)
        throw error
    }
}


export const resolvedEscrows = async (page: number = 1, limit: number = 10, status: string) => {
    try {
        const response = await axiosService.get<AdoptedDisputeResponse>(`api/resolver/myAdoptedDisputes?status=${status}`)
        return response
    } catch (error) {
        console.log("error while fetching adopted dispute", error)
        throw error
    }
}


export const savedResolvedDispute = async (resolveDisputeData: ResolveDispute) => {
    try {
        const response = await axiosService.post(`api/resolver/resolveDispute`, resolveDisputeData)
        return response
    } catch (error) {
        console.log("error while saving resolved dispute", error)
        throw error
    }
}

export const getDisputedResolutionHistory = async (disputeContractAddress: string) => {
    try {
        const response = await axiosService.get<DisputeResolutionResponse>(`api/transaction/getDisputeResolutionTransaction/${disputeContractAddress}`)
        return response
    } catch (error) {
        console.log("error while fetching dispute resolution history", error)
        throw error
    }
}

export const initateDecision = async (disputeContractAddress: string, inFavorOf: string) => {
    try {
        const response = await axiosService.post(`api/resolver/initiate-decision`, {
            dispute_contract_address: disputeContractAddress,
            in_favor_of:inFavorOf
        })
        //status code 201
        return response
    } catch (error) {
        console.log("error while initiating decision", error)
        throw error
    }
}