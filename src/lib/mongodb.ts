import { MongoClient, Db } from 'mongodb';

const MONGO_URI: string = process.env.MONGO_URI!;
const DB_NAME: string = process.env.DB_NAME!;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

interface CachedConnection {
  client: MongoClient;
  db: Db;
}

declare global {
  var mongo: CachedConnection | undefined;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: undefined as any, db: undefined as any };
}

export async function connectToDatabase() {
  if (cached?.client && cached?.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached?.client) {
    cached = global.mongo = { 
      client: new MongoClient(MONGO_URI), 
      db: undefined as any 
    };
  }

  try {
    await cached.client.connect();
  } catch (error) {
    // Connection already established or error occurred
  }

  cached.db = cached.client.db(DB_NAME);

  return { client: cached.client, db: cached.db };
}

export interface Veterinarian {
  _id?: string;
  title: string;
  imageUrl?: string;
  categoryName: string;
  address?: string;
  street?: string;
  postalCode?: string;
  neighborhood?: string;
  website?: string;
  phone?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  googleScore: number;
  categories: string[];
  openingHours: any[];
  googleMapsId: string;
  googleReview?: {
    text: string;
    publishedAtDate: string;
    stars: number;
  };
  migratedAt?: Date;
  source?: string;
}

export interface SearchFilters {
  text?: string;
  minRating?: number;
  category?: string;
  neighborhood?: string;
  lng?: number;
  lat?: number;
  maxDistance?: number;
  limit?: number;
  page?: number;
  pageSize?: number;
  openNow?: boolean;
}
