'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildUrl, slugify } from '@/lib/utils';
import { ComboboxField, CheckboxField, Button, Card } from '@/components';
import { SelectOption } from '@/lib/types';

interface GlobalFiltersProps {
  neighborhoodOptions: SelectOption[];
  currentNeighborhood: string;
  currentOpenNow: boolean;
  baseUrl?: string;
  className?: string;
}

export default function GlobalFilters({ 
  neighborhoodOptions, 
  currentNeighborhood, 
  currentOpenNow,
  className 
}: GlobalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for controlled components
  const [neighborhood, setNeighborhood] = useState(currentNeighborhood);
  const [openNow, setOpenNow] = useState(currentOpenNow);

  // Update state when props change
  useEffect(() => {
    setNeighborhood(currentNeighborhood);
    setOpenNow(currentOpenNow);
  }, [currentNeighborhood, currentOpenNow]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get current search parameters
    const currentText = searchParams.get('text');
    const currentCategory = searchParams.get('category');
    const currentPage = searchParams.get('page');
    
    // If neighborhood is selected, redirect to neighborhood page
    if (neighborhood) {
      const neighborhoodSlug = slugify(neighborhood);
      const neighborhoodParams: Record<string, string | undefined> = {
        text: currentText || undefined,
        category: currentCategory || undefined,
        page: currentPage || undefined,
        openNow: openNow ? 'on' : undefined,
      };
      
      // Reset page to 1 when changing neighborhood
      if (!currentPage) {
        delete neighborhoodParams.page;
      }
      
      const neighborhoodUrl = buildUrl(`/${neighborhoodSlug}`, neighborhoodParams);
      router.push(neighborhoodUrl);
      return;
    }
    
    // If no neighborhood selected, redirect to main page
    const mainPageParams: Record<string, string | undefined> = {
      text: currentText || undefined,
      category: currentCategory || undefined,
      page: currentPage || undefined,
      openNow: openNow ? 'on' : undefined,
    };
    
    // Reset page to 1 when changing filters (except when page is explicitly set)
    if (!currentPage) {
      delete mainPageParams.page;
    }
    
    const mainPageUrl = buildUrl('/', mainPageParams);
    router.push(mainPageUrl);
  };

  return (
    <Card className={`w-fit mb-6 ${className || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center justify-center">
           <ComboboxField
             name="neighborhood"
             label=""
             options={neighborhoodOptions}
             value={neighborhood}
             onChange={setNeighborhood}
             placeholder="Search neighborhoods..."
             className="w-fit text-center min-w-[200px]"
           />
          
          <CheckboxField
            id="openNow"
            name="openNow"
            label="Open now"
            checked={openNow}
            onChange={(e) => setOpenNow(e.target.checked)}
            className="text-nowrap"
          />
          
          <Button type="submit" variant="outline" className="text-nowrap">
            Apply filters
          </Button>
        </div>
      </form>
    </Card>
  );
}
