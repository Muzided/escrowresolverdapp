import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { AdoptedDisputeResponse, DisputeResponse } from "@/types/dispute"
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

export const saveadpotedDispute = async (disputeAddress: string) => {
  
    try {
        
        const response = await axiosService.post(`api/resolver/adoptDispute`, {
            disputeContractAddress: disputeAddress,
        })
        return response
    } catch (error) {
        console.log("error while adopting dispute", error)
        throw error
    }
}

export const getAdoptedDispute = async (page: number = 1, limit: number = 10, status: string = "all") => {
    try {
        const response = await axiosService.get<AdoptedDisputeResponse>(`api/resolver/myAdoptedDisputes`)
        return response
    } catch (error) {
        console.log("error while fetching adopted dispute", error)
        throw error
    }
}