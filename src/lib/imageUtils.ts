/**
 * Utility functions for image handling
 */

export interface ImageConfig {
  src: string;
  alt: string;
  fallback?: string;
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image domain from URL
 */
export function getImageDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Check if image domain is allowed in Next.js config
 */
export function isAllowedImageDomain(url: string): boolean {
  const domain = getImageDomain(url);
  if (!domain) return false;
  
  const allowedDomains = [
    'streetviewpixels-pa.googleapis.com',
    'lh3.googleusercontent.com',
    'maps.googleapis.com',
    'googleusercontent.com'
  ];
  
  return allowedDomains.some(allowedDomain => 
    domain === allowedDomain || domain.endsWith('.' + allowedDomain)
  );
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getImageProps(url: string, alt: string) {
  return {
    src: url,
    alt,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
    },
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'block';
    }
  };
}

/**
 * Generate placeholder for missing images
 */
export function getImagePlaceholder(type: 'card' | 'detail' = 'card') {
  const size = type === 'card' ? 'text-4xl' : 'text-6xl';
  const textSize = type === 'card' ? 'text-sm' : 'text-lg';
  
  return {
    className: `flex items-center justify-center h-full bg-gray-200`,
    children: (
      <div className="text-center text-gray-500">
        <div className={`${size} mb-2`}>🐾</div>
        <div className={textSize}>No Image</div>
      </div>
    )
  };
}
