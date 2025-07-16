import { axiosService } from "../apiConfig"
import { AdoptedDisputeStates, ResolvedByMonthArray, resolverStats } from "@/types/resolver"
import { DisputeResolutionResponse } from "@/types/dispute"


export const getResolverStats = async () => {
    try {
        const response = await axiosService.get<resolverStats>(`api/resolver/getStats`)
        return response
    } catch (error) {
        console.log("error while fetching resolver stats", error)
        throw error
    }
}

export const adoptedDisputesResolutionTime = async () => {
    try {

        const response = await axiosService.get<AdoptedDisputeStates>('api/resolver/active-disputes-remaining-time')
        return response
    } catch (error) {
        throw error
    }
}

export const requestExtension = async (disputeContractAddress: string) => {
    try {

        const response = await axiosService.post('api/resolver/request-extension', {
            disputeContractAddress: disputeContractAddress
        })
        return response
    } catch (error) {
        throw error
    }
}

export const getResolverGraphData = async () => {
    try {
        const response = await axiosService.get<ResolvedByMonthArray>('api/resolver/getStatsGraph')
        return response;
    } catch (error) {
        console.log("error while fetching resolver graph data", error)
        throw error
    }
}

export const getDisputedResolutionHistory = async (disputeContractAddress: string) => {
    try {
        const response = await axiosService.get<DisputeResolutionResponse>(`api/transaction/getDisputeResolutionTransaction/${disputeContractAddress}`)
        return response;
    } catch (error) {
        console.log("error while fetching resolution history", error)
        throw error
    }
}