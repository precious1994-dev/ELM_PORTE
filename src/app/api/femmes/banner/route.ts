import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import FemmesBanner from '@/models/FemmesBanner'

export async function GET() {
  try {
    await dbConnect()
    const banner = await FemmesBanner.findOne().lean()
    return NextResponse.json(banner || {})
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
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
    console.log('Received banner update request with data:', data)

    // Find and update or create new banner
    const banner = await FemmesBanner.findOneAndUpdate(
      {},
      {
        imageUrl: data.imageUrl,
        welcome: data.welcome,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        schedule: data.schedule,
        location: data.location,
        updatedAt: new Date()
      },
      { 
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        runValidators: true // Run model validations
      }
    )

    console.log('Banner updated successfully:', banner)

    return NextResponse.json({ 
      message: 'Banner updated successfully',
      banner 
    })
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error updating banner:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to update banner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 