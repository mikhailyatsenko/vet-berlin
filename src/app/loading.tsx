import { SkeletonCard, SkeletonFilters } from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Filters skeleton */}
        <SkeletonFilters />

        {/* Results count skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" text="Loading veterinarians..." />
        </div>
      </div>
    </div>
  );
}
