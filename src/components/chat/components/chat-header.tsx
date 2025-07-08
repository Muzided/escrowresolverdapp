import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ChatHeaderProps } from '@/types/chat';

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onGoBack, 
  creatorAddress 
}) => {
  return (
    <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
      <div
        onClick={onGoBack}
        className="text-lg cursor-pointer font-semibold text-zinc-900 dark:text-white flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </div>
      <div className="flex gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        <div>
          <span className="font-medium">Creator:</span> {creatorAddress}
        </div>
      </div>
    </div>
  );
};