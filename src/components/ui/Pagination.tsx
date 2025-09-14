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
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center gap-2">
        <Link href={previousUrl}>
          <Button
            variant="outline"
            disabled={!canGoPrevious}
            className="min-w-[80px]"
          >
            Previous
          </Button>
        </Link>
        
        <Link href={nextUrl}>
          <Button
            variant="outline"
            disabled={!canGoNext}
            className="min-w-[80px]"
          >
            Next
          </Button>
        </Link>
      </div>
    </div>
  );
}
