import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { requestExtension } from '@/services/Api/resolver/resolver';

interface UseDisputeExtensionProps {
  onExtensionSuccess?: () => void;
}

export const useDisputeExtension = ({ onExtensionSuccess }: UseDisputeExtensionProps = {}) => {
  const [isExtending, setIsExtending] = useState<{ [address: string]: boolean }>({});

  const extendDispute = useCallback(async (disputeAddress: string) => {
    try {
      setIsExtending(prev => ({ ...prev, [disputeAddress]: true }));
      
      console.log(`Requesting extension for dispute: ${disputeAddress}`);
      await requestExtension(disputeAddress);
      
      toast.success("Extension requested successfully!");
      
      // Call the success callback to refetch API
      onExtensionSuccess?.();
      
    } catch (error) {
      console.error("Error while requesting additional time:", error);
      toast.error("Failed to request extension. Please try again.");
    } finally {
      setIsExtending(prev => ({ ...prev, [disputeAddress]: false }));
    }
  }, [onExtensionSuccess]);

  return {
    extendDispute,
    isExtending
  };
};