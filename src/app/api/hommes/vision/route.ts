import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Define the Vision schema
const VisionSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  features: [{
    title: String,
    description: String
  }],
  updatedAt: { type: Date, default: Date.now }
})

// Get the Vision model (create it if it doesn't exist)
const Vision = mongoose.models.HommesVision || mongoose.model('HommesVision', VisionSchema)

export async function GET() {
  try {
    await connectToDatabase()
    const vision = await Vision.findOne().lean()
    
    if (!vision) {
      return NextResponse.json({
        title: '',
        subtitle: '',
        description: '',
        features: [
          {
            title: '',
            description: ''
          },
          {
            title: '',
            description: ''
          },
          {
            title: '',
            description: ''
          }
        ]
      })
    }

    return NextResponse.json(vision)
  } catch (error) {
    console.error('Error fetching vision:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vision' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const data = await req.json()

    const vision = await Vision.findOneAndUpdate(
      {},
      { ...data, updatedAt: new Date() },
      { upsert: true, new: true }
    ).lean()

    return NextResponse.json(vision)
  } catch (error) {
    console.error('Error updating vision:', error)
    return NextResponse.json(
      { error: 'Failed to update vision' },
      { status: 500 }
    )
  }
} 