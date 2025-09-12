import { NextResponse } from 'next/server';
import { VeterinarianService } from '@/lib/veterinarians';

export async function GET(
  context: unknown
) {
  try {
    const id = (context as { params?: { id?: string } })?.params?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Veterinarian ID is required' },
        { status: 400 }
      );
    }

    const veterinarian = await VeterinarianService.getById(id);

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
