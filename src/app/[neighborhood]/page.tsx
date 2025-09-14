import { VeterinarianService } from '@/lib/veterinarians';
import { Veterinarian, PageProps } from '@/lib/types';
import { slugify, safeParseInt, safeParseBoolean } from '@/lib/utils';
import { 
  EmptyState, 
  Pagination,
  GlobalFilters
} from '@/components';
import VeterinarianCard from '@/components/VeterinarianCard';

export default async function NeighborhoodPage({ params, searchParams }: PageProps) {
  const { neighborhood } = await params;
  const sp = await searchParams;

  const page = safeParseInt(sp.page as string, 1);
  const pageSize = 20;
  const text = typeof sp.text === 'string' ? sp.text : '';
  const category = typeof sp.category === 'string' ? sp.category : '';
  const openNow = safeParseBoolean(sp.openNow as string, false);

  const stats = await VeterinarianService.getStats();
  const neighborhoodsList = stats.neighborhoods as string[];

  const slug = decodeURIComponent(neighborhood);
  const neighborhoodName = neighborhoodsList.find(n => slugify(n) === slug) || slug.replace(/-/g, ' ');

  const { items, total, page: currentPage, pageSize: currentPageSize } = await VeterinarianService.complexSearchWithPagination({
    text: text || undefined,
    category: category || undefined,
    neighborhood: neighborhoodName || undefined,
    page,
    pageSize,
    openNow
  });

  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  // Prepare neighborhood options
  const neighborhoodOptions = [
    { value: '', label: 'All Neighborhoods' },
    ...neighborhoodsList.map(n => ({ value: n, label: n }))
  ];

  return (
    <>
      <GlobalFilters
        neighborhoodOptions={neighborhoodOptions}
        currentNeighborhood={neighborhoodName}
        currentOpenNow={openNow}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Found: {total} veterinarians
        </h2>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((v: Veterinarian) => (
            <VeterinarianCard key={v.googleMapsId} veterinarian={v} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No veterinarians found"
          description="Try adjusting your search criteria"
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/${encodeURIComponent(neighborhood)}`}
        searchParams={{
          text: text || undefined,
          category: category || undefined,
          openNow: openNow ? 'on' : undefined
        }}
        className="mt-8"
      />
    </>
  );
}

