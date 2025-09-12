import { NextResponse } from 'next/server';
import { VeterinarianService } from '@/lib/veterinarians';

export async function GET() {
  try {
    const stats = await VeterinarianService.getStats();
    const categories = await VeterinarianService.getCategories();
    const neighborhoods = await VeterinarianService.getNeighborhoods();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        categories,
        neighborhoods
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
