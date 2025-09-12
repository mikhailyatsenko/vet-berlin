'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Veterinarian } from '@/lib/mongodb';
import VeterinarianCard from '@/components/VeterinarianCard';
import SearchFilters from '@/components/SearchFilters';
import LocationButton from '@/components/LocationButton';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';

interface Stats {
  totalVeterinarians: number;
  highRatedVeterinarians: number;
  veterinariansWithReviews: number;
  veterinariansWithImages: number;
  uniqueCategories: number;
  uniqueNeighborhoods: number;
  categories: string[];
  neighborhoods: string[];
}

// Convert a neighborhood name to a URL-friendly slug
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Pagination state (pageSize is fixed to 20)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Persisted filters state
  const [activeFilters, setActiveFilters] = useState<{ text: string; category: string; neighborhood: string; openNow?: boolean }>({
    text: '',
    category: '',
    neighborhood: '',
    openNow: false
  });

  // Neighborhood slug from path, e.g., /mitte
  const pathSlug = pathname && pathname !== '/' ? decodeURIComponent(pathname.replace(/^\/+|\/+$/g, '')) : '';

  // Map slug from URL to a real neighborhood name using stats if possible
  const resolveNeighborhoodFromSlug = useCallback(() => {
    if (!pathSlug) return '';
    const list = stats?.neighborhoods || [];
    const found = list.find((n) => slugify(n) === pathSlug);
    return found || pathSlug.replace(/-/g, ' ');
  }, [pathSlug, stats]);

  // Prevent double-fetch when we intentionally push URL
  const skipUrlEffectRef = useRef<boolean>(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await fetch('/api/stats');
      if (!statsRes.ok) throw new Error('Failed to load stats');
      const statsData = await statsRes.json();
      setStats(statsData.data.stats);
      setCategoriesList(statsData.data.categories || statsData.data.stats?.categories || []);
      setNeighborhoodsList(statsData.data.neighborhoods || statsData.data.stats?.neighborhoods || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const resolvedNeighborhood = resolveNeighborhoodFromSlug();
    if (resolvedNeighborhood && activeFilters.neighborhood !== resolvedNeighborhood) {
      setActiveFilters((prev) => ({ ...prev, neighborhood: resolvedNeighborhood }));
      const qs = new URLSearchParams(Array.from(searchParams.entries()));
      qs.set('page', '1');
      skipUrlEffectRef.current = true;
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    }
    if (!resolvedNeighborhood && activeFilters.neighborhood) {
      setActiveFilters((prev) => ({ ...prev, neighborhood: '' }));
      const qs = new URLSearchParams(Array.from(searchParams.entries()));
      qs.set('page', '1');
      skipUrlEffectRef.current = true;
      router.replace(`/?${qs.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveNeighborhoodFromSlug]);

  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    const urlOpenNow = searchParams.get('openNow') === 'true';

    if (skipUrlEffectRef.current) {
      skipUrlEffectRef.current = false;
      setPage(urlPage);
      setActiveFilters((prev) => ({ ...prev, openNow: urlOpenNow }));
      return;
    }

    setPage(urlPage);
    setActiveFilters((prev) => ({ ...prev, openNow: urlOpenNow }));

    const neighborhoodFromPath = resolveNeighborhoodFromSlug();
    fetchVeterinarians({ page: urlPage, pageSize: 20, neighborhood: neighborhoodFromPath, openNow: urlOpenNow });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, resolveNeighborhoodFromSlug]);

  const fetchVeterinarians = async (overrides?: Partial<{ page: number; pageSize: number; text: string; category: string; neighborhood: string; openNow?: boolean }>) => {
    try {
      setLoading(true);
      setError(null);

      const nextPage = overrides?.page ?? page;
      const nextPageSize = 20; // fixed
      const neighborhoodFromPath = resolveNeighborhoodFromSlug();
      const nextFilters = {
        text: overrides?.text ?? activeFilters.text,
        category: overrides?.category ?? activeFilters.category,
        neighborhood: overrides?.neighborhood ?? (neighborhoodFromPath || activeFilters.neighborhood),
        openNow: overrides?.openNow ?? activeFilters.openNow
      };

      const params = new URLSearchParams();
      params.append('page', String(nextPage));
      params.append('pageSize', String(nextPageSize));
      if (nextFilters.text) params.append('text', nextFilters.text);
      if (nextFilters.category) params.append('category', nextFilters.category);
      if (nextFilters.neighborhood) params.append('neighborhood', nextFilters.neighborhood);
      if (nextFilters.openNow) params.append('openNow', 'true');
      if (currentLocation) {
        params.append('lat', currentLocation.lat.toString());
        params.append('lng', currentLocation.lng.toString());
        params.append('maxDistance', '10000');
      }

      const response = await fetch(`/api/veterinarians?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setVeterinarians(data.data);
      setTotal(data.pagination?.total ?? data.count ?? data.data?.length ?? 0);
      setPage(data.pagination?.page ?? nextPage);
      setPageSize(20);
      setActiveFilters(nextFilters);
    } catch (err) {
      setError('Search error. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: {
    text: string;
    category: string;
    neighborhood: string;
    openNow?: boolean;
  }) => {
    const targetNeighborhood = (filters.neighborhood || '').trim();
    const slug = targetNeighborhood ? slugify(targetNeighborhood) : '';
    const qs = new URLSearchParams(Array.from(searchParams.entries()));
    qs.set('page', '1');
    if (filters.openNow) qs.set('openNow', 'true'); else qs.delete('openNow');

    skipUrlEffectRef.current = true;
    router.push(`${slug ? '/' + slug : pathname === '/' ? '/' : '/'}?${qs.toString()}`, { scroll: false });

    await fetchVeterinarians({ page: 1, ...filters });
  };

  const handleLocationFound = (coords: { lat: number; lng: number }) => {
    setCurrentLocation(coords);
    setLocationError(null);
    
    if (pathSlug) {
      const qs = new URLSearchParams(Array.from(searchParams.entries()));
      qs.set('page', '1');
      skipUrlEffectRef.current = true;
      router.push(`/?${qs.toString()}`, { scroll: false });
    }

    handleSearch({
      text: '',
      category: '',
      neighborhood: '',
      openNow: activeFilters.openNow
    });
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
  };

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped !== page) {
      const qs = new URLSearchParams(Array.from(searchParams.entries()));
      qs.set('page', String(clamped));
      if (activeFilters.openNow) qs.set('openNow', 'true'); else qs.delete('openNow');
      router.push(`${pathname}?${qs.toString()}`, { scroll: false });
    }
  };

  if (loading && veterinarians.length === 0 && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading veterinarian directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🐾 Veterinarian Directory
              </h1>
              <p className="mt-2 text-gray-600">
                Find the best veterinarians in your city
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <LocationButton
                onLocationFound={handleLocationFound}
                onError={handleLocationError}
              />
              
              {currentLocation && (
                <div className="flex items-center text-sm text-green-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location detected
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalVeterinarians}</div>
                <div className="text-sm text-blue-800">Total Clinics</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.highRatedVeterinarians}</div>
                <div className="text-sm text-yellow-800">Highly Rated</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.uniqueNeighborhoods}</div>
                <div className="text-sm text-green-800">Neighborhoods</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueCategories}</div>
                <div className="text-sm text-purple-800">Categories</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        {stats && (
          <SearchFilters
            onSearch={handleSearch}
            categories={categoriesList}
            neighborhoods={neighborhoodsList}
            loading={loading}
            initialNeighborhood={resolveNeighborhoodFromSlug()}
          />
        )}

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {locationError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
              <p className="text-yellow-800">{locationError}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {loading && veterinarians.length === 0 ? 'Searching...' : `Found: ${total} veterinarians`}
            </h2>
            
            {currentLocation && (
              <span className="text-sm text-gray-500">
                Showing veterinarians near you
              </span>
            )}
          </div>
        </div>

        {/* Veterinarians Grid */}
        {veterinarians.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {veterinarians.map((veterinarian) => (
                <VeterinarianCard
                  key={veterinarian.googleMapsId}
                  veterinarian={veterinarian}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || loading}
                  className="px-4 py-2 border rounded-md text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="px-4 py-2 border rounded-md text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No veterinarians found
            </h3>
            <p className="text-gray-500">
              Try changing search parameters or use geolocation
            </p>
          </div>
        ) : null}

        {/* Loading State */}
        {loading && veterinarians.length > 0 && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Updating results...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>🐾 Veterinarian Directory - Find the best specialists for your pets</p>
            <p className="mt-2 text-sm">
              Data provided by Google Maps • Updated: {new Date().toLocaleDateString('en-US')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}