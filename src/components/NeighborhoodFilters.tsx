'use client';

import { useRef, useState, useEffect } from 'react';

interface NeighborhoodFiltersProps {
  neighborhood: string;
  openNow: boolean;
}

export default function NeighborhoodFilters({ neighborhood, openNow }: NeighborhoodFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Сброс состояния загрузки при монтировании компонента
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCheckboxChange = () => {
    if (formRef.current) {
      setIsLoading(true);
      formRef.current.submit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form ref={formRef} method="GET" action={`/${encodeURIComponent(neighborhood)}`} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="openNow" 
              name="openNow" 
              defaultChecked={openNow} 
              disabled={isLoading}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onChange={handleCheckboxChange}
            />
            <label htmlFor="openNow" className={`text-sm cursor-pointer flex items-center gap-2 ${isLoading ? 'opacity-50' : 'text-gray-700'}`}>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              )}
              Open now
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
