import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface VisionContent {
  title: string
  subtitle: string
  description: string
  cards: Array<{
    title: string
    description: string
    icon: string
  }>
}

// Define the Vision schema
const VisionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  cards: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
  }]
}, { timestamps: true })

// Get the Vision model (create it if it doesn't exist)
const Vision = mongoose.models.AdulteVision || mongoose.model('AdulteVision', VisionSchema)

export async function GET() {
  try {
    await connectToDatabase()
    const vision = await Vision.findOne().lean()
    
    if (!vision) {
      // Return default structure if no vision exists
      return NextResponse.json({
        title: '',
        subtitle: '',
        description: '',
        cards: []
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      })
    }

    return NextResponse.json(vision, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('Error fetching vision:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vision' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    )
  }
}

export async function POST(request: Request) {
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
    await connectToDatabase()

    // Parse and validate request body
    const content = await request.json()

    // Validate required fields
    if (!content.title || !content.subtitle || !content.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate cards
    if (!Array.isArray(content.cards)) {
      return NextResponse.json(
        { error: 'Cards must be an array' },
        { status: 400 }
      )
    }

    for (const card of content.cards) {
      if (!card.title || !card.description || !card.icon) {
        return NextResponse.json(
          { error: 'Each card must have title, description, and icon' },
          { status: 400 }
        )
      }
    }

    // Update or create vision document
    const vision = await Vision.findOneAndUpdate(
      {},
      { ...content },
      { upsert: true, new: true, runValidators: true }
    ).lean()

    if (!vision) {
      throw new Error('Failed to update vision')
    }

    return NextResponse.json(vision, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('Error updating vision:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vision' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    )
  }
}

export const dynamic = 'force-dynamic' 