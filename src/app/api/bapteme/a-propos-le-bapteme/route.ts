import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

// Define the About Schema
const aboutSchema = new mongoose.Schema({
  mainTitle: String,
  subtitle: String,
  description: String,
  cards: [{
    title: String,
    description: String,
    icon: String
  }]
}, { timestamps: true })

// Get the About model (or create if doesn't exist)
const About = mongoose.models.BaptemeAbout || mongoose.model('BaptemeAbout', aboutSchema)

export interface VisionPoint {
  title: string
  description: string
}

export interface VisionContent {
  title: string
  description: string
  points: VisionPoint[]
  isActive: boolean
}

export interface AboutBaptemeContent {
  mainTitle: string
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
    await connectToDatabase()
    const about = await About.findOne().lean()
    
    return NextResponse.json(about || {
      mainTitle: 'Le Baptême',
      subtitle: 'À Propos',
      description: 'Le baptême est un acte d\'obéissance et un témoignage public de notre foi en Jésus-Christ. C\'est une étape importante dans la vie de tout croyant.',
      cards: [
        {
          title: 'Signification',
          description: 'Le baptême symbolise notre identification à la mort, l\'ensevelissement et la résurrection de Christ.',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
        },
        {
          title: 'Engagement',
          description: 'C\'est un engagement public à suivre Christ et à vivre selon Ses enseignements.',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
          title: 'Témoignage',
          description: 'Une déclaration publique de notre foi et de notre nouvelle vie en Christ.',
          icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
        }
      ]
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const about = await About.create(body)
    return NextResponse.json(about)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create about content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const about = await About.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
      runValidators: true
    })

    return NextResponse.json(about)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 