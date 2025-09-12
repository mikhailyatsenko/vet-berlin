import { NextRequest, NextResponse } from 'next/server';
import { VeterinarianService } from '@/lib/veterinarians';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const text = searchParams.get('text') || undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const category = searchParams.get('category') || undefined;
    const neighborhood = searchParams.get('neighborhood') || undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const maxDistance = searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : limit;
    const openNow = searchParams.get('openNow') === 'true' ? true : undefined;

    const filters = {
      text,
      minRating,
      category,
      neighborhood,
      lng,
      lat,
      maxDistance,
      limit: pageSize,
      page,
      pageSize,
      openNow
    };

    const result = await VeterinarianService.complexSearchWithPagination(filters);

    return NextResponse.json({
      success: true,
      data: result.items,
      count: result.items.length,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize))
      }
    });

  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch veterinarians' },
      { status: 500 }
    );
  }
}
