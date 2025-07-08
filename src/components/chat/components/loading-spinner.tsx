import { LoadingSpinnerProps } from '@/types/chat';
import React from 'react';


export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading conversation..." 
}) => {
  return (
    <div className="flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
      <div className="flex items-center justify-center h-[450px]">
        <div className="text-zinc-500">{message}</div>
      </div>
    </div>
  );
};