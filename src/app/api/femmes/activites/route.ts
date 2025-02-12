import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import FemmesActivites from '@/models/FemmesActivites'

export async function GET() {
  try {
    await dbConnect()
    const activites = await FemmesActivites.findOne().lean()
    return NextResponse.json(activites || {})
  } catch (error) {
    console.error('Error fetching activites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activites' },
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
    console.log('Received activites update request with data:', data)

    // Find and update or create new activites
    const activites = await FemmesActivites.findOneAndUpdate(
      {},
      {
        sectionTitle: data.sectionTitle,
        subtitle: data.subtitle,
        description: data.description,
        activities: data.activities
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    console.log('Activites updated successfully:', activites)

    return NextResponse.json({ 
      message: 'Activites updated successfully',
      activites 
    })
  } catch (error) {
    console.error('Detailed error updating activites:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to update activites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 