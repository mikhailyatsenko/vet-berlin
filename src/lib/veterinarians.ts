import { connectToDatabase, Veterinarian, SearchFilters } from './mongodb';

export class VeterinarianService {
  private static async getCollection() {
    const { db } = await connectToDatabase();
    return db.collection<Veterinarian>('vet-places');
  }

  /**
   * Find veterinarians by location (geospatial search)
   */
  static async findNearby(
    lng: number, 
    lat: number, 
    maxDistance: number = 10000, 
    limit: number = 20
  ): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    };

    return await collection.find(query).limit(limit).toArray();
  }

  /**
   * Search veterinarians by text
   */
  static async searchByText(searchText: string, limit: number = 20): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    
    const query = {
      $text: { $search: searchText }
    };

    return await collection.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray();
  }

  /**
   * Find veterinarians by rating
   */
  static async findByRating(minRating: number = 4.0, limit: number = 20): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    
    const query = {
      googleScore: { $gte: minRating }
    };

    return await collection.find(query)
      .sort({ googleScore: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find veterinarians by category
   */
  static async findByCategory(category: string, limit: number = 20): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    
    const query = {
      categoryName: { $regex: category, $options: 'i' }
    };

    return await collection.find(query)
      .sort({ googleScore: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find veterinarians by neighborhood
   */
  static async findByNeighborhood(neighborhood: string, limit: number = 20): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    
    const query = {
      neighborhood: { $regex: neighborhood, $options: 'i' }
    };

    return await collection.find(query)
      .sort({ googleScore: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Complex search with multiple filters
   */
  static async complexSearch(filters: SearchFilters = {}): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    const limit = filters.limit || 20;
    
    const query: any = {};
    
    // Rating filter
    if (filters.minRating) {
      query.googleScore = { $gte: filters.minRating };
    }
    
    // Category filter
    if (filters.category) {
      query.categoryName = { $regex: filters.category, $options: 'i' };
    }
    
    // Neighborhood filter
    if (filters.neighborhood) {
      query.neighborhood = { $regex: filters.neighborhood, $options: 'i' };
    }
    
    // Text search (regex instead of $text to allow combination with geo)
    if (filters.text) {
      query.$or = [
        { title: { $regex: filters.text, $options: 'i' } },
        { categoryName: { $regex: filters.text, $options: 'i' } },
        { address: { $regex: filters.text, $options: 'i' } },
        { neighborhood: { $regex: filters.text, $options: 'i' } }
      ];
    }
    
    // Location filter
    if (filters.lng && filters.lat) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.lng, filters.lat]
          },
          $maxDistance: filters.maxDistance || 10000
        }
      };
    }

    const sortOptions: any = { googleScore: -1 };

    return await collection.find(query)
      .sort(sortOptions)
      .limit(limit)
      .toArray();
  }

  /**
   * Complex search with multiple filters (paginated)
   */
  static async complexSearchWithPagination(filters: SearchFilters = {}): Promise<{ items: Veterinarian[]; total: number; page: number; pageSize: number; }> {
    const collection = await this.getCollection();

    const pageSize = filters.pageSize || filters.limit || 20;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const skip = (page - 1) * pageSize;

    const query: any = {};

    if (filters.minRating) {
      query.googleScore = { $gte: filters.minRating };
    }

    if (filters.category) {
      query.categoryName = { $regex: filters.category, $options: 'i' };
    }

    if (filters.neighborhood) {
      query.neighborhood = { $regex: filters.neighborhood, $options: 'i' };
    }

    if (filters.text) {
      query.$or = [
        { title: { $regex: filters.text, $options: 'i' } },
        { categoryName: { $regex: filters.text, $options: 'i' } },
        { address: { $regex: filters.text, $options: 'i' } },
        { neighborhood: { $regex: filters.text, $options: 'i' } }
      ];
    }

    if (filters.lng && filters.lat) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.lng, filters.lat]
          },
          $maxDistance: filters.maxDistance || 10000
        }
      };
    }

    const sortOptions: any = { googleScore: -1 };

    // If openNow is requested, we can't easily query by openingHours text, so we fetch a superset and filter in-memory.
    const needOpenNowFilter = !!filters.openNow;

    if (!needOpenNowFilter) {
      const [items, total] = await Promise.all([
        collection.find(query).sort(sortOptions).skip(skip).limit(pageSize).toArray(),
        collection.countDocuments(query)
      ]);
      return { items, total, page, pageSize };
    }

    // For openNow, fetch a larger window (e.g., first 500) then filter; then paginate results.
    const MAX_SCAN = 500;
    const candidates = await collection.find(query).sort(sortOptions).limit(MAX_SCAN).toArray();

    const berlinNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const dayIndex = berlinNow.getDay(); // 0-6, Sunday=0
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayNames[dayIndex];

    function parseTimeToMinutes(str: string): number | null {
      // Examples: "9 AM", "10:30 AM", "12 to 3 PM" (we handle ends separately), "Open 24 hours", "Closed"
      const s = str.trim();
      if (!s) return null;
      const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
      if (!match) return null;
      const hour = parseInt(match[1], 10) % 12;
      const minute = match[2] ? parseInt(match[2], 10) : 0;
      const isPM = /PM/i.test(match[3]);
      const total = hour * 60 + minute + (isPM ? 12 * 60 : 0);
      return total;
    }

    function isOpenNow(entry: any): boolean {
      const hoursArr: any[] = Array.isArray(entry.openingHours) ? entry.openingHours : [];
      if (hoursArr.length === 0) return false;

      const today = hoursArr.find(h => h && h.day === todayName);
      if (!today || !today.hours) return false;
      const text = String(today.hours);
      if (/Open 24 hours/i.test(text)) return true;
      if (/Closed/i.test(text)) return false;

      // Patterns like "9 AM to 3 PM", "10:30 AM to 8 PM", etc.
      const m = text.match(/([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM))\s*to\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM))/i);
      if (!m) return false;
      const startStr = m[1];
      const endStr = m[2];
      const startMin = parseTimeToMinutes(startStr);
      const endMin = parseTimeToMinutes(endStr);
      if (startMin == null || endMin == null) return false;

      const nowMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();

      // Handle ranges that may span past midnight (rare for vets, but safe)
      if (endMin < startMin) {
        return nowMinutes >= startMin || nowMinutes < endMin;
      }
      return nowMinutes >= startMin && nowMinutes <= endMin;
    }

    const openCandidates = candidates.filter(isOpenNow);

    const total = openCandidates.length;
    const paged = openCandidates.slice(skip, skip + pageSize);
    return { items: paged, total, page, pageSize };
  }

  /**
   * Get a single veterinarian by Google Maps ID
   */
  static async getById(googleMapsId: string): Promise<Veterinarian | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ googleMapsId });
  }

  /**
   * Get statistics about the database
   */
  static async getStats() {
    const collection = await this.getCollection();
    
    const totalDocs = await collection.countDocuments();
    const highRated = await collection.countDocuments({ googleScore: { $gte: 4.5 } });
    const withReviews = await collection.countDocuments({ googleReview: { $exists: true } });
    const withImages = await collection.countDocuments({ imageUrl: { $exists: true } });
    
    // Get unique categories
    const categories = await collection.distinct('categoryName');
    
    // Get unique neighborhoods
    const neighborhoods = await collection.distinct('neighborhood');
    
    return {
      totalVeterinarians: totalDocs,
      highRatedVeterinarians: highRated,
      veterinariansWithReviews: withReviews,
      veterinariansWithImages: withImages,
      uniqueCategories: categories.length,
      uniqueNeighborhoods: neighborhoods.length,
      categories: categories.filter(c => c).slice(0, 10),
      neighborhoods: neighborhoods.filter(n => n).slice(0, 10)
    };
  }

  /**
   * Get all unique categories
   */
  static async getCategories(): Promise<string[]> {
    const collection = await this.getCollection();
    return await collection.distinct('categoryName');
  }

  /**
   * Get all unique neighborhoods
   */
  static async getNeighborhoods(): Promise<string[]> {
    const collection = await this.getCollection();
    const neighborhoods = await collection.distinct('neighborhood');
    return neighborhoods.filter((n): n is string => n !== null && n !== undefined);
  }
}
