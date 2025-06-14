
import React from 'react';
import { IconSpinner } from './IconComponents';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-slate-600 ${className}`}>
      <IconSpinner className={`${sizeClasses[size]} animate-spin text-sky-600`} />
      {text && <p className="mt-3 text-sm">{text}</p>}
    </div>
  );
};
