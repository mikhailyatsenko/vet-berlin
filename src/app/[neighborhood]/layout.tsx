import { Metadata } from 'next';
import { VeterinarianService } from '@/lib/veterinarians';
import { 
  generateNeighborhoodTitle, 
  generateNeighborhoodDescription, 
  generateNeighborhoodKeywords,
  generateNeighborhoodOpenGraph,
  generateNeighborhoodStructuredData 
} from '@/lib/metadataUtils';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ neighborhood: string }>;
}

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

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { neighborhood } = await params;
  
  try {
    const stats = await VeterinarianService.getStats();
    const neighborhoodsList = stats.neighborhoods as string[];
    
    const slug = decodeURIComponent(neighborhood);
    const neighborhoodName = neighborhoodsList.find(n => slugify(n) === slug) || slug.replace(/-/g, ' ');
    
    // Get veterinarians count for this neighborhood
    const { total } = await VeterinarianService.complexSearchWithPagination({
      neighborhood: neighborhoodName || undefined,
      page: 1,
      pageSize: 1
    });

    const title = generateNeighborhoodTitle(neighborhoodName, total);
    const description = generateNeighborhoodDescription(neighborhoodName, total, stats.categories as string[]);
    const keywords = generateNeighborhoodKeywords(neighborhoodName, stats.categories as string[]);
    const openGraph = generateNeighborhoodOpenGraph(neighborhoodName, total);

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
      },
      other: {
        'application/ld+json': JSON.stringify(generateNeighborhoodStructuredData(neighborhoodName, total, stats.categories as string[]))
      }
    };
  } catch (error) {
    console.error('Error generating neighborhood metadata:', error);
    return {
      title: 'Veterinarians by Neighborhood | Veterinarian Directory Berlin',
      description: 'Find veterinarians and pet clinics by neighborhood in Berlin.',
    };
  }
}

export default function NeighborhoodLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
