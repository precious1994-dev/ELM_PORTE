import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { BaptemeProcess } from '@/models/BaptemeModels'

export interface ProcessStep {
  title: string
  description: string
  image: string
}

export interface ProcessContent {
  mainTitle: string
  subtitle: string
  description: string
  steps: ProcessStep[]
}

export async function GET() {
  try {
    await connectToDatabase()
    const content = await BaptemeProcess.findOne({ isActive: true })

    if (!content) {
      return NextResponse.json({
        mainTitle: 'Les Étapes du Baptême',
        subtitle: 'Processus',
        description: 'Découvrez le parcours vers le baptême dans notre église.',
        steps: [
          {
            title: 'Préparation',
            description: 'Rencontres avec un responsable pour comprendre la signification du baptême.',
            image: '/images/baptism/preparation.jpg'
          },
          {
            title: 'Témoignage',
            description: 'Partage de votre expérience de foi avec la communauté.',
            image: '/images/baptism/testimony.jpg'
          },
          {
            title: 'Célébration',
            description: 'La cérémonie du baptême lors d\'un culte spécial.',
            image: '/images/baptism/celebration.jpg'
          }
        ],
        isActive: true
      })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching baptism process content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch baptism process content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const activeContent = await BaptemeProcess.findOne({ isActive: true })

    if (activeContent) {
      const updatedContent = await BaptemeProcess.findByIdAndUpdate(
        activeContent._id,
        { ...body, isActive: true },
        { new: true }
      )
      return NextResponse.json(updatedContent)
    }

    const newContent = await BaptemeProcess.create({
      ...body,
      isActive: true
    })

    return NextResponse.json(newContent)
  } catch (error) {
    console.error('Error updating baptism process content:', error)
    return NextResponse.json(
      { error: 'Failed to update baptism process content' },
      { status: 500 }
    )
  }
} 