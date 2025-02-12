import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import ContactBanner from '@/models/ContactBanner'

export async function GET() {
  try {
    await dbConnect()
    const banner = await ContactBanner.findOne().lean()
    return NextResponse.json(banner || {})
  } catch (error) {
    console.error('Error fetching contact banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact banner' },
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
    console.log('Received contact banner update request with data:', data)

    // Find and update or create new banner
    const banner = await ContactBanner.findOneAndUpdate(
      {},
      {
        imageUrl: data.imageUrl,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    console.log('Contact banner updated successfully:', banner)

    return NextResponse.json({ 
      message: 'Contact banner updated successfully',
      banner 
    })
  } catch (error) {
    console.error('Detailed error updating contact banner:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to update contact banner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 