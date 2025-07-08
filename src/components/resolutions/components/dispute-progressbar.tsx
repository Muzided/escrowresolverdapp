import React from 'react';

interface DisputeProgressBarProps {
  progress: number;
}

export const DisputeProgressBar: React.FC<DisputeProgressBarProps> = ({ progress }) => {
  return (
    <div className="mt-2">
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div
          className="bg-[#9C5F2A] h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};