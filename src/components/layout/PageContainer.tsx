import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function PageContainer({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'md'
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-4 sm:px-6 lg:px-8 py-8',
    lg: 'px-6 sm:px-8 lg:px-12 py-12'
  };
  
  return (
    <div className={clsx(
      'min-h-screen bg-gray-50',
      className
    )}>
      <main className={clsx(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {children}
      </main>
    </div>
  );
}
