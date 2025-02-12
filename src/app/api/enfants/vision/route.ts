import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import mongoose from 'mongoose'

const visionSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  cards: [{
    title: String,
    description: String,
    icon: String
  }]
}, { timestamps: true })

let Vision = mongoose.models.EnfantsVision || mongoose.model('EnfantsVision', visionSchema)

export interface VisionContent {
  title: string
  subtitle: string
  description: string
  cards: {
    title: string
    description: string
    icon: string
  }[]
}

export async function GET() {
  try {
    await dbConnect()
    const vision = await Vision.findOne().lean()
    
    return NextResponse.json(vision || {
      title: "Notre Vision",
      subtitle: "pour les Enfants",
      description: "Nous croyons que chaque enfant est précieux aux yeux de Dieu. Notre mission est de les guider dans leur découverte de la foi avec amour et créativité.",
      cards: [
        {
          title: "Amour & Sécurité",
          description: "Un environnement sûr et bienveillant où chaque enfant se sent aimé, valorisé et protégé.",
          icon: "heart"
        },
        {
          title: "Apprentissage Biblique",
          description: "Des enseignements bibliques adaptés à chaque âge, rendant la Parole de Dieu accessible et pertinente.",
          icon: "book"
        },
        {
          title: "Amusement & Créativité",
          description: "Des activités ludiques et créatives qui rendent l'apprentissage de la foi amusant et mémorable.",
          icon: "smile"
        }
      ]
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vision content' },
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Parse the request body
    const content = await request.json()

    try {
      // Update or insert the vision content
      const vision = await Vision.findOneAndUpdate(
        {},
        { $set: content },
        { upsert: true, new: true, runValidators: true }
      ).lean()

      if (!vision) {
        throw new Error('Failed to update vision content')
      }

      return NextResponse.json(vision)
    } catch (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update vision in database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating vision:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vision' },
      { status: 500 }
    )
  }
} 