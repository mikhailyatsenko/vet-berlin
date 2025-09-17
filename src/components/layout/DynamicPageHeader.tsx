'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import PageHeader from './PageHeader';

interface DynamicPageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function DynamicPageHeader({ 
  title, 
  subtitle, 
  className 
}: DynamicPageHeaderProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Get current filter values
  const neighborhoodFromParams = searchParams.get('neighborhood');
  const openNow = searchParams.get('openNow') === 'on';
  
  // Check if we're on a neighborhood page (path like /charlottenburg-wilmersdorf)
  const isNeighborhoodPage = pathname !== '/' && !pathname.startsWith('/veterinarian/') && !pathname.startsWith('/api/');
  const neighborhoodFromPath = isNeighborhoodPage ? decodeURIComponent(pathname.slice(1)) : null;
  
  // Use neighborhood from path if available, otherwise from search params
  const neighborhood = neighborhoodFromPath || neighborhoodFromParams;
  
  // Build filter info text
  let filterInfo = '';
  if (neighborhood && openNow) {
    // Both neighborhood and open now
    const readableName = neighborhood.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    filterInfo = `📍 Showing veterinarians in ${readableName} (open now)`;
  } else if (neighborhood) {
    // Only neighborhood
    const readableName = neighborhood.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    filterInfo = `📍 Showing veterinarians in ${readableName}`;
  } else if (openNow) {
    // Only open now
    filterInfo = '🕐 Showing veterinarians open now';
  }
  
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      className={className}
      filterInfo={filterInfo}
    />
  );
}
