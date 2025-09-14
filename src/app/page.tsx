import { redirect } from "next/navigation";
import { VeterinarianService } from "@/lib/veterinarians";
import { Veterinarian, PageProps } from "@/lib/types";
import { slugify, buildUrl, safeParseInt, safeParseBoolean } from "@/lib/utils";
import { 
  EmptyState, 
  Pagination,
  GlobalFilters
} from "@/components";
import VeterinarianCard from "@/components/VeterinarianCard";

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = safeParseInt(sp.page as string, 1);
  const pageSize = 20;
  const text = typeof sp.text === "string" ? sp.text : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const neighborhoodQuery = typeof sp.neighborhood === "string" ? sp.neighborhood : "";
  const openNow = safeParseBoolean(sp.openNow as string, false);

  if (neighborhoodQuery) {
    const slug = slugify(neighborhoodQuery);
    const url = buildUrl(`/${slug}`, {
      page: page > 1 ? String(page) : undefined,
      text: text || undefined,
      category: category || undefined,
      openNow: openNow ? "on" : undefined,
    });
    redirect(url);
  }

  const stats = await VeterinarianService.getStats();
  const neighborhoodsList = stats.neighborhoods as string[];

  const {
    items,
    total,
    page: currentPage,
    pageSize: currentPageSize,
  } = await VeterinarianService.complexSearchWithPagination({
    text: text || undefined,
    category: category || undefined,
    page,
    pageSize,
    openNow,
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
        currentNeighborhood={neighborhoodQuery}
        currentOpenNow={openNow}
        baseUrl="/"
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
        baseUrl="/"
        searchParams={{
          text: text || undefined,
          category: category || undefined,
          openNow: openNow ? "on" : undefined,
        }}
        className="mt-8"
      />

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>
              🐾 Veterinarian Directory - Find the best specialists for your pets
            </p>
            <p className="mt-2 text-sm">
              Data provided by Google Maps • Updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
