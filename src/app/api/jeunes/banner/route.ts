import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import { connectToDatabase } from '@/lib/mongodb'
import YouthBanner from '@/models/youth-banner'
import type { BannerContent } from '@/models/youth-banner'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const defaultContent: BannerContent = {
  imageUrl: '/images/youth-ministry.jpg',
  welcome: 'Bienvenue au Ministère des Jeunes',
  title: 'Grandis dans ta Foi',
  subtitle: 'Impacte ta Génération',
  description: 'Un espace dynamique où les jeunes peuvent grandir dans leur foi, développer des amitiés authentiques et découvrir leur potentiel en Christ.',
  schedule: 'Tous les Samedis à 18h',
  location: 'Salle des Jeunes'
}

export async function GET() {
  try {
    await connectToDatabase()
    let banner = await YouthBanner.findOne()
    
    if (!banner) {
      banner = await YouthBanner.create(defaultContent)
    }
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Received data:', data)

    // Validate required fields
    const requiredFields = ['welcome', 'title', 'subtitle', 'description', 'imageUrl']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    await connectToDatabase()
    console.log('Connected to database')
    
    // Find and update, or create if doesn't exist
    const banner = await YouthBanner.findOneAndUpdate(
      {},
      { 
        welcome: data.welcome,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        imageUrl: data.imageUrl,
        schedule: data.schedule,
        location: data.location
      },
      { upsert: true, new: true, runValidators: true }
    )

    console.log('Updated banner:', banner)

    if (!banner) {
      throw new Error('Failed to update or create banner')
    }

    return NextResponse.json({ message: 'Banner updated successfully', banner })
  } catch (error) {
    console.error('Detailed error updating banner:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 