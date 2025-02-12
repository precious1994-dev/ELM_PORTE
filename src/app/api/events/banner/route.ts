import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase()
    const collection = mongoose.connection.collection('eventsBanner')
    const banner = await collection.findOne({})
    
    return NextResponse.json({
      imageUrl: banner?.imageUrl || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default'
    })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { imageUrl: 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default' },
      { status: 200 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase()
    const collection = mongoose.connection.collection('eventsBanner')
    const body = await req.json()
    const { imageUrl } = body

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      {},
      { 
        $set: { 
          imageUrl, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    )

    if (!result.acknowledged) {
      throw new Error('Failed to update banner');
    }

    // Return the updated banner data
    const updatedBanner = await collection.findOne({})
    return NextResponse.json(updatedBanner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Error updating banner' },
      { status: 500 }
    )
  }
} 