'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: {
    text: string;
    minRating: number;
    category: string;
    neighborhood: string;
    openNow?: boolean;
  }) => void;
  categories: string[];
  neighborhoods: string[];
  loading?: boolean;
  initialNeighborhood?: string;
}

export default function SearchFilters({ 
  onSearch, 
  categories, 
  neighborhoods, 
  loading = false,
  initialNeighborhood
}: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    text: '',
    minRating: 0,
    category: '',
    neighborhood: initialNeighborhood || '',
    openNow: false
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, neighborhood: initialNeighborhood || '' }));
  }, [initialNeighborhood]);

  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const reset = {
      text: '',
      minRating: 0,
      category: '',
      neighborhood: '',
      openNow: false
    };
    setFilters(reset);
    onSearch(reset);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search veterinarians, clinics, services..."
            value={filters.text}
            onChange={(e) => setFilters({ ...filters, text: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
        
        {(filters.minRating > 0 || filters.category || filters.neighborhood || filters.openNow) && (
          <button
            onClick={handleReset}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Any Rating</option>
              <option value={3.0}>3.0+ stars</option>
              <option value={3.5}>3.5+ stars</option>
              <option value={4.0}>4.0+ stars</option>
              <option value={4.5}>4.5+ stars</option>
              <option value={5.0}>5.0 stars</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Neighborhood
            </label>
            <select
              value={filters.neighborhood}
              onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Neighborhoods</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Open now toggle */}
      {showFilters && (
        <div className="pt-4">
          <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.openNow}
              onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Open now (Berlin time)</span>
          </label>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.minRating > 0 || filters.category || filters.neighborhood || filters.openNow) && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.minRating > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                {filters.minRating}+ stars
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.category}
              </span>
            )}
            {filters.neighborhood && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <MapPin className="w-3 h-3 mr-1" />
                {filters.neighborhood}
              </span>
            )}
            {filters.openNow && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Open now
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
