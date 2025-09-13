/**
 * Utility functions for generating and validating slugs
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Validate if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0;
}

/**
 * Extract slug from URL path
 */
export function extractSlugFromPath(path: string): string | null {
  const match = path.match(/\/veterinarian\/([^\/\?]+)/);
  return match ? match[1] : null;
}

/**
 * Generate slug for veterinarian based on title and googleMapsId as fallback
 */
export function generateVeterinarianSlug(title: string, googleMapsId: string): string {
  const baseSlug = generateSlug(title);
  
  // If title slug is too short or empty, use part of googleMapsId
  if (baseSlug.length < 3) {
    const idSlug = generateSlug(googleMapsId.substring(0, 8));
    return idSlug || 'veterinarian';
  }
  
  return baseSlug;
}
