import { SkeletonCard, SkeletonFilters } from '@/components/ui/Skeleton';

export default function VeterinarianListLoading() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <SkeletonFilters />

      {/* Results Count Skeleton */}
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}