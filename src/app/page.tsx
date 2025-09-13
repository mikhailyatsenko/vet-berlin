import Link from "next/link";
import { redirect } from "next/navigation";
import { VeterinarianService } from "@/lib/veterinarians";
import { Veterinarian } from "@/lib/mongodb";
import VeterinarianCard from "@/components/VeterinarianCard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildUrl(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && !(k === "page" && v === "1")) q.set(k, v);
  });
  const query = q.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page || 1) || 1;
  const pageSize = 20;
  const text = typeof sp.text === "string" ? sp.text : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const neighborhoodQuery =
    typeof sp.neighborhood === "string" ? sp.neighborhood : "";
  const openNow = sp.openNow === "on";

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
  // const categoriesList = stats.categories as string[];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🐾 Veterinarian Directory
              </h1>
              <p className="mt-2 text-gray-600">
                Find the best veterinarians in your Berlin
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalVeterinarians}
              </div>
              <div className="text-sm text-blue-800">Total Clinics</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.highRatedVeterinarians}
              </div>
              <div className="text-sm text-yellow-800">Highly Rated</div>
            </div>
            {/* <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.uniqueNeighborhoods}
              </div>
              <div className="text-sm text-green-800">Neighborhoods</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.uniqueCategories}
              </div>
              <div className="text-sm text-purple-800">Categories</div>
            </div> */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white w-fit rounded-lg shadow-md p-6 mb-6">
          <form method="GET" action="/" className="space-y-4">
            {/* <div className="relative">
              <input type="text" name="text" placeholder="Search veterinarians, clinics, services..." defaultValue={text} className="w-full pl-4 pr-28 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
            </div> */}

            <div className="block">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                <select name="category" defaultValue={category} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Categories</option>
                  {categoriesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div> */}

              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label> */}
                <div className="flex gap-4 flex-wrap justify-center">
                  <select
                    name="neighborhood"
                    defaultValue=""
                    className="w-fit text-center py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Neighborhoods</option>
                    {neighborhoodsList.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="openNow"
                      name="openNow"
                      defaultChecked={openNow}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="openNow" className="text-sm text-nowrap text-gray-700 cursor-pointer">
                      Open now
                    </label>
                  </div>
                  <button type="submit" className="px-4 py-2 border rounded-md text-nowrap cursor-pointer">
                   Apply filters
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Found: {total} veterinarians
            </h2>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((v: Veterinarian) => (
              <VeterinarianCard key={v.googleMapsId} veterinarian={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No veterinarians found
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Link
              className={`px-4 py-2 border rounded-md ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
              href={buildUrl("/", {
                page: String(Math.max(1, currentPage - 1)),
                text: text || undefined,
                category: category || undefined,
                openNow: openNow ? "on" : undefined,
              })}
            >
              Previous
            </Link>
            <Link
              className={`px-4 py-2 border rounded-md ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              href={buildUrl("/", {
                page: String(Math.min(totalPages, currentPage + 1)),
                text: text || undefined,
                category: category || undefined,
                openNow: openNow ? "on" : undefined,
              })}
            >
              Next
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>
              🐾 Veterinarian Directory - Find the best specialists for your
              pets
            </p>
            <p className="mt-2 text-sm">
              Data provided by Google Maps • Updated:{" "}
              {new Date().toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
