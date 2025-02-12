import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Community from '@/models/Community'

// GET /api/homepage/community
export async function GET() {
  try {
    await dbConnect()
    const communityData = await Community.findOne().sort({ createdAt: -1 })
    
    if (!communityData) {
      // Return default data if none exists
      return NextResponse.json({
        title: 'Rejoignez Notre Communauté',
        description: 'Nous sommes une église vivante et accueillante, où chacun peut trouver sa place et grandir dans sa foi. Venez découvrir une communauté chaleureuse et authentique.',
        yearsPresence: 10,
        activeMembers: 200,
        imageUrl: 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/community-default'
      })
    }

    return NextResponse.json(communityData)
  } catch (error) {
    console.error('Error fetching community data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/homepage/community
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update or create community data
    const communityData = await Community.findOneAndUpdate(
      {}, // Empty filter to match any document
      {
        title: data.title,
        description: data.description,
        yearsPresence: data.yearsPresence,
        activeMembers: data.activeMembers,
        imageUrl: data.imageUrl
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    )

    return NextResponse.json(communityData)
  } catch (error) {
    console.error('Error updating community data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 