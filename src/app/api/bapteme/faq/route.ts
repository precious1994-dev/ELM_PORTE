import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export interface FAQContent {
  questions: {
    question: string
    answer: string
  }[]
}

// Define the schema
const FAQSchema = new mongoose.Schema<FAQContent>({
  questions: [{
    question: String,
    answer: String
  }]
})

// Get or create model
const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema)

export async function GET() {
  try {
    await connectToDatabase()
    
    let faq = await FAQ.findOne()
    
    if (!faq) {
      // Create default content if none exists
      faq = await FAQ.create({
        questions: [
          {
            question: 'Qui peut se faire baptiser ?',
            answer: 'Toute personne ayant fait une expérience personnelle de foi en Jésus-Christ et désirant le suivre.'
          },
          {
            question: 'Quel âge faut-il avoir ?',
            answer: 'Il n\'y a pas d\'âge minimum, mais la personne doit être capable de comprendre et d\'exprimer sa foi personnellement.'
          },
          {
            question: 'Comment se déroule le baptême ?',
            answer: 'Le baptême se fait par immersion complète dans l\'eau, symbolisant notre identification à la mort et à la résurrection de Christ.'
          },
          {
            question: 'Faut-il être membre de l\'église ?',
            answer: 'Non, mais nous encourageons les nouveaux baptisés à s\'intégrer dans une communauté chrétienne pour grandir dans la foi.'
          }
        ]
      })
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const faq = await FAQ.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    )

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ content' },
      { status: 500 }
    )
  }
} 