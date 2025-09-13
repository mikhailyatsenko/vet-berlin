import { Veterinarian } from './mongodb';

/**
 * Generate page title for veterinarian detail page
 */
export function generateVeterinarianTitle(veterinarian: Veterinarian): string {
  return `${veterinarian.title} | Veterinarian Directory Berlin`;
}

/**
 * Generate page description for veterinarian detail page
 */
export function generateVeterinarianDescription(veterinarian: Veterinarian): string {
  const parts = [];
  
  if (veterinarian.categoryName) {
    parts.push(veterinarian.categoryName);
  }
  
  if (veterinarian.neighborhood) {
    parts.push(`in ${veterinarian.neighborhood}`);
  }
  
  if (veterinarian.googleScore) {
    parts.push(`⭐ ${veterinarian.googleScore}/5 rating`);
  }
  
  const baseDescription = `Find ${veterinarian.title} - ${parts.join(', ')}.`;
  
  if (veterinarian.address) {
    return `${baseDescription} Located at ${veterinarian.address}. Contact information, opening hours, and reviews.`;
  }
  
  return `${baseDescription} Contact information, opening hours, and reviews.`;
}

/**
 * Generate keywords for veterinarian detail page
 */
export function generateVeterinarianKeywords(veterinarian: Veterinarian): string[] {
  const keywords = [
    'veterinarian Berlin',
    'pet clinic Berlin',
    'animal hospital Berlin',
    veterinarian.title.toLowerCase()
  ];
  
  if (veterinarian.categoryName) {
    keywords.push(veterinarian.categoryName.toLowerCase());
  }
  
  if (veterinarian.neighborhood) {
    keywords.push(`veterinarian ${veterinarian.neighborhood}`);
    keywords.push(`pet clinic ${veterinarian.neighborhood}`);
  }
  
  if (veterinarian.categories && veterinarian.categories.length > 0) {
    veterinarian.categories.forEach(category => {
      keywords.push(category.toLowerCase());
    });
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate Open Graph data for veterinarian
 */
export function generateVeterinarianOpenGraph(veterinarian: Veterinarian) {
  return {
    title: veterinarian.title,
    description: generateVeterinarianDescription(veterinarian),
    type: 'business.business',
    url: `https://veterinarian-directory-berlin.vercel.app/veterinarian/${veterinarian.slug || veterinarian._id?.toString()}`,
    siteName: 'Veterinarian Directory Berlin',
    images: veterinarian.imageUrl && veterinarian._id ? [
      {
        url: `https://ik.imagekit.io/bdga8gpws/vet-berlin/main-img/${veterinarian._id.toString()}/main.jpg`,
        width: 1200,
        height: 630,
        alt: veterinarian.title
      }
    ] : [],
    locale: 'en_US'
  };
}

/**
 * Generate structured data (JSON-LD) for veterinarian
 */
export function generateVeterinarianStructuredData(veterinarian: Veterinarian) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Veterinarian",
    "name": veterinarian.title,
    "description": generateVeterinarianDescription(veterinarian),
    "url": `https://veterinarian-directory-berlin.vercel.app/veterinarian/${veterinarian.slug || veterinarian._id?.toString()}`,
    "telephone": veterinarian.phone,
    "website": veterinarian.website,
    "address": veterinarian.address ? {
      "@type": "PostalAddress",
      "streetAddress": veterinarian.address,
      "addressLocality": veterinarian.neighborhood || "Berlin",
      "addressCountry": "DE"
    } : undefined,
    "aggregateRating": veterinarian.googleScore ? {
      "@type": "AggregateRating",
      "ratingValue": veterinarian.googleScore,
      "ratingCount": 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "openingHoursSpecification": veterinarian.openingHours ? veterinarian.openingHours.map(hour => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hour.day,
      "opens": hour.hours.split(' to ')[0] || "09:00",
      "closes": hour.hours.split(' to ')[1] || "18:00"
    })) : undefined,
    "image": veterinarian.imageUrl && veterinarian._id ? 
      `https://ik.imagekit.io/bdga8gpws/vet-berlin/main-img/${veterinarian._id.toString()}/main.jpg` : 
      undefined
  };

  // Remove undefined values
  return JSON.parse(JSON.stringify(structuredData, (key, value) => 
    value === undefined ? undefined : value
  ));
}

/**
 * Generate page title for neighborhood page
 */
export function generateNeighborhoodTitle(neighborhoodName: string, totalVeterinarians: number): string {
  return `Veterinarians in ${neighborhoodName} (${totalVeterinarians}) | Veterinarian Directory Berlin`;
}

/**
 * Generate page description for neighborhood page
 */
export function generateNeighborhoodDescription(neighborhoodName: string, totalVeterinarians: number, categories: string[]): string {
  const categoryText = categories.length > 0 ? ` including ${categories.slice(0, 3).join(', ')}` : '';
  return `Find ${totalVeterinarians} veterinarians and pet clinics in ${neighborhoodName}, Berlin${categoryText}. Search by services, read reviews, and get contact information for top-rated veterinary practices in your area.`;
}

/**
 * Generate keywords for neighborhood page
 */
export function generateNeighborhoodKeywords(neighborhoodName: string, categories: string[]): string[] {
  const keywords = [
    'veterinarian Berlin',
    'pet clinic Berlin',
    `veterinarian ${neighborhoodName}`,
    `pet clinic ${neighborhoodName}`,
    `animal hospital ${neighborhoodName}`,
    `veterinary services ${neighborhoodName}`,
    `pet doctor ${neighborhoodName}`,
    `emergency vet ${neighborhoodName}`,
    `cat vet ${neighborhoodName}`,
    `dog vet ${neighborhoodName}`
  ];
  
  // Add category-specific keywords
  categories.forEach(category => {
    keywords.push(`${category.toLowerCase()} ${neighborhoodName}`);
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate Open Graph data for neighborhood
 */
export function generateNeighborhoodOpenGraph(neighborhoodName: string, totalVeterinarians: number) {
  return {
    title: `Veterinarians in ${neighborhoodName}`,
    description: generateNeighborhoodDescription(neighborhoodName, totalVeterinarians, []),
    type: 'website',
    url: `https://veterinarian-directory-berlin.vercel.app/${neighborhoodName.toLowerCase().replace(/\s+/g, '-')}`,
    siteName: 'Veterinarian Directory Berlin',
    images: [],
    locale: 'en_US'
  };
}

/**
 * Generate structured data (JSON-LD) for neighborhood
 */
export function generateNeighborhoodStructuredData(neighborhoodName: string, totalVeterinarians: number, categories: string[]) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Veterinarians in ${neighborhoodName}`,
    "description": generateNeighborhoodDescription(neighborhoodName, totalVeterinarians, categories),
    "url": `https://veterinarian-directory-berlin.vercel.app/${neighborhoodName.toLowerCase().replace(/\s+/g, '-')}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `Veterinarians in ${neighborhoodName}`,
      "numberOfItems": totalVeterinarians,
      "itemListElement": []
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://veterinarian-directory-berlin.vercel.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": neighborhoodName,
          "item": `https://veterinarian-directory-berlin.vercel.app/${neighborhoodName.toLowerCase().replace(/\s+/g, '-')}`
        }
      ]
    }
  };

  return structuredData;
}
