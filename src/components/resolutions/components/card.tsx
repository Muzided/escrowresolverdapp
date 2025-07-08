import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white w-full dark:bg-zinc-900 rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  );
};