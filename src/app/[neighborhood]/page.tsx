import Link from 'next/link';
import { VeterinarianService } from '@/lib/veterinarians';
import { Veterinarian } from '@/lib/mongodb';

interface PageProps {
  params: Promise<{ neighborhood: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function deslugify(slug: string) {
  return slug.replace(/-/g, ' ');
}

function buildUrl(pathname: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
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
  const openNow = sp.openNow === 'true';

  const neighborhoodName = deslugify(decodeURIComponent(neighborhood));

  const stats = await VeterinarianService.getStats();
  const categoriesList = stats.categories as string[];

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
          <h1 className="text-3xl font-bold text-gray-900">{neighborhoodName}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form method="GET" action={`/${encodeURIComponent(neighborhood)}`} className="space-y-4">
            <div className="relative">
              <input type="text" name="text" placeholder="Search..." defaultValue={text} className="w-full pl-4 pr-28 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                <select name="category" defaultValue={category} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Categories</option>
                  {categoriesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6 md:pt-0">
                <input type="checkbox" id="openNow" name="openNow" defaultChecked={openNow} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="openNow" className="text-sm text-gray-700">Open now (Berlin time)</label>
              </div>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Found: {total} veterinarians</h2>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((v: Veterinarian) => (
              <Link key={v.googleMapsId} href={`/veterinarian/${v.googleMapsId}`} className="block">
                {/* Keep consistent styling via card could be used here if desired */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden p-4">
                  <div className="font-semibold text-gray-900 mb-1">{v.title}</div>
                  <div className="text-sm text-gray-600">{v.categoryName}</div>
                </div>
              </Link>
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
                openNow: openNow ? 'true' : undefined
              })}
            >Previous</Link>
            <Link className={`px-4 py-2 border rounded-md ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              href={buildUrl(`/${encodeURIComponent(neighborhood)}`, {
                page: String(Math.min(totalPages, currentPage + 1)),
                text: text || undefined,
                category: category || undefined,
                openNow: openNow ? 'true' : undefined
              })}
            >Next</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

