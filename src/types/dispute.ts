import { Pagination } from "./escrow";

export interface EscrowDetails {
  receiver_walletaddress: string;
  receiver_email: string;
  amount: number;
  due_date: number;
  payment_type: string;
  jurisdiction_tag: string;
  kyc_required: boolean;
  observer_wallet: string;
  status: string;
  platform_fee_type: string;
  platform_fee_value: number;
  creator_signature: boolean;
  receiver_signature: boolean;
  escrow_contract_address: string;
  creatorWallet: string;
}

export interface Dispute {
  type: string;
  dispute_contract_address: string;
  status: string;
  adopted_by: string | null;
  milestone_index: number;
  milestone_id: string;
  createdAt: string;
  updatedAt: string;
  escrowDetails: EscrowDetails;
  createdByWallet: string;
}

export interface DisputeResponse {
  success: boolean;
  disputes: Dispute[];
}

export interface AdoptDisputeResponse {
  success: boolean;
  message: string;
}

export interface AdoptedDisputeResponse {
  success: boolean;
  disputes: adoptedDispute[];
}

export interface adoptedDispute {
    dispute_id: string,
    disputeContractAddress: string,
    status: string,
    type: string,
    escrow:AdoptedEscrow
}
export interface AdoptedEscrow {
    escrow_contract_address: string,
    creator_walletaddress:string,
    amount: number,
    receiver_walletaddress:string,
    payment_type: string,
    jurisdiction_tag: string,
}