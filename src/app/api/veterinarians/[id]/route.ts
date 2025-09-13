import { NextResponse } from 'next/server';
import { VeterinarianService } from '@/lib/veterinarians';
import { isValidSlug } from '@/lib/slugUtils';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await context.params;
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Veterinarian identifier is required' },
        { status: 400 }
      );
    }

    let veterinarian;
    
    // Check if identifier is a slug (contains only lowercase letters, numbers, and hyphens)
    if (isValidSlug(identifier)) {
      veterinarian = await VeterinarianService.getBySlug(identifier);
    } else if (ObjectId.isValid(identifier)) {
      // Check if identifier is a valid MongoDB ObjectId
      veterinarian = await VeterinarianService.getByMongoId(identifier);
    } else {
      // Fallback to Google Maps ID for backward compatibility
      veterinarian = await VeterinarianService.getById(identifier);
    }

    if (!veterinarian) {
      return NextResponse.json(
        { success: false, error: 'Veterinarian not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: veterinarian
    });

  } catch (error) {
    console.error('Error fetching veterinarian:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch veterinarian' },
      { status: 500 }
    );
  }
}
