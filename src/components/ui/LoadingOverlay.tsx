'use client';

import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  show: boolean;
  text?: string;
  blur?: boolean;
  variant?: 'full' | 'partial' | 'inline';
}

export default function LoadingOverlay({ 
  show, 
  text = 'Loading...', 
  blur = true,
  variant = 'full',
  className,
  children,
  ...props 
}: LoadingOverlayProps) {
  if (!show) {
    return <>{children}</>;
  }

  const overlayVariants = {
    full: 'fixed inset-0 z-50 flex items-center justify-center bg-white/80',
    partial: 'absolute inset-0 z-40 flex items-center justify-center bg-white/90 rounded-lg',
    inline: 'flex items-center justify-center p-4'
  };

  return (
    <div className={clsx('relative', className)} {...props}>
      {children}
      <div className={clsx(overlayVariants[variant], blur && 'backdrop-blur-sm')}>
        <LoadingSpinner 
          size="lg" 
          text={text}
          className={variant === 'inline' ? '' : 'flex flex-col items-center gap-4'}
        />
      </div>
    </div>
  );
}