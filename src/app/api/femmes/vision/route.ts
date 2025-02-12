import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import FemmesVision from '@/models/FemmesVision'

export async function GET() {
  try {
    await dbConnect()
    const vision = await FemmesVision.findOne().lean()
    return NextResponse.json(vision || {})
  } catch (error) {
    console.error('Error fetching vision:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vision' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Get request data
    const data = await request.json()
    console.log('Received vision update request with data:', data)

    // Find and update or create new vision
    const vision = await FemmesVision.findOneAndUpdate(
      {},
      {
        subtitle: data.subtitle,
        title: data.title,
        description: data.description,
        points: data.points
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    console.log('Vision updated successfully:', vision)

    return NextResponse.json({ 
      message: 'Vision updated successfully',
      vision 
    })
  } catch (error) {
    console.error('Detailed error updating vision:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to update vision',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 