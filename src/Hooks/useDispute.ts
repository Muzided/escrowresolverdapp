import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import EscrowAbi from "../Web3/Abis/EscrowAbi.json";
import disputeContractAbi from "../Web3/Abis/disputeContractAbi.json";
import { convertUnixToDate } from "../../utils/helper";
import { saveadpotedDispute, savedResolvedDispute } from "@/services/Api/dispute/dispute";
import { AdoptDisputeResponse, ResolveDispute } from "@/types/dispute";
import { useEscrow } from "./useEscrow";
import { isGeneratorFunction } from "util/types";



export const useDispute = () => {
    const { signer } = useWeb3();
    const { fetchEscrowContract } = useEscrow();
    const { multisigFactoryContract } = useWeb3();
    //initialize escrow contract
    const fetchDisputeContract = async (escrowAddress: string) => {
        try {
            const escrowContract = new Contract(escrowAddress, disputeContractAbi, signer);
            return escrowContract;
        } catch (error) {

        }

    }



    const fetchDisputeReason = async (disputeAddress: string, milestoneIndex: number) => {
        try {
            const contract = await fetchDisputeContract(disputeAddress);
            if (!contract) return;
            const disputeData = await contract.disputes(milestoneIndex);
            console.log("disputeDat--yoo", disputeData, milestoneIndex)
            return disputeData.reason;
        } catch (error) {
            console.error("Error fetching dispute reason:", error);
        }
    }

    const adoptDispute = async (disputeAddress: string, milestoneIndex: number):
        Promise<AdoptDisputeResponse> => {
        let id: any;
        try {
            id = toast.loading(`Adopting dispute...`);
            const contract = await fetchDisputeContract(disputeAddress);
            if (!contract) {
                toast.update(id, {
                    render: "Error while initializing dispute contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    success: false,
                    message: "Error while initializing dispute contract"
                };
            }
            const adopted = await contract.becomeResolver(milestoneIndex);
            const tx = await adopted.wait();
            console.log("tx-save-dispute", tx)
            const response = await saveadpotedDispute(disputeAddress, tx.hash);
            console.log("response", response)
            if (response.status === 200) {
                toast.update(id, { render: `Adopted dispute hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
                return {
                    success: true,
                    message: "Dispute adopted successfully"
                };
            } else {
                toast.update(id, { render: "Error occurred while adopting dispute", type: "error", isLoading: false, autoClose: 3000 });
                return {
                    success: false,
                    message: "Error occurred while adopting dispute"
                };
            }

        } catch (error: any) {

            const errorString = error.toString().toLowerCase();
            console.error("Error adopting dispute:", errorString);
            if (errorString.includes("resolver has hit their throughput limit")) {
                toast.update(id, { render: "You have hit your adoption limit.", type: "error", isLoading: false, autoClose: 3000 });
            } else if (errorString.includes("resolver already has too many open disputes")) {
                toast.update(id, { render: "You have already reached adoption limit.", type: "error", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(id, { render: "Error occurred while adopting dispute", type: "error", isLoading: false, autoClose: 3000 });
            }


            return {
                success: false,
                message: "Error occurred while adopting dispute"
            };
        }
    }


    // Function to fetch escrow details
    const fetchDisputeDetails = useCallback(async (
        disputeAddress: string,

    ) => {

        try {
            const contract = await fetchDisputeContract(disputeAddress);

            if (!contract) return;

            const reason = await contract.reason();
            const isDisputeResolved = await contract.resolved()
            console.log("dispute things", reason, isDisputeResolved)
            return {
                reason: reason,
                isDisputeResolved: isDisputeResolved

            }




        } catch (error) {
            console.error("Error requesting payment:", error);
        }
    }, [signer]);

    //fetch disputer cool downtime
    // const fetchDisputerCoolDown = async (userAddress: string) => {
    //     try {

    //         if (!multisigFactoryContract) return 0;
    //         const timeStart = await multisigFactoryContract.windowStart (userAddress);
    //         const timeFrame = await multisigFactoryContract.resolutionWindow();

    //         // Calculate end time by adding timeFrame to timeStart
    //         const endTime = Number(timeStart) + Number(timeFrame);

    //         // Get current time in seconds
    //         const currentTime = Math.floor(Date.now() / 1000);

    //         // Calculate remaining cooldown time
    //         const remainingTime = endTime - currentTime;

    //         // Return 0 if time has expired, otherwise return remaining time
    //         return remainingTime > 0 ? remainingTime : 0;
    //     } catch (error) {
    //         console.error("Error fetching resolver cool down:", error);
    //         return 0;
    //     }
    // }


    const fetchDisputerCoolDown = async (userAddress: string) => {
  try {
    if (!multisigFactoryContract) return 0;

    // Load relevant state
    const [timeStart, timeFrame, maxResolves, resolvesUsed] = await Promise.all([
      multisigFactoryContract.windowStart(userAddress),
      multisigFactoryContract.resolutionWindow(),
      multisigFactoryContract.maxResolvesPerWindow(),
      multisigFactoryContract.resolvesInWindow(userAddress),
    ]);

    const endTime = Number(timeStart) + Number(timeFrame);
    const currentTime = Math.floor(Date.now() / 1000);

    // Only apply cooldown if they've already maxed their resolves
    if (Number(resolvesUsed) >= Number(maxResolves)) {
      const remainingTime = endTime - currentTime;
      return remainingTime > 0 ? remainingTime : 0;
    }

    // If not at max, no cooldown
    return 0;
  } catch (error) {
    console.error("Error fetching resolver cool down:", error);
    return 0;
  }
};
    

    const resolveDispute = async (disputeAddress: string, milestoneIndex: number, continueWork: boolean, resolvedInFavorOf: boolean, winnerAddress: string) => {
        let id: any;
        try {

            console.log(disputeAddress, milestoneIndex, continueWork, resolvedInFavorOf)

            id = toast.loading(`Resolving dispute...`);
            const contract = await fetchDisputeContract(disputeAddress);

            if (!contract) {
                toast.update(id, {
                    render: "Error while resolving dispute contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    success: false,
                    message: "Dispute resolved successfully"
                };;
            }
  console.log("contract", milestoneIndex, resolvedInFavorOf, continueWork)
            const resolve = await contract.resolveDispute(milestoneIndex, resolvedInFavorOf, continueWork);
            const tx = await resolve.wait();

            console.log("tx-resolve-dispute", tx)
            const disputeData: ResolveDispute = {
                disputeContractAddress: disputeAddress,
                continueWork: continueWork,
                txHash: tx.hash,
                resolvedInFavorOf: winnerAddress
            }

            const response = await savedResolvedDispute(disputeData);
            console.log("response", response)
            if (response.status === 200) {
                toast.update(id, { render: `resoved dispute hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
                return {
                    success: true,
                    message: "Dispute resolved successfully"
                };
            } else {
                toast.update(id, { render: "Error occurred while resolving dispute", type: "error", isLoading: false, autoClose: 3000 });
                return {
                    success: false,
                    message: "Error occurred while resolving dispute"
                };
            }

        } catch (error) {
            console.error("Error resolving dispute:", error);
            toast.update(id, { render: "Error occurred while resolving dispute", type: "error", isLoading: false, autoClose: 3000 });
            return {
                success: false,
                message: "Error occurred while resolving dispute"
            };
        }
    }

    return {
        fetchDisputeDetails,
        fetchDisputeReason,
        adoptDispute,
        fetchDisputerCoolDown,
        resolveDispute
    }
}