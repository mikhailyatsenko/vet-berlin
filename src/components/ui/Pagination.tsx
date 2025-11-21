'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildUrl } from '@/lib/utils';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl, 
  searchParams,
  className 
}: PaginationProps) {
  const [isNavigating, setIsNavigating] = useState<'previous' | 'next' | null>(null);
  
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  
  const previousUrl = canGoPrevious 
    ? buildUrl(baseUrl, {
        ...searchParams,
        page: String(currentPage - 1)
      })
    : '#';
    
  const nextUrl = canGoNext
    ? buildUrl(baseUrl, {
        ...searchParams,
        page: String(currentPage + 1)
      })
    : '#';

  const handleNavigation = (direction: 'previous' | 'next') => {
    if (isNavigating) return;
    
    setIsNavigating(direction);
    // The navigation will happen via the Link click, this just shows loading state briefly
    setTimeout(() => setIsNavigating(null), 1000);
  };
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center gap-2">
        <Link 
          href={previousUrl}
          onClick={() => handleNavigation('previous')}
        >
          <Button
            variant="outline"
            disabled={!canGoPrevious || isNavigating !== null}
            className="min-w-[80px]"
            loading={isNavigating === 'previous'}
          >
            Previous
          </Button>
        </Link>
        
        <Link 
          href={nextUrl}
          onClick={() => handleNavigation('next')}
        >
          <Button
            variant="outline"
            disabled={!canGoNext || isNavigating !== null}
            className="min-w-[80px]"
            loading={isNavigating === 'next'}
          >
            Next
          </Button>
        </Link>
      </div>
    </div>
  );
}
