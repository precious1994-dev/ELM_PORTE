import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

// Define the Team Schema
const teamSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  members: [{
    name: String,
    role: String,
    image: String
  }]
}, { timestamps: true })

// Get the Team model (or create if doesn't exist)
const Team = mongoose.models.AdulteTeam || mongoose.model('AdulteTeam', teamSchema)

export interface TeamMember {
  name: string
  role: string
  image: string
}

export interface TeamContent {
  title: string
  subtitle: string
  description: string
  members: TeamMember[]
}

export async function GET() {
  try {
    await connectToDatabase()
    const team = await Team.findOne().lean()
    
    return NextResponse.json(team || {
      title: "Notre Équipe",
      subtitle: "Leadership",
      description: "Une équipe dévouée au service et à l'accompagnement spirituel des adultes.",
      members: [
        {
          name: "Pierre Dumont",
          role: "Pasteur Principal",
          image: ""
        },
        {
          name: "Anne Richard",
          role: "Coordinatrice des Groupes",
          image: ""
        },
        {
          name: "Marc Lambert",
          role: "Responsable de la Formation",
          image: ""
        }
      ]
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team content' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Update or create team content
    const updatedTeam = await Team.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true }
    )

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Failed to update team content' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 