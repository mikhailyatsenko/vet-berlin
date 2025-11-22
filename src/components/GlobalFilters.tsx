"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildUrl, slugify } from "@/lib/utils";
import { SelectField, Button, Card, Switch } from "@/components";
import { SelectOption } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";

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

  // Use async action hooks for better loading state management
  const submitAction = useAsyncAction({
    resetOnSuccess: true,
    resetDelay: 500,
  });

  const resetAction = useAsyncAction({
    resetOnSuccess: true,
    resetDelay: 500,
  });

  // Update state when props change
  useEffect(() => {
    setNeighborhood(currentNeighborhood);
    setOpenNow(currentOpenNow);
  }, [currentNeighborhood, currentOpenNow]);

  // Check if any filters are applied
  const hasActiveFilters = currentNeighborhood || currentOpenNow;
  
  // Check if current form values differ from displayed values
  const hasChanges = neighborhood !== currentNeighborhood || openNow !== currentOpenNow;
  
  // Check if any loading state is active
  const isAnyLoading = submitAction.loading || resetAction.loading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isAnyLoading) return; // Prevent multiple submissions

    await submitAction.execute(async () => {
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
          openNow: openNow ? "on" : undefined,
        };

        // Always reset page to 1 when applying filters
        // Only keep page if it's explicitly set to 1
        if (currentPage === "1") {
          neighborhoodParams.page = "1";
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
        openNow: openNow ? "on" : undefined,
      };

      // Always reset page to 1 when applying filters
      // Only keep page if it's explicitly set to 1
      if (currentPage === "1") {
        mainPageParams.page = "1";
      }

      const mainPageUrl = buildUrl("/", mainPageParams);
      router.push(mainPageUrl);
    });
  };

  const handleReset = async () => {
    if (isAnyLoading) return; // Prevent multiple submissions

    await resetAction.execute(async () => {
      setNeighborhood("");
      setOpenNow(false);
      router.push(baseUrl);
    });
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
            loading={submitAction.loading}
            disabled={isAnyLoading || !hasChanges}
          >
            Apply filters
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              className="text-nowrap"
              loading={resetAction.loading}
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
