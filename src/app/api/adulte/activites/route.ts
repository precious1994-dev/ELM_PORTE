import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

// Define the Activities Schema
const activitiesSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  activities: [{
    title: String,
    description: String,
    image: String,
    icon: String
  }]
}, { timestamps: true })

// Get the Activities model (or create if doesn't exist)
const Activities = mongoose.models.AdulteActivities || mongoose.model('AdulteActivities', activitiesSchema)

export interface Activity {
  title: string
  description: string
  image: string
  icon: string
}

export interface ActivitiesContent {
  title: string
  subtitle: string
  description: string
  activities: Activity[]
}

export async function GET() {
  try {
    await connectToDatabase()
    const activities = await Activities.findOne().lean()
    
    return NextResponse.json(activities || {
      title: "Nos Activités",
      subtitle: "Programme",
      description: "Des activités variées pour nourrir votre foi et renforcer la communion fraternelle.",
      activities: [
        {
          title: "Études Bibliques",
          description: "Approfondissement de la Parole de Dieu en petits groupes.",
          image: "/images/adults/bible-study.jpg",
          icon: "book"
        },
        {
          title: "Groupes de Prière",
          description: "Moments de prière et d'intercession communautaire.",
          image: "/images/adults/prayer.jpg",
          icon: "pray"
        },
        {
          title: "Service Communautaire",
          description: "Engagement dans des projets de service et d'entraide.",
          image: "/images/adults/service.jpg",
          icon: "serve"
        }
      ]
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    await connectToDatabase()

    // Validate required fields
    if (!body.title || !body.subtitle || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update or create activities content
    const updatedActivities = await Activities.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true }
    )

    return NextResponse.json(updatedActivities)
  } catch (error) {
    console.error('Error updating activities:', error)
    return NextResponse.json(
      { error: 'Failed to update activities content' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 