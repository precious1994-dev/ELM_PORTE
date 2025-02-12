import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Homepage from '@/models/Homepage'

export const dynamic = 'force-dynamic'

// GET /api/homepage/vision
export async function GET() {
  try {
    await dbConnect()
    const homepage = await Homepage.findOne().sort({ createdAt: -1 })
    
    if (!homepage?.visionSection) {
      // Return default data if none exists
      return NextResponse.json({
        mainTitle: 'Notre Vision',
        subtitle: 'Foi · Communauté · Service',
        description: 'Ancrés dans la Parole de Dieu, nous aspirons à être une communauté vibrante qui inspire, équipe et mobilise chaque personne à vivre pleinement sa foi et à avoir un impact transformateur dans notre société.',
        items: [
          {
            icon: 'FaPrayingHands',
            title: 'Foi',
            description: 'Grandir ensemble dans la connaissance de Dieu et dans notre relation avec Lui.',
          },
          {
            icon: 'FaUsers',
            title: 'Communauté',
            description: 'Créer des liens authentiques et soutenir chacun dans son parcours de vie.',
          },
          {
            icon: 'FaHandsHelping',
            title: 'Service',
            description: "S'engager à servir notre prochain et à faire une différence dans notre société.",
          },
        ],
      })
    }

    return NextResponse.json(homepage.visionSection)
  } catch (error) {
    console.error('Error fetching vision data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/homepage/vision
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
    if (!data.mainTitle || !data.description || !data.items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update or create vision data
    const homepage = await Homepage.findOneAndUpdate(
      {}, // Empty filter to match any document
      {
        visionSection: {
          mainTitle: data.mainTitle,
          subtitle: data.subtitle,
          description: data.description,
          items: data.items,
        }
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true,
      }
    )

    return NextResponse.json(homepage.visionSection)
  } catch (error) {
    console.error('Error updating vision data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 