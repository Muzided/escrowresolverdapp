export interface resolverStats {
    success: Boolean,
    stats: {
        totalAdopted: number,
        resolved: number,
        ongoing: number
    }
}


export interface AdoptedDisputeStates {
    success: boolean,
    disputes: [
        {
            dispute_contract_address: string,
            initial_remaining_seconds: number,
            grace_period_active: boolean,
            grace_remaining_seconds: string,
            final_remaining_seconds: string,
            extended: boolean
        },

    ]
}

export interface ResolvedByMonth {
  month: string;
  resolved: number;
}

export type ResolvedByMonthArray = ResolvedByMonth[];

