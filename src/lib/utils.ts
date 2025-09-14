/**
 * Common utility functions used across the application
 */

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Builds a URL with query parameters, excluding page=1
 */
export function buildUrl(
  pathname: string,
  params: Record<string, string | undefined>
): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value && !(key === 'page' && value === '1')) {
      query.set(key, value);
    }
  });
  
  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Formats a number with proper pluralization
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || `${singular}s`}`;
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +49 XXX XXXXXXX for German numbers
  if (cleaned.startsWith('49')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Safely parses a string to a number
 */
export function safeParseInt(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parses a string to a boolean
 */
export function safeParseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value === 'true' || value === 'on' || value === '1';
}
