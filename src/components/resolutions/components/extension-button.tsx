import React from 'react';
import { Button } from '@/components/ui/button';

interface ExtensionButtonProps {
  isExtending: boolean;
  onExtend: () => void;
}

export const ExtensionButton: React.FC<ExtensionButtonProps> = ({
  isExtending,
  onExtend
}) => {
  return (
    <Button
      className="mt-2"
      disabled={isExtending}
      onClick={onExtend}
    >
      {isExtending ? "Requesting..." : "Request Additional Time"}
    </Button>
  );
};
