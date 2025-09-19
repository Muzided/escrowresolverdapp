import React from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useQuery } from '@tanstack/react-query';
import { adoptedDisputesResolutionTime } from '@/services/Api/resolver/resolver';
import { AdoptedDisputeStates } from '@/types/resolver';
import { useDispute } from '@/Hooks/useDispute';
import { CooldownCard } from './components/cooldown-card';
import { DisputeCard } from './components/dispute-card';
import { useDisputeExtension } from '@/Hooks/useDisputeExtesnsion';

const DisputeTimingInfo: React.FC = () => {
  const { address } = useAppKitAccount();
  const { fetchDisputerCoolDown } = useDispute();

  const { data: resolutionTimes, isLoading, error, refetch } = useQuery<AdoptedDisputeStates>({
    queryKey: ['resolution-times'],
    queryFn: async () => {
      console.log("Fetching resolution times...");
      const response = await adoptedDisputesResolutionTime();
      console.log("API Response:", response.data);
      return response.data;
    },
    enabled: !!address,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const { extendDispute, isExtending } = useDisputeExtension({
    onExtensionSuccess: () => {
      console.log("Extension successful, refetching...");
      refetch();
    }
  });

  const handlePhaseComplete = React.useCallback(async () => {
    
    try {
      await refetch();
      console.log("Refetch completed successfully");
    } catch (error) {
      console.error("Error during refetch:", error);
    }
  }, [refetch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading dispute timing information</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {resolutionTimes?.disputes && resolutionTimes.disputes.length > 0 && (
        <CooldownCard
          address={address}
          fetchDisputerCoolDown={fetchDisputerCoolDown}
          noOfAdoptedDispute={resolutionTimes.disputes.length}
        />
      )}

      {resolutionTimes?.disputes?.map((dispute) => (
        <DisputeCard
          key={`${dispute.dispute_contract_address}-${dispute.grace_period_active}-${dispute.extended}`}
          dispute={dispute}
          isExtending={isExtending[dispute.dispute_contract_address]}
          onExtend={() => extendDispute(dispute.dispute_contract_address)}
          onPhaseComplete={handlePhaseComplete}
        />
      ))}
    </div>
  );
};

export default DisputeTimingInfo;