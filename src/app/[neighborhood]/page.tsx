import Link from 'next/link';
import { VeterinarianService } from '@/lib/veterinarians';
import { Veterinarian } from '@/lib/mongodb';
import VeterinarianCard from '@/components/VeterinarianCard';
import NeighborhoodFilters from '@/components/NeighborhoodFilters';

interface PageProps {
  params: Promise<{ neighborhood: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildUrl(pathname: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { 
    if (v && !(k === 'page' && v === '1')) q.set(k, v); 
  });
  const s = q.toString();
  return s ? `${pathname}?${s}` : pathname;
}

export default async function NeighborhoodPage({ params, searchParams }: PageProps) {
  const { neighborhood } = await params;
  const sp = await searchParams;

  const page = Number(sp.page || 1) || 1;
  const pageSize = 20;
  const text = typeof sp.text === 'string' ? sp.text : '';
  const category = typeof sp.category === 'string' ? sp.category : '';
  const openNow = sp.openNow === 'on';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900"> Veterinarians in {neighborhoodName}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <NeighborhoodFilters neighborhood={neighborhood} openNow={openNow} />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Found: {total} veterinarians</h2>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((v: Veterinarian) => (
              <VeterinarianCard key={v.googleMapsId} veterinarian={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No veterinarians found</div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <Link className={`px-4 py-2 border rounded-md ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              href={buildUrl(`/${encodeURIComponent(neighborhood)}`, {
                page: String(Math.max(1, currentPage - 1)),
                text: text || undefined,
                category: category || undefined,
                openNow: openNow ? 'on' : undefined
              })}
            >Previous</Link>
            <Link className={`px-4 py-2 border rounded-md ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              href={buildUrl(`/${encodeURIComponent(neighborhood)}`, {
                page: String(Math.min(totalPages, currentPage + 1)),
                text: text || undefined,
                category: category || undefined,
                  openNow: openNow ? 'on' : undefined
              })}
            >Next</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

