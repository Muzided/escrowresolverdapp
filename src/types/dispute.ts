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
  pagination: Pagination
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
  creator_conversation_id: string | null,
  receiver_conversation_id: string | null,
  observer_conversation_id: string | null,
  status: string,
  type: string,
  escrow: AdoptedEscrow,
  milestone_index: number
}
export interface AdoptedEscrow {
  escrow_contract_address: string,
  creator_walletaddress: string,
  observer_wallet: string,
  amount: number,
  receiver_walletaddress: string,
  payment_type: string,
  jurisdiction_tag: string,
}

export interface ResolveDispute {
  disputeContractAddress: string,
  continueWork: boolean,
  txHash: string,
  resolvedInFavorOf: string
}

export interface DisputeTimingState {
  dispute_contract_address: string;
  initial_remaining_seconds: number;
  grace_remaining_seconds: number;
  final_remaining_seconds: number;
  grace_period_active: boolean;
  extended: boolean;
}

export interface CooldownState {
  hours: number;
  minutes: number;
  isOver: boolean;
}

export type DisputePhase = 'initial' | 'grace' | 'extended';

// src/constants/dispute.ts
export const DISPUTE_CONSTANTS = {
  INITIAL_PERIOD_SECONDS: 5 * 24 * 60 * 60, // 5 days
  COOLDOWN_REFRESH_INTERVAL: 60000, // 1 minute
  QUERY_STALE_TIME: 30000, // 30 seconds
} as const;

export interface AffectedMilestone {
  index: number;
  amount: number;
  _id: string;
}

export interface DisputeResolution {
  dispute_contract_address: string;
  escrow_creator_walletaddress: string;
  escrow_receiver_walletaddress: string;
  resolved_in_favor_of_walletaddress: string;
  continue_work: boolean;
  is_milestone_dispute: boolean;
  affected_milestones: AffectedMilestone[];
  total_returned_amount: number;
  tx_hash: string;
  resolution_date: string;
}

export interface DisputeResolutionResponse {
  success: boolean;
  resolution: DisputeResolution;
}