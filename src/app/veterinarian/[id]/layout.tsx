import { Metadata } from 'next';
import { VeterinarianService } from '@/lib/veterinarians';
import { 
  generateVeterinarianTitle, 
  generateVeterinarianDescription, 
  generateVeterinarianKeywords,
  generateVeterinarianOpenGraph 
} from '@/lib/metadataUtils';
import { isValidSlug } from '@/lib/slugUtils';
import { ObjectId } from 'mongodb';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    let veterinarian;
    
    // Try to get veterinarian by slug, MongoDB ID, or Google Maps ID
    if (isValidSlug(id)) {
      veterinarian = await VeterinarianService.getBySlug(id);
    } else if (ObjectId.isValid(id)) {
      veterinarian = await VeterinarianService.getByMongoId(id);
    } else {
      veterinarian = await VeterinarianService.getById(id);
    }

    if (!veterinarian) {
      return {
        title: 'Veterinarian Not Found | Veterinarian Directory Berlin',
        description: 'The requested veterinarian could not be found.',
      };
    }

    const title = generateVeterinarianTitle(veterinarian);
    const description = generateVeterinarianDescription(veterinarian);
    const keywords = generateVeterinarianKeywords(veterinarian);
    const openGraph = generateVeterinarianOpenGraph(veterinarian);

    return {
      title,
      description,
      keywords: keywords.join(', '),
      openGraph: {
        title: openGraph.title,
        description: openGraph.description,
        type: 'website',
        url: openGraph.url,
        siteName: openGraph.siteName,
        locale: openGraph.locale,
        images: openGraph.images,
      },
      twitter: {
        card: 'summary_large_image',
        title: openGraph.title,
        description: openGraph.description,
        images: openGraph.images[0]?.url,
      },
      other: {
        'application/ld+json': JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Veterinarian",
          "name": veterinarian.title,
          "description": description,
          "url": openGraph.url,
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
          "image": veterinarian.imageUrl && veterinarian._id ? 
            `https://ik.imagekit.io/bdga8gpws/vet-berlin/main-img/${veterinarian._id.toString()}/main.jpg` : 
            undefined
        })
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Veterinarian | Veterinarian Directory Berlin',
      description: 'Find the best veterinarians in Berlin.',
    };
  }
}

export default function VeterinarianLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
