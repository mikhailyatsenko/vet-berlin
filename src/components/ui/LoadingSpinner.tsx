import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
}

export default function LoadingSpinner({ 
  className, 
  size = 'md', 
  color = 'primary',
  text,
  ...props 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const colors = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };
  
  return (
    <div className={clsx('flex items-center justify-center', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <div
          className={clsx(
            'animate-spin rounded-full border-2',
            sizes[size],
            colors[color]
          )}
        />
        {text && (
          <span className="text-sm text-gray-600">{text}</span>
        )}
      </div>
    </div>
  );
}
