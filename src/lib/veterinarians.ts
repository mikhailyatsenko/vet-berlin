import { connectToDatabase, Veterinarian, SearchFilters } from './mongodb';
import { generateVeterinarianSlug, generateUniqueSlug } from './slugUtils';
import { ObjectId } from 'mongodb';
import type { Sort } from 'mongodb';

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
            type: 'Point' as const,
            coordinates: [lng, lat] as [number, number]
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
    } as Record<string, unknown>;

    const sort: Sort = { googleScore: -1 };

    return await collection.find(query)
      .sort(sort)
      .limit(limit)
      .toArray();
  }

  /**
   * Complex search with multiple filters (paginated)
   */
  static async complexSearchWithPagination(filters: SearchFilters = {}): Promise<{ items: Veterinarian[]; total: number; page: number; pageSize: number; }> {
   console.log('filters', filters);
    const collection = await this.getCollection();

    const pageSize = filters.pageSize || filters.limit || 20;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const skip = (page - 1) * pageSize;

    const query: Record<string, unknown> = {};

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

    const sortOptions: Sort = { googleScore: -1 };

    const needOpenNowFilter = !!filters.openNow;

    if (!needOpenNowFilter) {
      const [items, total] = await Promise.all([
        collection.find(query).sort(sortOptions).skip(skip).limit(pageSize).toArray(),
        collection.countDocuments(query)
      ]);
      
      // Ensure all items have slugs
      const itemsWithSlugs = await Promise.all(
        items.map(async (item) => {
          if (!item.slug) {
            const slug = await this.ensureUniqueSlug(item);
            // Update the document with the new slug
            await collection.updateOne(
              { _id: item._id },
              { $set: { slug } }
            );
            return { ...item, slug };
          }
          return item;
        })
      );
      
      return { items: itemsWithSlugs, total, page, pageSize };
    }

    const MAX_SCAN = 500;
    const candidates = await collection.find(query).sort(sortOptions).limit(MAX_SCAN).toArray();

    const berlinNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const dayIndex = berlinNow.getDay();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;
    const todayName = dayNames[dayIndex];

    function parseTimeToMinutes(str: string): number | null {
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

    function isOpenNow(entry: Veterinarian): boolean {
      const hoursArr = Array.isArray(entry.openingHours) ? entry.openingHours : [];
      if (hoursArr.length === 0) return false;

      const today = hoursArr.find(h => h && h.day === todayName);
      if (!today || !today.hours) return false;
      const text = String(today.hours);
      if (/Open 24 hours/i.test(text)) return true;
      if (/Closed/i.test(text)) return false;

      const m = text.match(/([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM))\s*to\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM))/i);
      if (!m) return false;
      const startStr = m[1];
      const endStr = m[2];
      const startMin = parseTimeToMinutes(startStr);
      const endMin = parseTimeToMinutes(endStr);
      if (startMin == null || endMin == null) return false;

      const nowMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();

      if (endMin < startMin) {
        return nowMinutes >= startMin || nowMinutes < endMin;
      }
      return nowMinutes >= startMin && nowMinutes <= endMin;
    }

    const openCandidates = candidates.filter(isOpenNow);

    const total = openCandidates.length;
    const paged = openCandidates.slice(skip, skip + pageSize);
    
    // Ensure all items have slugs
    const itemsWithSlugs = await Promise.all(
      paged.map(async (item) => {
        if (!item.slug) {
          const slug = await this.ensureUniqueSlug(item);
          // Update the document with the new slug
          await collection.updateOne(
            { _id: item._id },
            { $set: { slug } }
          );
          return { ...item, slug };
        }
        return item;
      })
    );
    
    return { items: itemsWithSlugs, total, page, pageSize };
  }

  /**
   * Complex search with multiple filters
   */
  static async complexSearch(filters: SearchFilters = {}): Promise<Veterinarian[]> {
    const collection = await this.getCollection();
    const limit = filters.limit || 20;
    
    const query: Record<string, unknown> = {};
    
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

    const sortOptions: Sort = { googleScore: -1 };

    return await collection.find(query)
      .sort(sortOptions)
      .limit(limit)
      .toArray();
  }

  /**
   * Get a single veterinarian by Google Maps ID
   */
  static async getById(googleMapsId: string): Promise<Veterinarian | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ googleMapsId });
  }

  /**
   * Get a single veterinarian by MongoDB _id
   */
  static async getByMongoId(mongoId: string): Promise<Veterinarian | null> {
    const collection = await this.getCollection();
    try {
      return await collection.findOne({ _id: new ObjectId(mongoId) });
    } catch (error) {
      // If mongoId is not a valid ObjectId, return null
      return null;
    }
  }

  /**
   * Get a single veterinarian by slug
   */
  static async getBySlug(slug: string): Promise<Veterinarian | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ slug });
  }

  /**
   * Generate and ensure unique slug for a veterinarian
   */
  static async ensureUniqueSlug(veterinarian: Veterinarian): Promise<string> {
    const collection = await this.getCollection();
    
    // If slug already exists and is correct, return it
    if (veterinarian.slug) {
      const existing = await collection.findOne({ 
        slug: veterinarian.slug, 
        _id: { $ne: veterinarian._id } 
      });
      if (!existing) {
        return veterinarian.slug;
      }
    }
    
    // Generate new slug
    const baseSlug = generateVeterinarianSlug(veterinarian.title, veterinarian.googleMapsId);
    
    // Get all existing slugs
    const existingSlugs = await collection.distinct('slug', { slug: { $exists: true } }) as string[];
    
    return generateUniqueSlug(baseSlug, existingSlugs);
  }

  /**
   * Get statistics about the database
   */
  static async getStats() {
    const collection = await this.getCollection();
    
    const totalDocs = await collection.countDocuments();
    const highRated = await collection.countDocuments({ googleScore: { $gte: 4.5 } });
    const withReviews = await collection.countDocuments({ googleReview: { $exists: true } });
    const withImages = await collection.countDocuments({ imageUrl: true });
    
    const categories = await collection.distinct('categoryName');
    const neighborhoods = await collection.distinct('neighborhood');
    
    return {
      totalVeterinarians: totalDocs,
      highRatedVeterinarians: highRated,
      veterinariansWithReviews: withReviews,
      veterinariansWithImages: withImages,
      uniqueCategories: categories.filter(c => c).length,
      uniqueNeighborhoods: neighborhoods.filter(n => n).length,
      categories: categories.filter(c => c) as string[],
      neighborhoods: neighborhoods.filter(n => n) as string[]
    };
  }

  static async getCategories(): Promise<string[]> {
    const collection = await this.getCollection();
    return await collection.distinct('categoryName') as string[];
  }

  static async getNeighborhoods(): Promise<string[]> {
    const collection = await this.getCollection();
    const neighborhoods = await collection.distinct('neighborhood');
    return neighborhoods.filter((n): n is string => n !== null && n !== undefined);
  }
}
