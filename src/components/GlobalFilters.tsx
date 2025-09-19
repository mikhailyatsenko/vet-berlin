"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildUrl, slugify } from "@/lib/utils";
import { SelectField, Button, Card, Switch } from "@/components";
import { SelectOption } from "@/lib/types";

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
  baseUrl = "/",
  className,
}: GlobalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for controlled components
  const [neighborhood, setNeighborhood] = useState(currentNeighborhood);
  const [openNow, setOpenNow] = useState(currentOpenNow);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Update state when props change
  useEffect(() => {
    setNeighborhood(currentNeighborhood);
    setOpenNow(currentOpenNow);
    // Reset loading states when props change (navigation completed)
    setIsLoading(false);
    setIsResetting(false);
  }, [currentNeighborhood, currentOpenNow]);

  // Check if any filters are applied
  const hasActiveFilters = currentNeighborhood || currentOpenNow;
  
  // Check if current form values differ from displayed values
  const hasChanges = neighborhood !== currentNeighborhood || openNow !== currentOpenNow;
  
  // Check if any loading state is active
  const isAnyLoading = isLoading || isResetting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isAnyLoading) return; // Prevent multiple submissions

    setIsLoading(true);

    try {
      // Get current search parameters
      const currentText = searchParams.get("text");
      const currentCategory = searchParams.get("category");
      const currentPage = searchParams.get("page");

      // If neighborhood is selected, redirect to neighborhood page
      if (neighborhood) {
        const neighborhoodSlug = slugify(neighborhood);
        const neighborhoodParams: Record<string, string | undefined> = {
          text: currentText || undefined,
          category: currentCategory || undefined,
          page: currentPage || undefined,
          openNow: openNow ? "on" : undefined,
        };

        // Reset page to 1 when changing neighborhood
        if (!currentPage) {
          delete neighborhoodParams.page;
        }

        const neighborhoodUrl = buildUrl(
          `/${neighborhoodSlug}`,
          neighborhoodParams
        );
        router.push(neighborhoodUrl);
        return;
      }

      // If no neighborhood selected, redirect to main page
      const mainPageParams: Record<string, string | undefined> = {
        text: currentText || undefined,
        category: currentCategory || undefined,
        page: currentPage || undefined,
        openNow: openNow ? "on" : undefined,
      };

      // Reset page to 1 when changing filters (except when page is explicitly set)
      if (!currentPage) {
        delete mainPageParams.page;
      }

      const mainPageUrl = buildUrl("/", mainPageParams);
      router.push(mainPageUrl);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      // Reset loading state after a short delay to show the spinner
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleReset = async () => {
    if (isAnyLoading) return; // Prevent multiple submissions

    setIsResetting(true);

    try {
      setNeighborhood("");
      setOpenNow(false);
      router.push(baseUrl);
    } catch (error) {
      console.error('Error resetting filters:', error);
    } finally {
      // Reset loading state after a short delay to show the spinner
      setTimeout(() => setIsResetting(false), 500);
    }
  };

  return (
    <Card className={`w-fit mb-6 ${className || ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center justify-center">
          <SelectField
            name="neighborhood"
            label=""
            options={neighborhoodOptions}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="text-center"
            disabled={isAnyLoading}
          />

          <Switch
            checked={openNow}
            onChange={setOpenNow}
            label="Open now"
            className="text-nowrap"
            disabled={isAnyLoading}
          />

          <Button 
            type="submit" 
            variant="outline" 
            className="text-nowrap"
            loading={isLoading}
            disabled={isAnyLoading || !hasChanges}
          >
            Apply filters
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              className="text-nowrap"
              loading={isResetting}
              disabled={isAnyLoading}
              onClick={handleReset}
            >
              Reset filters
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
