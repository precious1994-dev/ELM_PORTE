import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

// GET /api/banner
export async function GET() {
  try {
    await dbConnect();
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner) {
      return NextResponse.json({
        imageUrl: '/images/default-banner.jpg'
      });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/banner
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Update or create banner
    const banner = await Banner.findOneAndUpdate(
      {}, // Empty filter to match any document
      {
        imageUrl: data.imageUrl,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    // Broadcast the update to all connected clients
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/banner/sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banner),
      });

      if (!response.ok) {
        console.error('Failed to broadcast banner update');
      }
    } catch (error) {
      console.error('Error broadcasting banner update:', error);
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 