import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import mongoose from 'mongoose'

const classSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  classes: [{
    title: String,
    ageRange: String,
    description: String,
    image: String,
    imagePublicId: String
  }]
}, { timestamps: true })

let Classes = mongoose.models.EnfantsClasses || mongoose.model('EnfantsClasses', classSchema)

export interface ClassContent {
  title: string
  subtitle: string
  description: string
  classes: {
    title: string
    ageRange: string
    description: string
    image: string
    imagePublicId?: string
  }[]
}

export async function GET() {
  try {
    await dbConnect()
    const classes = await Classes.findOne().lean()
    
    return NextResponse.json(classes || {
      title: "Nos Classes",
      subtitle: "Groupes d'Âge",
      description: "Des programmes adaptés à chaque étape du développement de l'enfant.",
      classes: [
        {
          title: "Les Petits",
          ageRange: "3-5 ans",
          description: "Découverte des histoires bibliques à travers le jeu, les chansons et les activités manuelles.",
          image: "/images/children/little-ones.jpg"
        },
        {
          title: "Les Explorateurs",
          ageRange: "6-8 ans",
          description: "Apprentissage interactif des valeurs bibliques et développement des amitiés chrétiennes.",
          image: "/images/children/explorers.jpg"
        },
        {
          title: "Les Aventuriers",
          ageRange: "9-11 ans",
          description: "Approfondissement de la foi et préparation à la transition vers le groupe des jeunes.",
          image: "/images/children/adventurers.jpg"
        }
      ]
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes content' },
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

    // Parse form data
    const formData = await request.formData()
    const content = JSON.parse(formData.get('content') as string)

    try {
      // Update or insert the classes content
      const classes = await Classes.findOneAndUpdate(
        {},
        { $set: content },
        { upsert: true, new: true, runValidators: true }
      ).lean()

      if (!classes) {
        throw new Error('Failed to update classes content')
      }

      return NextResponse.json(classes)
    } catch (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update classes in database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating classes:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update classes' },
      { status: 500 }
    )
  }
} 